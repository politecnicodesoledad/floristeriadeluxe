// Bold — API de Links de Pago.
// Despliega con:  supabase functions deploy bold-sign
//
// Variables de entorno (Supabase → Project Settings → Edge Functions → Secrets):
//   BOLD_IDENTITY_KEY  = dMTrm3xHSPLuQmfltK6sVp9IeH__xGJbPgWog0dOETY
//   PUBLIC_SITE_URL    = https://floristeriadeluxe.com  (o tu dominio)
//
// Doc: https://developers.bold.co/pagos-en-linea/api-link-de-pagos

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  customer?: { name?: string; email?: string; phone?: string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const IDENTITY = Deno.env.get("BOLD_IDENTITY_KEY");
    const SITE = Deno.env.get("PUBLIC_SITE_URL") ?? "https://floristeriadeluxe.com";

    if (!IDENTITY) {
      return json({ error: "Falta BOLD_IDENTITY_KEY en los secrets de Supabase" }, 500);
    }

    const body = (await req.json()) as Body;

    if (!body.orderId || !body.amount || body.amount <= 0) {
      return json({ error: "orderId y amount son requeridos" }, 400);
    }

    const currency = body.currency ?? "COP";
    const description = (body.description ?? `Pedido ${body.orderId}`).slice(0, 100);

    const payload = {
      amount_type: "CLOSE",
      amount: {
        currency,
        total_amount: body.amount,
        tip_amount: 0,
      },
      reference: `${body.orderId}-${Date.now()}`.slice(0, 60),
      description,
      callback_url: `${SITE}/mi-cuenta?tab=orders&order=${body.orderId}`,
      ...(body.customer?.email ? { payer_email: body.customer.email } : {}),
    };

    const res = await fetch("https://integrations.api.bold.co/online/link/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `x-api-key ${IDENTITY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data?.errors?.length) {
      return json({ error: "Bold rechazó la solicitud", details: data }, 502);
    }

    const url = data?.payload?.url;
    if (!url) {
      return json({ error: "Bold no devolvió un link de pago", details: data }, 502);
    }

    return json({
      orderId: body.orderId,
      amount: body.amount,
      currency,
      url,
      paymentLink: data.payload.payment_link,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
