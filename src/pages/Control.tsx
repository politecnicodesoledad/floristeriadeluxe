import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, type Banner, type Order, type Popup, type Product, formatCOP } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useBanner, useProducts } from "@/lib/hooks";
import { LogOut, Pencil, Plus, Save, Trash2, Image as ImageIcon, Tag, Package, Users, Settings, Ticket } from "lucide-react";
import { toast } from "sonner";

const CATS = ["Cumpleaños", "Bodas", "Fúnebre", "Desayunos"];
const STATUSES: Order["status"][] = ["Recibido", "En preparación", "En camino", "Entregado"];

export default function Control() {
  const { signOut, profile } = useAuth();
  return (
    <>
      <Helmet><title>Panel de Control — Floristería Deluxe</title></Helmet>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="font-script text-2xl text-rose-deep">Panel</p>
            <h1 className="font-serif text-3xl md:text-4xl text-burgundy italic">Control Deluxe</h1>
            <p className="text-xs text-muted-foreground">Sesión: {profile?.full_name || "Admin"}</p>
          </div>
          <Button onClick={signOut} variant="outline" className="border-burgundy text-burgundy">
            <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="bg-rose-soft flex flex-wrap h-auto">
            <TabsTrigger value="products"><Package className="w-3.5 h-3.5 mr-1" />Productos</TabsTrigger>
            <TabsTrigger value="orders"><Tag className="w-3.5 h-3.5 mr-1" />Pedidos</TabsTrigger>
            <TabsTrigger value="coupons"><Ticket className="w-3.5 h-3.5 mr-1" />Cupones</TabsTrigger>
            <TabsTrigger value="content"><ImageIcon className="w-3.5 h-3.5 mr-1" />Contenido</TabsTrigger>
            <TabsTrigger value="clients"><Users className="w-3.5 h-3.5 mr-1" />Clientes</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-3.5 h-3.5 mr-1" />Popup</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
          <TabsContent value="orders"   className="mt-6"><OrdersTab /></TabsContent>
          <TabsContent value="coupons"  className="mt-6"><CouponsTab /></TabsContent>
          <TabsContent value="content"  className="mt-6"><BannersTab /></TabsContent>
          <TabsContent value="clients"  className="mt-6"><ClientsTab /></TabsContent>
          <TabsContent value="settings" className="mt-6"><PopupsTab /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

/* ============ PRODUCTOS ============ */
function emptyProduct(): Product {
  return { id: `p${Date.now()}`, title: "", description: "", price: 0, image: "", category: CATS[0] };
}

function ProductsTab() {
  const { products } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const startNew = () => { setEditing(emptyProduct()); setStep(1); };
  const startEdit = (p: Product) => { setEditing({ ...p }); setStep(1); };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) return toast.error("Falta el título");
    if (editing.price <= 0) return toast.error("Falta el precio");
    if (!editing.image.trim()) return toast.error("Falta la imagen");
    store.upsertProduct(editing);
    toast.success("Producto guardado ✨");
    setEditing(null);
  };

  const onFile = (file: File) => {
    if (!editing) return;
    const reader = new FileReader();
    reader.onload = () => setEditing({ ...editing, image: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      {/* Lista */}
      <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-burgundy text-xl italic">Catálogo ({products.length})</h2>
          <Button onClick={startNew} className="bg-burgundy hover:bg-burgundy-light text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Nuevo producto
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 max-h-[700px] overflow-y-auto pr-1">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-rose-soft/60 rounded-xl p-2.5">
              <img src={p.image} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-burgundy text-sm truncate">{p.title}</p>
                <p className="text-[11px] text-muted-foreground">{p.category} · {formatCOP(p.price)}</p>
                {p.featured && <span className="inline-block mt-0.5 text-[9px] uppercase tracking-wider bg-gold/20 text-burgundy px-1.5 rounded">Destacado</span>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => startEdit(p)} className="w-7 h-7 rounded-full bg-cream text-burgundy flex items-center justify-center hover:bg-rose-mid/40" aria-label="Editar">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if (confirm(`¿Eliminar "${p.title}"?`)) { store.deleteProduct(p.id); toast.success("Eliminado"); } }}
                  className="w-7 h-7 rounded-full bg-cream text-destructive flex items-center justify-center hover:bg-destructive/10" aria-label="Eliminar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor paso a paso */}
      <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft self-start sticky top-24">
        {!editing ? (
          <div className="text-center py-12">
            <Plus className="w-10 h-10 text-rose-mid mx-auto" />
            <p className="font-serif text-burgundy mt-3">Selecciona un producto para editar</p>
            <p className="text-xs text-muted-foreground">o crea uno nuevo con el botón ↑</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-burgundy text-xl italic">
                {editing.title ? `Editar "${editing.title.slice(0,20)}"` : "Nuevo producto"}
              </h2>
              <span className="text-xs bg-rose-soft text-rose-deep px-2 py-0.5 rounded-full">Paso {step}/3</span>
            </div>

            {/* preview siempre visible */}
            <div className="bg-gradient-rose rounded-2xl p-3 flex gap-3 items-center mb-4">
              <img src={editing.image || "https://placehold.co/120x120/eee/aaa?text=Imagen"} alt="" className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-burgundy text-sm truncate">{editing.title || "Título del producto"}</p>
                <p className="text-[11px] text-rose-deep">{editing.category} · {formatCOP(editing.price || 0)}</p>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-3 animate-in fade-in">
                <p className="text-xs text-muted-foreground">Paso 1 — Información básica</p>
                <div><label className="text-xs text-burgundy">Título *</label>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Ej: Ramo de Rosas Eternas" /></div>
                <div><label className="text-xs text-burgundy">Descripción</label>
                  <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3}
                    placeholder="Describe los materiales, el empaque, la cantidad de flores..." /></div>
                <div><label className="text-xs text-burgundy">Categoría *</label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select></div>
                <Button onClick={() => setStep(2)} className="w-full bg-burgundy text-primary-foreground">Siguiente: Precio →</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 animate-in fade-in">
                <p className="text-xs text-muted-foreground">Paso 2 — Precio</p>
                <div><label className="text-xs text-burgundy">Precio en COP *</label>
                  <Input type="number" value={editing.price || ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="189000" /></div>
                <div><label className="text-xs text-burgundy">Precio original (opcional, para mostrar oferta)</label>
                  <Input type="number" value={editing.originalPrice || ""} onChange={(e) => setEditing({ ...editing, originalPrice: Number(e.target.value) || undefined })} placeholder="220000" /></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Volver</Button>
                  <Button onClick={() => setStep(3)} className="flex-1 bg-burgundy text-primary-foreground">Siguiente: Imagen →</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 animate-in fade-in">
                <p className="text-xs text-muted-foreground">Paso 3 — Imagen y destacado</p>
                <div><label className="text-xs text-burgundy">URL de la imagen</label>
                  <Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." /></div>
                <div className="text-center text-xs text-muted-foreground">— o subir desde tu equipo —</div>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                  className="text-xs w-full border border-dashed border-rose-mid rounded-lg p-2" />
                {editing.image && <img src={editing.image} alt="" className="w-full h-40 object-cover rounded-lg border" />}
                <label className="flex items-center gap-2 cursor-pointer bg-rose-soft/60 p-3 rounded-lg">
                  <Switch checked={!!editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} />
                  <span className="text-sm text-burgundy">⭐ Mostrar en destacados del Home</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Volver</Button>
                  <Button onClick={save} className="flex-1 bg-burgundy hover:bg-burgundy-light text-primary-foreground">
                    <Save className="w-4 h-4 mr-1" /> Guardar
                  </Button>
                </div>
                <button onClick={() => setEditing(null)} className="text-xs text-muted-foreground hover:text-destructive block mx-auto">Cancelar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ============ PEDIDOS ============ */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { setOrders(await store.fetchAllOrders()); setLoading(false); })(); }, []);

  const change = async (code: string, status: Order["status"]) => {
    await store.updateOrderStatus(code, status);
    setOrders((prev) => prev.map((o) => o.code === code ? { ...o, status } : o));
    toast.success(`Estado: ${status}`);
  };

  if (loading) return <p className="text-center text-muted-foreground py-12 italic">Cargando pedidos…</p>;
  if (orders.length === 0) return <p className="text-center text-muted-foreground py-12 italic">Aún no hay pedidos registrados.</p>;

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Pedidos ({orders.length})</h2>
      <ul className="divide-y divide-border/60">
        {orders.map((o) => (
          <li key={o.code} className="py-4 grid md:grid-cols-[1fr_auto] gap-3 md:items-center">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-serif text-burgundy text-lg">{o.code}</p>
                {o.payment_method === "bold" && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Bold</span>}
                {o.payment_status === "paid" && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Pagado</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString("es-CO")} · {o.items.length} ítems · {formatCOP(o.total)}
                {o.customer?.name && ` · ${o.customer.name}`}
                {o.customer?.phone && ` · ${o.customer.phone}`}
              </p>
              <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{o.items.map((i) => `${i.title} ×${i.qty}`).join(" · ")}</p>
            </div>
            <Select value={o.status} onValueChange={(v) => change(o.code, v as Order["status"])}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============ CUPONES ============ */
type Coupon = { code: string; discount_percent: number; active: boolean; expires_at: string | null; max_uses: number | null; uses: number };
function CouponsTab() {
  const [list, setList] = useState<Coupon[]>([]);
  const [draft, setDraft] = useState({ code: "", discount_percent: 10, active: true });
  const refresh = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setList((data as Coupon[]) || []);
  };
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    if (!draft.code.trim()) return toast.error("Falta el código");
    const { error } = await supabase.from("coupons").upsert({
      code: draft.code.trim().toUpperCase(),
      discount_percent: draft.discount_percent,
      active: draft.active,
    });
    if (error) return toast.error(error.message);
    toast.success("Cupón guardado");
    setDraft({ code: "", discount_percent: 10, active: true });
    refresh();
  };
  const remove = async (code: string) => {
    if (!confirm(`¿Eliminar cupón ${code}?`)) return;
    await supabase.from("coupons").delete().eq("code", code);
    refresh();
  };
  const toggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ active: !c.active }).eq("code", c.code);
    refresh();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">Cupones activos ({list.length})</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aún no hay cupones. Crea uno →</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {list.map((c) => (
              <li key={c.code} className="py-3 flex items-center gap-3">
                <span className="font-mono text-burgundy font-semibold">{c.code}</span>
                <span className="text-sm text-rose-deep">-{c.discount_percent}%</span>
                <span className="text-xs text-muted-foreground">usos: {c.uses}{c.max_uses ? `/${c.max_uses}` : ""}</span>
                <div className="ml-auto flex items-center gap-2">
                  <Switch checked={c.active} onCheckedChange={() => toggle(c)} />
                  <button onClick={() => remove(c.code)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft self-start">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">Crear cupón</h2>
        <div className="space-y-3">
          <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="CÓDIGO (ej: AMOR15)" />
          <div><label className="text-xs text-burgundy">% descuento</label>
            <Input type="number" min={1} max={100} value={draft.discount_percent} onChange={(e) => setDraft({ ...draft, discount_percent: Number(e.target.value) })} /></div>
          <label className="flex items-center gap-2">
            <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
            <span className="text-sm text-burgundy">Activo</span>
          </label>
          <Button onClick={add} className="w-full bg-burgundy text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Crear</Button>
        </div>
      </div>
    </div>
  );
}

