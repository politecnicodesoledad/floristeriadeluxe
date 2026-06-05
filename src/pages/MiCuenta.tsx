import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Reveal } from "@/components/Reveal";
import { formatCOP, store, type Order } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Package, Search, User, MapPin, Settings, Plus, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

type Address = { id: string; label: string; recipient: string; phone: string | null; address: string; city: string | null; notes: string | null; is_default: boolean };

export default function MiCuenta() {
  const { user, profile, signOut, reload } = useAuth();
  const [code, setCode] = useState("");
  const [found, setFound] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) store.fetchUserOrders(user.id).then(setOrders);
  }, [user]);

  const search = async () => {
    if (!code.trim()) return;
    const o = await store.findOrderRemote(code.trim());
    setFound(o || null);
    if (!o) toast.error("No encontramos ese pedido");
  };

  return (
    <>
      <Helmet><title>Mi Cuenta — Floristería Deluxe</title></Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <User className="w-10 h-10 text-rose-deep mx-auto" />
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic mt-2">
            Hola, {profile?.full_name?.split(" ")[0] || "Cliente"} 🌷
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{user?.email}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders">
          <TabsList className="bg-rose-soft flex flex-wrap h-auto">
            <TabsTrigger value="orders"><Package className="w-3.5 h-3.5 mr-1" />Mis pedidos</TabsTrigger>
            <TabsTrigger value="track"><Search className="w-3.5 h-3.5 mr-1" />Rastrear</TabsTrigger>
            <TabsTrigger value="addresses"><MapPin className="w-3.5 h-3.5 mr-1" />Direcciones</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-3.5 h-3.5 mr-1" />Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Reveal>
              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
                <h2 className="font-serif text-burgundy text-xl italic">Historial de pedidos</h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-4 italic">Aún no tienes pedidos asociados a esta cuenta.</p>
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
          </TabsContent>

          <TabsContent value="track" className="mt-6">
            <Reveal>
              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft max-w-2xl">
                <h2 className="font-serif text-burgundy text-xl italic flex items-center gap-2"><Search className="w-5 h-5" /> Rastrear pedido</h2>
                <p className="text-sm text-muted-foreground mt-1">Ingresa el código DLX-XXXX que recibiste por WhatsApp.</p>
                <div className="mt-4 flex gap-2">
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="DLX-1234" className="uppercase" />
                  <Button onClick={search} className="bg-burgundy text-primary-foreground">Buscar</Button>
                </div>
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
          </TabsContent>

          <TabsContent value="addresses" className="mt-6"><AddressesTab /></TabsContent>
          <TabsContent value="settings"  className="mt-6"><SettingsTab onSignOut={signOut} onReload={reload} /></TabsContent>
        </Tabs>
      </section>
    </>
  );
}

function AddressesTab() {
  const [list, setList] = useState<Address[]>([]);
  const [draft, setDraft] = useState({ label: "Casa", recipient: "", phone: "", address: "", city: "Barranquilla", notes: "" });
  const refresh = async () => {
    const { data } = await supabase.from("addresses").select("*").order("created_at", { ascending: false });
    setList((data as Address[]) || []);
  };
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!draft.recipient.trim() || !draft.address.trim()) return toast.error("Faltan datos obligatorios");
    const { error } = await supabase.from("addresses").insert(draft);
    if (error) return toast.error(error.message);
    toast.success("Dirección guardada");
    setDraft({ label: "Casa", recipient: "", phone: "", address: "", city: "Barranquilla", notes: "" });
    refresh();
  };
  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">Mis direcciones</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aún no tienes direcciones guardadas.</p>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li key={a.id} className="bg-rose-soft/60 rounded-xl p-3 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-deep mt-1 shrink-0" />
                <div className="flex-1">
                  <p className="font-serif text-burgundy">{a.label} — {a.recipient}</p>
                  <p className="text-xs text-muted-foreground">{a.address}{a.city ? `, ${a.city}` : ""}</p>
                  {a.phone && <p className="text-xs text-muted-foreground">{a.phone}</p>}
                </div>
                <button onClick={() => remove(a.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">Nueva dirección</h2>
        <div className="space-y-3">
          <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Etiqueta (Casa, Oficina)" />
          <Input value={draft.recipient} onChange={(e) => setDraft({ ...draft, recipient: e.target.value })} placeholder="Nombre de quien recibe *" />
          <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="Teléfono" />
          <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Dirección completa *" />
          <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Ciudad" />
          <Input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Notas para el repartidor" />
          <Button onClick={add} className="w-full bg-burgundy text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Guardar dirección</Button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ onSignOut, onReload }: { onSignOut: () => void; onReload: () => void }) {
  const { profile, user } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => { setName(profile?.full_name || ""); setPhone(profile?.phone || ""); }, [profile]);

  const saveProfile = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Datos actualizados");
    onReload();
  };
  const changePwd = async () => {
    if (newPwd.length < 6) return toast.error("Mínimo 6 caracteres");
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) return toast.error(error.message);
    toast.success("Contraseña actualizada");
    setNewPwd("");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">Tus datos</h2>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" />
          <Input value={user?.email || ""} disabled />
          <Button onClick={saveProfile} className="w-full bg-burgundy text-primary-foreground">Guardar cambios</Button>
        </div>
      </div>
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">Cambiar contraseña</h2>
        <div className="space-y-3">
          <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Nueva contraseña (mín. 6)" />
          <Button onClick={changePwd} className="w-full bg-burgundy text-primary-foreground">Actualizar contraseña</Button>
        </div>
        <div className="border-t border-border/60 mt-6 pt-5">
          <Button onClick={onSignOut} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
