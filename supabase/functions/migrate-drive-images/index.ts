import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const DRIVE_ROOT_DEFAULT = "1lfIm7f0A0-D_I3M8a7KdHwEVgFIBNvUY";
const BUCKET = "product-images";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

type RequestBody = {
  rootFolderId?: string;
  dryRun?: boolean;
  limit?: number;
};

type ProductRow = {
  id: string;
  title: string;
  image: string;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

function gatewayHeaders() {
  return {
    Authorization: `Bearer ${requireEnv("LOVABLE_API_KEY")}`,
    "X-Connection-Api-Key": requireEnv("GOOGLE_DRIVE_API_KEY"),
  };
}

function basenameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "");
  } catch {
    return decodeURIComponent(url.split("/").pop() ?? url);
  }
}

function stripWooSize(name: string): string {
  return name.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1");
}

function normalizeName(name: string): string {
  return decodeURIComponent(name).trim().toLowerCase();
}

function contentTypeFor(name: string): string {
  const ext = name.toLowerCase().split(".").pop();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

async function listChildren(folderId: string): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url = `${GATEWAY_URL}/files?q=${q}&fields=nextPageToken,files(id,name,mimeType)&pageSize=1000${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const response = await fetch(url, { headers: gatewayHeaders() });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Drive list failed (${response.status}): ${text}`);
    }
    const json = JSON.parse(text) as { files?: DriveFile[]; nextPageToken?: string };
    files.push(...(json.files ?? []));
    pageToken = json.nextPageToken;
  } while (pageToken);

  return files;
}

async function buildDriveIndex(rootFolderId: string) {
  const byName = new Map<string, DriveFile[]>();
  const queue = [rootFolderId];
  let folderCount = 0;
  let fileCount = 0;

  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    folderCount += 1;
    const children = await listChildren(current);

    for (const file of children) {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        queue.push(file.id);
        continue;
      }

      fileCount += 1;
      const key = normalizeName(file.name);
      const existing = byName.get(key) ?? [];
      existing.push(file);
      byName.set(key, existing);
    }
  }

  return { byName, folderCount, fileCount };
}

function pickDriveFile(index: Map<string, DriveFile[]>, imageUrl: string): DriveFile | null {
  const raw = basenameFromUrl(imageUrl);
  const lower = normalizeName(raw);
  const stripped = normalizeName(stripWooSize(raw));
  return index.get(lower)?.[0] ?? index.get(stripped)?.[0] ?? null;
}

async function downloadDriveFile(fileId: string): Promise<Uint8Array> {
  const response = await fetch(`${GATEWAY_URL}/files/${fileId}?alt=media`, {
    headers: gatewayHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Drive download failed (${response.status}) for ${fileId}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      requireEnv("SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } },
    );

    let body: RequestBody = {};
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      body = {};
    }

    const rootFolderId = body.rootFolderId ?? DRIVE_ROOT_DEFAULT;
    const dryRun = body.dryRun === true;
    const limit = typeof body.limit === "number" ? body.limit : 9999;

    const { byName, folderCount, fileCount } = await buildDriveIndex(rootFolderId);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id,title,image")
      .or("image.ilike.%floristeriadeluxe.com%,image.ilike.%108.167.149.240%")
      .limit(limit);

    if (productsError) throw productsError;

    const matched: Array<{ id: string; title: string; basename: string; driveName: string }> = [];
    const notFound: Array<{ id: string; title: string; basename: string }> = [];
    const failed: Array<{ id: string; title: string; error: string }> = [];
    let uploaded = 0;

    for (const product of (products ?? []) as ProductRow[]) {
      const hit = pickDriveFile(byName, product.image);
      const basename = basenameFromUrl(product.image);

      if (!hit) {
        notFound.push({ id: product.id, title: product.title, basename });
        continue;
      }

      matched.push({ id: product.id, title: product.title, basename, driveName: hit.name });
      if (dryRun) continue;

      try {
        const bytes = await downloadDriveFile(hit.id);
        const objectPath = `${product.id}-${hit.name}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(objectPath, bytes, {
            contentType: contentTypeFor(hit.name),
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
        const { error: updateError } = await supabase
          .from("products")
          .update({ image: publicData.publicUrl })
          .eq("id", product.id);

        if (updateError) throw updateError;
        uploaded += 1;
      } catch (error) {
        failed.push({ id: product.id, title: product.title, error: String(error) });
      }
    }

    return new Response(
      JSON.stringify(
        {
          ok: true,
          dryRun,
          drive: { folderCount, fileCount },
          products: products?.length ?? 0,
          matched: matched.length,
          uploaded,
          notFoundCount: notFound.length,
          failedCount: failed.length,
          notFound: notFound.slice(0, 50),
          failed,
        },
        null,
        2,
      ),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});