/* ============ CONTENIDO (banner) ============ */
function BannersTab() {
  const banner = useBanner();
  const [draft, setDraft] = useState<Banner>(banner);
  useEffect(() => setDraft(banner), [banner]);
  const save = () => { store.saveBanner(draft); toast.success("Contenido actualizado"); };
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft max-w-2xl">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Textos principales del Home</h2>
      <div className="space-y-3">
        <div><label className="text-xs text-burgundy">Título hero (línea 1)</label><Input value={draft.heroTitle} onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })} /></div>
        <div><label className="text-xs text-burgundy">Título hero (script)</label><Input value={draft.heroTitleAccent} onChange={(e) => setDraft({ ...draft, heroTitleAccent: e.target.value })} /></div>
        <div><label className="text-xs text-burgundy">Subtítulo hero</label><Textarea value={draft.heroSubtitle} onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })} rows={2} /></div>
        <div><label className="text-xs text-burgundy">Promo título</label><Input value={draft.promoTitle} onChange={(e) => setDraft({ ...draft, promoTitle: e.target.value })} /></div>
        <div><label className="text-xs text-burgundy">Promo subtítulo</label><Textarea value={draft.promoSubtitle} onChange={(e) => setDraft({ ...draft, promoSubtitle: e.target.value })} rows={2} /></div>
        <Button onClick={save} className="bg-burgundy text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
      </div>
    </div>
  );
}

