import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Reveal } from "@/components/Reveal";
import { formatCOP, store, type Order } from "@/lib/store";
import { useUser } from "@/lib/hooks";
import { Package, Search, User } from "lucide-react";

export default function MiCuenta() {
  const user = useUser();
  const [code, setCode] = useState("");
  const [found, setFound] = useState<Order | null>(null);
  const [orders, setOrders] = useState(() => store.getOrders());

  const toggle = (v: boolean) => store.setUser({ loggedIn: v, name: v ? "Cliente Deluxe" : "Invitado" });

  const search = () => {
    const o = store.findOrder(code.trim());
    setFound(o || null);
    if (o) setOrders(store.getOrders());
  };

  return (
    <>
      <Helmet><title>Mi Cuenta — Floristería Deluxe</title></Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <User className="w-10 h-10 text-rose-deep mx-auto" />
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic mt-2">Mi Cuenta</h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        <Reveal direction="left">
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
            <h2 className="font-serif text-burgundy text-xl italic">Sesión</h2>
            <div className="mt-4 flex items-center justify-between bg-rose-soft rounded-xl p-3">
              <div>
                <p className="text-xs text-rose-deep uppercase tracking-widest">Estado</p>
                <p className="font-serif text-burgundy">{user.loggedIn ? user.name : "Invitado"}</p>
              </div>
              <Switch checked={user.loggedIn} onCheckedChange={toggle} />
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Login real con email / Google llegará con la integración a Supabase. Por ahora puedes simular tu sesión.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up">
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft md:col-span-2">
            <h2 className="font-serif text-burgundy text-xl italic flex items-center gap-2"><Search className="w-5 h-5" /> Rastrear pedido</h2>
            <div className="mt-4 flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ej. DLX-4821" className="uppercase" />
              <Button onClick={search} className="bg-burgundy hover:bg-burgundy-light text-primary-foreground">Buscar</Button>
            </div>
            {code && found === null && (
              <p className="text-sm text-muted-foreground mt-3 italic">No encontramos ningún pedido con ese código.</p>
            )}
            {found && (
              <div className="mt-5 bg-rose-soft rounded-2xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-serif text-burgundy text-lg">{found.code}</p>
                  <span className="text-xs bg-burgundy text-primary-foreground px-3 py-1 rounded-full">{found.status}</span>
                </div>
                <ul className="mt-3 text-sm space-y-1">
                  {found.items.map((i) => (
                    <li key={i.productId} className="flex justify-between text-foreground/80">
                      <span>{i.title} × {i.qty}</span>
                      <span>{formatCOP(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-rose-mid/40 mt-3 pt-3 flex justify-between font-semibold text-burgundy">
                  <span>Total</span><span>{formatCOP(found.total)}</span>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <div className="md:col-span-3 bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
            <h2 className="font-serif text-burgundy text-xl italic flex items-center gap-2"><Package className="w-5 h-5" /> Historial de pedidos</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-4 italic">Aún no has hecho pedidos. ¡Explora la tienda!</p>
            ) : (
              <ul className="mt-4 divide-y divide-border/60">
                {orders.map((o) => (
                  <li key={o.code} className="py-3 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-serif text-burgundy">{o.code}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("es-CO")} · {o.items.length} ítems</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-burgundy">{formatCOP(o.total)}</span>
                      <span className="text-xs bg-rose-soft text-rose-deep px-3 py-1 rounded-full">{o.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
