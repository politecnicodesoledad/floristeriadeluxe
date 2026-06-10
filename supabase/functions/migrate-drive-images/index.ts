// One-shot migration: download product images from Google Drive (via Lovable
// connector gateway) and upload them to the public Supabase storage bucket
// `product-images`, then update `products.image` with the new public URL.
//
// Trigger:  POST <function-url>     (no body needed)
// Optional body: { "rootFolderId": "...", "dryRun": true, "limit": 20 }
//
// Required env vars (auto-injected on Lovable Cloud):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   LOVABLE_API_KEY, GOOGLE_DRIVE_API_KEY  (from connector)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DRIVE_ROOT_DEFAULT = "1lfIm7f0A0-D_I3M8a7KdHwEVgFIBNvUY";
const BUCKET = "product-images";

const GW = "https://connector-gateway.lovable.dev/google_drive/drive/v3";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const DRIVE_KEY = Deno.env.get("GOOGLE_DRIVE_API_KEY")!;

function gwHeaders() {
  return {
    Authorization: `Bearer ${LOVABLE_KEY}`,
    "X-Connection-Api-Key": DRIVE_KEY,
  };
}

type DriveFile = { id: string; name: string; mimeType: string };

async function listChildren(folderId: string): Promise<DriveFile[]> {
  const out: DriveFile[] = [];
  let pageToken: string | undefined = undefined;
  do {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const url =
      `${GW}/files?q=${q}&fields=nextPageToken,files(id,name,mimeType)&pageSize=1000` +
      (pageToken ? `&pageToken=${pageToken}` : "");
    const res = await fetch(url, { headers: gwHeaders() });
    if (!res.ok) throw new Error(`drive list ${folderId}: ${res.status} ${await res.text()}`);
    const j = await res.json();
    out.push(...(j.files ?? []));
    pageToken = j.nextPageToken;
  } while (pageToken);
  return out;
}

async function buildIndex(rootId: string) {
  // BFS over folders, collecting every non-folder file by basename.
  const byName = new Map<string, DriveFile>();
  const queue: string[] = [rootId];
  let folderCount = 0;
  let fileCount = 0;
  while (queue.length) {
    const batch = queue.splice(0, 8); // small parallelism
    const results = await Promise.all(batch.map((id) => listChildren(id).catch((e) => {
      console.warn("listChildren failed", id, e);
      return [] as DriveFile[];
    })));
    folderCount += batch.length;
    for (const files of results) {
      for (const f of files) {
        if (f.mimeType === "application/vnd.google-apps.folder") {
          queue.push(f.id);
        } else {
          fileCount++;
          // last write wins; that's fine
          byName.set(f.name.toLowerCase(), f);
        }
      }
    }
  }
  return { byName, folderCount, fileCount };
}

function basenameFromUrl(u: string): string {
  try {
    const path = new URL(u).pathname;
    const last = path.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(last);
  } catch {
    return u.split("/").pop() ?? "";
  }
}

// WooCommerce auto-generates "-300x300", "-768x1024" etc. Strip them.
function stripWooSize(name: string): string {
  return name.replace(/-\d+x\d+(\.[a-z]+)$/i, "$1");
}

function contentTypeFor(name: string): string {
  const ext = name.toLowerCase().split(".").pop();
  switch (ext) {
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    case "gif": return "image/gif";
    case "avif": return "image/avif";
    default: return "application/octet-stream";
  }
}

async function downloadDriveFile(fileId: string): Promise<Uint8Array> {
  const res = await fetch(`${GW}/files/${fileId}?alt=media`, { headers: gwHeaders() });
  if (!res.ok) throw new Error(`download ${fileId}: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  let body: { rootFolderId?: string; dryRun?: boolean; limit?: number } = {};
  try { body = await req.json(); } catch { /* empty body */ }

  const rootId = body.rootFolderId ?? DRIVE_ROOT_DEFAULT;
  const dryRun = !!body.dryRun;
  const limit = body.limit ?? 9999;

  try {
    // 1) Index Drive
    console.log("Indexing Drive folder", rootId);
    const { byName, folderCount, fileCount } = await buildIndex(rootId);
    console.log(`Indexed ${fileCount} files across ${folderCount} folders`);

    // 2) Get products needing migration
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id,image,title")
      .or("image.ilike.%floristeriadeluxe.com%,image.ilike.%108.167.149.240%")
      .limit(limit);
    if (prodErr) throw prodErr;

    const matched: any[] = [];
    const notFound: any[] = [];
    const failed: any[] = [];
    let uploaded = 0;

    for (const p of products ?? []) {
      const raw = basenameFromUrl(p.image);
      const lower = raw.toLowerCase();
      const stripped = stripWooSize(lower);
      const hit = byName.get(lower) ?? byName.get(stripped);
      if (!hit) {
        notFound.push({ id: p.id, title: p.title, basename: raw });
        continue;
      }
      matched.push({ id: p.id, title: p.title, basename: raw, driveName: hit.name });
      if (dryRun) continue;

      try {
        const bytes = await downloadDriveFile(hit.id);
        const finalName = `${p.id}-${hit.name}`;
        const ct = contentTypeFor(hit.name);
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(finalName, bytes, { contentType: ct, upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(finalName);
        const { error: updErr } = await supabase
          .from("products")
          .update({ image: pub.publicUrl })
          .eq("id", p.id);
        if (updErr) throw updErr;
        uploaded++;
      } catch (e) {
        failed.push({ id: p.id, title: p.title, error: String(e) });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      drive: { folderCount, fileCount },
      products: products?.length ?? 0,
      matched: matched.length,
      uploaded,
      notFoundCount: notFound.length,
      failedCount: failed.length,
      notFound: notFound.slice(0, 50),
      failed,
    }, null, 2), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});