/* ============ CLIENTES ============ */
function ClientsTab() {
  const [list, setList] = useState<{ id: string; full_name: string | null; phone: string | null; created_at: string }[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Clientes registrados ({list.length})</h2>
      {list.length === 0 ? <p className="text-sm text-muted-foreground italic">Aún sin registros.</p> : (
        <ul className="divide-y divide-border/60">
          {list.map((c) => (
            <li key={c.id} className="py-2.5 flex items-center justify-between text-sm">
              <div>
                <p className="font-serif text-burgundy">{c.full_name || "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground">{c.phone || "sin teléfono"} · {new Date(c.created_at).toLocaleDateString("es-CO")}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ============ POPUP ============ */
function PopupsTab() {
  const [popup, setPopup] = useState<Popup>(() => store.getPopup());
  const save = () => { store.savePopup({ ...popup, id: `popup-${Date.now()}` }); toast.success("Popup guardado"); };
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft max-w-2xl">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Ventana emergente</h2>
      <div className="space-y-3">
        <label className="flex items-center gap-3"><Switch checked={popup.enabled} onCheckedChange={(v) => setPopup({ ...popup, enabled: v })} />
          <span className="text-sm text-burgundy">{popup.enabled ? "Activa" : "Desactivada"}</span></label>
        <div><label className="text-xs text-burgundy">Título</label><Input value={popup.title} onChange={(e) => setPopup({ ...popup, title: e.target.value })} /></div>
        <div><label className="text-xs text-burgundy">Mensaje</label><Textarea value={popup.message} onChange={(e) => setPopup({ ...popup, message: e.target.value })} rows={3} /></div>
        <div><label className="text-xs text-burgundy">Imagen (URL, opcional)</label><Input value={popup.image || ""} onChange={(e) => setPopup({ ...popup, image: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs text-burgundy">Texto CTA</label><Input value={popup.cta || ""} onChange={(e) => setPopup({ ...popup, cta: e.target.value })} /></div>
          <div><label className="text-xs text-burgundy">Link CTA</label><Input value={popup.ctaHref || ""} onChange={(e) => setPopup({ ...popup, ctaHref: e.target.value })} placeholder="/tienda" /></div>
        </div>
        <Button onClick={save} className="bg-burgundy text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
      </div>
    </div>
  );
}