import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart, useProducts } from "@/lib/hooks";
import { formatCOP, generateTrackingCode, store, WHATSAPP_NUMBER } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CreditCard, MessageCircle, Tag, Loader2 } from "lucide-react";
import { BoldPaymentDialog } from "@/components/BoldPaymentDialog";

export default function Checkout() {
  const { items } = useCart();
  const { products } = useProducts();
  const { user, profile } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [ship, setShip] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Barranquilla");
  const [notes, setNotes] = useState("");
  const [dedicatoria, setDedicatoria] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [loading, setLoading] = useState<null | "wa" | "bold">(null);
  const [boldStartedAt, setBoldStartedAt] = useState<number | null>(null);

  useEffect(() => { setName(profile?.full_name || ""); setPhone(profile?.phone || ""); setEmail(user?.email || ""); }, [profile, user]);

  const lines = useMemo(() => items.map((i) => {
    const p = products.find((x) => x.id === i.productId);
    return p ? { ...i, product: p } : null;
  }).filter(Boolean) as { productId: string; qty: number; product: typeof products[number] }[], [items, products]);

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discountAmount = discount ? Math.round(subtotal * (discount.percent / 100)) : 0;
  const total = subtotal - discountAmount;

  const applyCoupon = async () => {
    const c = await store.applyCoupon(coupon);
    if (!c) { setDiscount(null); return toast.error("Cupón inválido o expirado"); }
    setDiscount({ code: c.code, percent: c.discount_percent });
    toast.success(`Cupón ${c.code} aplicado: -${c.discount_percent}%`);
  };

  const validate = () => {
    if (lines.length === 0) { toast.error("Tu carrito está vacío"); return false; }
    if (!name.trim()) { toast.error("Falta tu nombre"); return false; }
    if (!phone.trim()) { toast.error("Falta el teléfono"); return false; }
    return true;
  };

  const buildOrder = () => {
    const code = generateTrackingCode();
    return {
      code,
      items: lines.map((l) => ({ productId: l.productId, title: l.product.title, qty: l.qty, price: l.product.price })),
      total, subtotal, discount: discountAmount, coupon_code: discount?.code ?? null,
      dedicatoria: dedicatoria || undefined,
      customer: { name, phone, address: ship ? `${address}, ${city}` : undefined },
      shipping_address: ship ? { address, city, notes } : null,
      status: "Recibido" as const,
      createdAt: Date.now(),
    };
  };

  const payWhatsApp = async () => {
    if (!validate()) return;
    setLoading("wa");
    const order = buildOrder();
    await store.addOrder({ ...order, payment_method: "whatsapp", payment_status: "pending" });
    const summary = order.items.map((i, idx) => `${idx + 1}. ${i.title} x${i.qty} — ${formatCOP(i.price * i.qty)}`).join("\n");
    const dedi = order.dedicatoria ? `\n📝 *Dedicatoria:* ${order.dedicatoria}` : "";
    const ship = order.shipping_address ? `\n📍 *Envío:* ${address}, ${city}${notes ? ` (${notes})` : ""}` : "";
    const text = `Hola Floristería Deluxe 🌷\nSoy ${name} (${phone}).\n\n${summary}\n\n*Subtotal:* ${formatCOP(subtotal)}${discount ? `\n*Cupón ${discount.code}:* -${formatCOP(discountAmount)}` : ""}\n*Total:* ${formatCOP(total)}\n*Código:* ${order.code}${dedi}${ship}`;
    store.clearCart();
    setLoading(null);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    toast.success(`Pedido ${order.code} registrado`);
    nav("/mi-cuenta?tab=orders");
  };

  const payBold = async () => {
    if (!validate()) return;
    if (!ship) return toast.error("Para pagar virtual debes indicar la dirección de envío");
    setLoading("bold");
    const order = buildOrder();
    await store.addOrder({ ...order, payment_method: "bold", payment_status: "pending" });
    setBoldStartedAt(Date.now());
    // Intentamos invocar la edge function bold-sign (debe estar desplegada en Supabase)
    try {
      const { data, error } = await supabase.functions.invoke("bold-sign", {
        body: { orderId: order.code, amount: total, currency: "COP", description: `Pedido ${order.code}`, customer: { name, email, phone } },
      });
      if (error || !data?.url) throw error || new Error("Sin URL");
      store.clearCart();
      window.location.href = data.url;
    } catch (e: any) {
      setLoading(null);
      toast.error("Pago en línea aún no disponible", {
        description: "El backend de Bold no está desplegado. Te llevamos a completarlo por WhatsApp.",
        duration: 6000,
      });
      setTimeout(payWhatsApp, 1200);
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
            <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
              <h2 className="font-serif text-burgundy text-lg italic mb-4">Detalles de la factura</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo *" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono *" />
                <Input className="sm:col-span-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={ship} onCheckedChange={(v) => setShip(!!v)} />
                <span className="font-serif text-burgundy">Agregar dirección de envío</span>
              </label>
              {ship && (
                <div className="mt-4 space-y-3">
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección completa *" />
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" />
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas para el repartidor (referencia, piso, hora preferida...)" rows={2} />
                </div>
              )}
            </div>

            <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
              <h2 className="font-serif text-burgundy text-lg italic mb-2">Dedicatoria (opcional)</h2>
              <Textarea value={dedicatoria} onChange={(e) => setDedicatoria(e.target.value)} placeholder="¿Quieres que escribamos un mensaje en una tarjetita?" rows={3} />
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