// Bold "Botón de Pagos" — generador de hash de integridad.
// Despliega con:  supabase functions deploy bold-sign
// Variables de entorno requeridas (Supabase → Project Settings → Edge Functions → Secrets):
//   BOLD_IDENTITY_KEY   = llave de identidad (pública) de Bold
//   BOLD_SECRET_KEY     = llave secreta de Bold (NUNCA en el frontend)
//   PUBLIC_SITE_URL     = ej. https://floristeriadeluxe.com
//
// Doc: https://developers.bold.co/pagos-en-linea/boton-de-pagos

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Body {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  customer?: { name?: string; email?: string; phone?: string };
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const IDENTITY = Deno.env.get("BOLD_IDENTITY_KEY");
    const SECRET = Deno.env.get("BOLD_SECRET_KEY");
    const SITE = Deno.env.get("PUBLIC_SITE_URL") ?? "";
    if (!IDENTITY || !SECRET) {
      return new Response(JSON.stringify({ error: "BOLD_IDENTITY_KEY / BOLD_SECRET_KEY no configuradas" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = (await req.json()) as Body;
    if (!body.orderId || !body.amount || body.amount <= 0) {
      return new Response(JSON.stringify({ error: "orderId y amount requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const currency = body.currency ?? "COP";

    // Bold checkout: integritySignature = SHA256(orderId + amount + currency + secretKey)
    const integritySignature = await sha256Hex(`${body.orderId}${body.amount}${currency}${SECRET}`);

    // Devolvemos los parámetros para que el frontend monte el botón Bold o navegue al checkout hospedado.
    // Si prefieres redireccionar, monta el HTML con los data-attributes oficiales y devuelve la URL.
    return new Response(JSON.stringify({
      identityKey: IDENTITY,
      orderId: body.orderId,
      amount: body.amount,
      currency,
      integritySignature,
      description: body.description ?? `Pedido ${body.orderId}`,
      redirectionUrl: `${SITE}/mi-cuenta?tab=orders&order=${body.orderId}`,
      // url: opcional — si quieres redirección directa al checkout de Bold:
      // url: `https://checkout.bold.co/...?...`
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});