// Bold webhook: recibe notificaciones de pago aprobado/rechazado y actualiza el pedido.
// Despliega con:  supabase functions deploy bold-webhook --no-verify-jwt
// En el panel de Bold configura el webhook apuntando a:
//   https://<TU-PROYECTO>.supabase.co/functions/v1/bold-webhook
//
// Variables requeridas:
//   BOLD_SECRET_KEY        (para validar firma si la usas)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (necesario para escribir orders bypaseando RLS)

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const payload = await req.json();

    // Estructura típica de Bold webhook (ajusta según el tipo de evento):
    //   { type: 'SALE_APPROVED', data: { metadata: { reference: 'DLX-1234' }, payment_id: 'xxx' } }
    const orderCode = payload?.data?.metadata?.reference ?? payload?.metadata?.reference;
    const eventType = payload?.type ?? payload?.event;
    const paymentId = payload?.data?.payment_id ?? payload?.id;
    if (!orderCode) {
      return new Response(JSON.stringify({ ok: false, reason: "no order reference" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const paid = String(eventType).toUpperCase().includes("APPROVED");
    const failed = String(eventType).toUpperCase().includes("REJECTED") || String(eventType).toUpperCase().includes("FAILED");

    const update: Record<string, unknown> = { bold_order_id: paymentId ?? null };
    if (paid) { update.payment_status = "paid"; update.status = "En preparación"; }
    if (failed) update.payment_status = "failed";

    const { error } = await supabase.from("orders").update(update).eq("code", orderCode);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});