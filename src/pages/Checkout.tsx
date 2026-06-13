import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart, useProducts } from "@/lib/hooks";
import { formatCOP, generateTrackingCode, store, WHATSAPP_NUMBER, type DeliveryZone } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CreditCard, MessageCircle, Tag, Loader2, MapPin, Calendar, Clock, User, Gift } from "lucide-react";
import { BoldPaymentDialog } from "@/components/BoldPaymentDialog";

const BOLD_API_KEY = "dMTrm3xHSPLuQmfltK6sVp9IeH__xGJbPgWog0dOETY";

export default function Checkout() {
  const { items } = useCart();
  const { products } = useProducts();
  const { user, profile } = useAuth();
  const nav = useNavigate();

  // Datos del comprador
  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  // Envío
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Nuevos campos de envío
  const [senderName, setSenderName] = useState("");       // De (opcional)
  const [recipientName, setRecipientName] = useState(""); // Para
  const [deliveryDate, setDeliveryDate] = useState("");   // Fecha
  const [deliveryTime, setDeliveryTime] = useState<"8-13" | "14-18" | "">("");
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [otherZone, setOtherZone] = useState("");         // Zona "Otro"
  const [showOtherZone, setShowOtherZone] = useState(false);

  // Dedicatoria
  const [dedicatoria, setDedicatoria] = useState("");

  // Cupón / descuento
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);

  const [loading, setLoading] = useState<null | "wa" | "bold">(null);
  const [boldStartedAt, setBoldStartedAt] = useState<number | null>(null);

  // Fecha mínima = mañana
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    setName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setEmail(user?.email || "");
  }, [profile, user]);

  useEffect(() => {
    store.fetchDeliveryZones().then((z) => setZones(z.filter((x) => x.active)));
  }, []);

  const lines = useMemo(() => items.map((i) => {
    const p = products.find((x) => x.id === i.productId);
    return p ? { ...i, product: p } : null;
  }).filter(Boolean) as { productId: string; qty: number; product: typeof products[number] }[], [items, products]);

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discountAmount = discount ? Math.round(subtotal * (discount.percent / 100)) : 0;
  const deliveryCost = selectedZone?.price ?? 0;
  const total = subtotal - discountAmount + deliveryCost;

  const applyCoupon = async () => {
    const c = await store.applyCoupon(coupon);
    if (!c) { setDiscount(null); return toast.error("Cupón inválido o expirado"); }
    setDiscount({ code: c.code, percent: c.discount_percent });
    toast.success(`Cupón ${c.code} aplicado: -${c.discount_percent}%`);
  };

  const handleZoneChange = (val: string) => {
    if (val === "__otro__") {
      setSelectedZone(null);
      setShowOtherZone(true);
      return;
    }
    setShowOtherZone(false);
    setOtherZone("");
    const z = zones.find((z) => z.id === val) ?? null;
    setSelectedZone(z);
  };

  const validate = () => {
    if (lines.length === 0) { toast.error("Tu carrito está vacío"); return false; }
    if (!name.trim()) { toast.error("Falta tu nombre"); return false; }
    if (!phone.trim()) { toast.error("Falta el teléfono"); return false; }
    if (!recipientName.trim()) { toast.error("Falta el nombre del destinatario (Para)"); return false; }
    if (!deliveryDate) { toast.error("Selecciona la fecha de entrega"); return false; }
    if (!deliveryTime) { toast.error("Selecciona la franja horaria"); return false; }
    if (!selectedZone && !showOtherZone) { toast.error("Selecciona la zona de envío"); return false; }
    if (showOtherZone && !otherZone.trim()) { toast.error("Indica tu zona de envío"); return false; }
    return true;
  };

  const productUrl = (productId: string) =>
    `${window.location.origin}/producto/${productId}`;

  const buildOrder = () => {
    const code = generateTrackingCode();
    const zoneName = showOtherZone ? `Otro: ${otherZone}` : (selectedZone?.name ?? "");
    return {
      code,
      items: lines.map((l) => ({
        productId: l.productId,
        title: l.product.title,
        qty: l.qty,
        price: l.product.price,
        productUrl: productUrl(l.productId),
      })),
      total, subtotal, discount: discountAmount, coupon_code: discount?.code ?? null,
      dedicatoria: dedicatoria || undefined,
      sender_name: senderName || undefined,
      recipient_name: recipientName,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime as "8-13" | "14-18",
      delivery_zone: zoneName,
      delivery_cost: deliveryCost,
      customer: { name, phone, address: address ? `${address}` : undefined },
      shipping_address: { address, notes, zone: zoneName },
      status: "Recibido" as const,
      createdAt: Date.now(),
    };
  };

  const timeLabel = (t: string) => t === "8-13" ? "8:00 am – 1:00 pm" : "2:00 pm – 6:00 pm";

  const payWhatsApp = async () => {
    if (!validate()) return;
    setLoading("wa");
    const order = buildOrder();
    await store.addOrder({ ...order, payment_method: "whatsapp", payment_status: "pending" });

    const productLinks = order.items.map((i, idx) =>
      `${idx + 1}. ${i.title} x${i.qty} — ${formatCOP(i.price * i.qty)}\n   🔗 ${i.productUrl}`
    ).join("\n");

    const dedi = order.dedicatoria ? `\n📝 *Dedicatoria:* ${order.dedicatoria}` : "";
    const sender = order.sender_name ? `\n👤 *De:* ${order.sender_name}` : "";
    const recipient = `\n🎁 *Para:* ${order.recipient_name}`;
    const date = `\n📅 *Fecha entrega:* ${new Date(order.delivery_date + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
    const time = `\n🕐 *Franja:* ${timeLabel(order.delivery_time!)}`;
    const zone = `\n📍 *Zona:* ${order.delivery_zone}${order.delivery_cost ? ` — ${formatCOP(order.delivery_cost!)}` : ""}`;
    const addr = address ? `\n🏠 *Dirección:* ${address}${notes ? ` (${notes})` : ""}` : "";

    const text = `Hola Floristería Deluxe 🌷\nSoy ${name} (${phone}).\n\n${productLinks}\n\n*Subtotal:* ${formatCOP(subtotal)}${discount ? `\n*Cupón ${discount.code}:* -${formatCOP(discountAmount)}` : ""}${deliveryCost ? `\n*Domicilio:* ${formatCOP(deliveryCost)}` : ""}\n*Total:* ${formatCOP(total)}\n*Código:* ${order.code}${sender}${recipient}${date}${time}${zone}${addr}${dedi}`;

    store.clearCart();
    setLoading(null);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    toast.success(`Pedido ${order.code} registrado`);
    nav("/mi-cuenta?tab=orders");
  };

  const payBold = async () => {
    if (!validate()) return;
    setLoading("bold");
    const order = buildOrder();
    await store.addOrder({ ...order, payment_method: "bold", payment_status: "pending" });
    setBoldStartedAt(Date.now());

    try {
      // Integración real Bold — crear preferencia de pago
      const boldPayload = {
        orderId: order.code,
        currency: "COP",
        amount: {
          subtotal: total,
          taxes: [],
          tip: 0,
        },
        customer: { fullName: name, email: email || `cliente@floristeriadeluxe.co`, phone },
        payment: {
          allowedPaymentMethods: ["CARD", "NEQUI", "PSE", "BANCOLOMBIA_TRANSFER"],
        },
        redirectionUrl: `${window.location.origin}/mi-cuenta?tab=orders`,
        signature: {
          algorithm: "sha256",
          deviceFingerprint: navigator.userAgent.slice(0, 50),
        },
      };

      const res = await fetch("https://checkout.bold.co/api/payment_intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `x-api-key ${BOLD_API_KEY}`,
        },
        body: JSON.stringify(boldPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const url = data?.payment_link || data?.url || data?.checkout_url;
        if (url) {
          store.clearCart();
          window.location.href = url;
          return;
        }
      }

      // Si la API directa falla, intentar la edge function de Supabase
      const { data: fnData, error: fnError } = await supabase.functions.invoke("bold-sign", {
        body: {
          orderId: order.code,
          amount: total,
          currency: "COP",
          description: `Pedido ${order.code}`,
          customer: { name, email, phone },
          apiKey: BOLD_API_KEY,
        },
      });

      if (!fnError && fnData?.url) {
        store.clearCart();
        window.location.href = fnData.url;
        return;
      }

      throw new Error("No se pudo generar el link de pago Bold");
    } catch (e: any) {
      setLoading(null);
      toast.error("Pago Bold no disponible en este momento", {
        description: "Te llevaremos a completarlo por WhatsApp.",
        duration: 5000,
      });
      setTimeout(payWhatsApp, 1500);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-burgundy italic">Tu carrito está vacío</h1>
        <Link to="/tienda" className="inline-block mt-5 text-burgundy underline">← Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Finalizar compra — Floristería Deluxe</title></Helmet>
      <section className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-serif text-3xl md:text-4xl text-burgundy italic">Finalizar compra</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user ? "Datos pre-llenados desde tu cuenta ✨" : <>¿Ya tienes cuenta? <Link to="/login" className="text-burgundy underline">Inicia sesión</Link></>}
        </p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6 mt-6">
          {/* Form */}
          <div className="space-y-4">

            {/* Datos del comprador */}
            <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
              <h2 className="font-serif text-burgundy text-lg italic mb-4">Tus datos</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo *" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Tu teléfono *" />
                <Input className="sm:col-span-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email" />
              </div>
            </div>

            {/* Datos de envío */}
            <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
              <h2 className="font-serif text-burgundy text-lg italic mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Datos de envío
              </h2>
              <div className="space-y-3">

                {/* De / Para */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="De: tu nombre (opcional)"
                    />
                  </div>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Para: nombre del destinatario *"
                    />
                  </div>
                </div>

                {/* Fecha de entrega */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    className="pl-9"
                    min={minDate}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>

                {/* Franja horaria */}
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <Select value={deliveryTime} onValueChange={(v) => setDeliveryTime(v as "8-13" | "14-18")}>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Franja horaria de entrega *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8-13">8:00 am – 1:00 pm</SelectItem>
                      <SelectItem value="14-18">2:00 pm – 6:00 pm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Zona de envío */}
                <Select
                  value={showOtherZone ? "__otro__" : (selectedZone?.id ?? "")}
                  onValueChange={handleZoneChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zona de envío *" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.length === 0 && (
                      <SelectItem value="__none__" disabled>Sin zonas configuradas aún</SelectItem>
                    )}
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name} — {formatCOP(z.price)}
                      </SelectItem>
                    ))}
                    <SelectItem value="__otro__">Otro — ¿cuál?</SelectItem>
                  </SelectContent>
                </Select>

                {showOtherZone && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                    <p className="text-amber-800 font-medium mb-2">Cuéntanos tu zona para que te digamos la tarifa</p>
                    <Input
                      value={otherZone}
                      onChange={(e) => setOtherZone(e.target.value)}
                      placeholder="Ej: Puerto Colombia, Malambo, La Playa..."
                      className="bg-white"
                    />
                    <p className="text-amber-700 text-xs mt-2">
                      Nos pondremos en contacto contigo por WhatsApp para confirmarte la tarifa antes de despachar. 🌸
                    </p>
                  </div>
                )}

                {/* Dirección */}
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección de entrega *" />
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Referencias (barrio, piso, color de casa...)" rows={2} />
              </div>
            </div>

            {/* Dedicatoria */}
            <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
              <h2 className="font-serif text-burgundy text-lg italic mb-2">Dedicatoria (opcional)</h2>
              <Textarea
                value={dedicatoria}
                onChange={(e) => setDedicatoria(e.target.value)}
                placeholder="¿Quieres que escribamos un mensaje en la tarjetita? Ej: «Te amo mucho, feliz cumpleaños 🌸»"
                rows={3}
              />
            </div>
          </div>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
              <h2 className="font-serif text-burgundy text-lg italic mb-3">Tu pedido</h2>
              <ul className="divide-y divide-border/60 text-sm">
                {lines.map((l) => (
                  <li key={l.productId} className="flex justify-between py-2 gap-2">
                    <span className="text-foreground/80 line-clamp-1">{l.product.title} × {l.qty}</span>
                    <span className="font-medium text-burgundy shrink-0">{formatCOP(l.product.price * l.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Código de cupón" className="uppercase" />
                <Button onClick={applyCoupon} variant="outline" className="border-burgundy text-burgundy"><Tag className="w-3.5 h-3.5 mr-1" />Aplicar</Button>
              </div>

              <div className="mt-4 space-y-1.5 text-sm border-t border-border/60 pt-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-burgundy">{formatCOP(subtotal)}</span></div>
                {discount && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento ({discount.code})</span><span>-{formatCOP(discountAmount)}</span>
                  </div>
                )}
                {deliveryCost > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Domicilio ({selectedZone?.name})</span><span>{formatCOP(deliveryCost)}</span>
                  </div>
                )}
                {showOtherZone && (
                  <div className="flex justify-between text-amber-600 text-xs italic">
                    <span>Domicilio zona especial</span><span>Por confirmar</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-burgundy text-lg pt-2 border-t border-border/60">
                  <span>Total</span><span className="font-semibold">{formatCOP(total)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Button onClick={payBold} disabled={loading !== null} className="w-full bg-burgundy hover:bg-burgundy-light text-primary-foreground h-12">
                  {loading === "bold" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" /> Pagar en línea con Bold</>}
                </Button>
                <Button onClick={payWhatsApp} disabled={loading !== null} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12">
                  {loading === "wa" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageCircle className="w-4 h-4 mr-2" /> Confirmar por WhatsApp</>}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground italic pt-1">
                  Al confirmar aceptas nuestros <Link to="/terminos" className="underline">Términos</Link> y la <Link to="/privacidad" className="underline">Privacidad</Link>.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <BoldPaymentDialog startedAt={boldStartedAt} onClose={() => setBoldStartedAt(null)} />
    </>
  );
}
