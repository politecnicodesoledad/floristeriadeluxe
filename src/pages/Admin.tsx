import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { store, type Banner, type Order, type Popup, type Product } from "@/lib/store";
import { useBanner, useProducts } from "@/lib/hooks";
import { LogOut, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CATS = ["Cumpleaños", "Bodas", "Fúnebre", "Desayunos"];
const STATUSES: Order["status"][] = ["Recibido", "En preparación", "En camino", "Entregado"];

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState("");
  useEffect(() => { setAuth(store.isAdmin()); }, []);

  const login = () => {
    if (pwd === "angiedeluxe") {
      store.setAdmin(true);
      setAuth(true);
      toast.success("Bienvenida, Angie ✨");
    } else toast.error("Contraseña incorrecta");
  };
  const logout = () => { store.setAdmin(false); setAuth(false); setPwd(""); };

  if (!auth) {
    return (
      <>
        <Helmet><title>Admin — Floristería Deluxe</title></Helmet>
        <div className="container mx-auto px-4 py-20 max-w-md">
          <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-soft text-center">
            <h1 className="font-serif text-3xl text-burgundy italic">Panel Admin</h1>
            <p className="text-sm text-muted-foreground mt-2">Ingresa tu contraseña para continuar.</p>
            <Input
              type="password" value={pwd} onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Contraseña" className="mt-5 text-center"
            />
            <Button onClick={login} className="w-full mt-3 bg-burgundy hover:bg-burgundy-light text-primary-foreground h-11">
              Entrar
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Admin — Floristería Deluxe</title></Helmet>
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="font-script text-2xl text-rose-deep">Panel</p>
            <h1 className="font-serif text-3xl md:text-4xl text-burgundy italic">Administración Deluxe</h1>
          </div>
          <Button onClick={logout} variant="outline" className="border-burgundy text-burgundy"><LogOut className="w-4 h-4 mr-2" />Cerrar sesión</Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="bg-rose-soft flex flex-wrap h-auto">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="popups">Popups</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
          <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
          <TabsContent value="banners" className="mt-6"><BannersTab /></TabsContent>
          <TabsContent value="popups" className="mt-6"><PopupsTab /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function emptyProduct(): Product {
  return { id: `p${Date.now()}`, title: "", description: "", price: 0, image: "", category: CATS[0] };
}

function ProductsTab() {
  const { products } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);

  const save = () => {
    if (!editing) return;
    if (!editing.title || !editing.image || editing.price <= 0) {
      toast.error("Completa título, imagen y precio.");
      return;
    }
    store.upsertProduct(editing);
    toast.success("Producto guardado");
    setEditing(null);
  };

  const onFile = (file: File) => {
    if (!editing) return;
    const reader = new FileReader();
    reader.onload = () => setEditing({ ...editing, image: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-burgundy text-xl italic">Productos ({products.length})</h2>
          <Button onClick={() => setEditing(emptyProduct())} className="bg-burgundy hover:bg-burgundy-light text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Nuevo
          </Button>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-rose-soft/60 rounded-xl p-2">
              <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-burgundy text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.category} · ${p.price.toLocaleString()}</p>
              </div>
              <button onClick={() => setEditing(p)} className="w-8 h-8 rounded-full bg-cream text-burgundy flex items-center justify-center"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { store.deleteProduct(p.id); toast.success("Eliminado"); }} className="w-8 h-8 rounded-full bg-cream text-destructive flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">{editing ? "Editar producto" : "Selecciona un producto"}</h2>
        {editing && (
          <div className="space-y-3">
            <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Título" />
            <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Descripción" rows={3} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="Precio" />
              <Input type="number" value={editing.originalPrice || ""} onChange={(e) => setEditing({ ...editing, originalPrice: Number(e.target.value) || undefined })} placeholder="Precio original" />
            </div>
            <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="URL imagen" />
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="text-xs" />
            {editing.image && <img src={editing.image} alt="" className="w-full h-32 object-cover rounded-lg" />}
            <div className="flex items-center gap-2">
              <Switch checked={!!editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} />
              <span className="text-sm text-burgundy">Destacado en Home</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} className="flex-1 bg-burgundy hover:bg-burgundy-light text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
              <Button onClick={() => setEditing(null)} variant="outline">Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState(() => store.getOrders());
  const refresh = () => setOrders(store.getOrders());
  const changeStatus = (code: string, status: Order["status"]) => {
    store.updateOrderStatus(code, status);
    refresh();
    toast.success(`Estado actualizado: ${status}`);
  };
  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-12 italic">Aún no hay pedidos registrados.</p>;
  }
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Pedidos ({orders.length})</h2>
      <ul className="divide-y divide-border/60">
        {orders.map((o) => (
          <li key={o.code} className="py-4 grid md:grid-cols-[1fr_auto] gap-3 items-center">
            <div>
              <p className="font-serif text-burgundy text-lg">{o.code}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("es-CO")} · {o.items.length} items · ${o.total.toLocaleString()}</p>
              <p className="text-xs text-foreground/70 mt-1">{o.items.map((i) => `${i.title} ×${i.qty}`).join(" · ")}</p>
            </div>
            <Select value={o.status} onValueChange={(v) => changeStatus(o.code, v as Order["status"])}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BannersTab() {
  const banner = useBanner();
  const [draft, setDraft] = useState<Banner>(banner);
  useEffect(() => setDraft(banner), [banner]);
  const save = () => { store.saveBanner(draft); toast.success("Banner actualizado"); };
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft max-w-2xl">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Textos principales</h2>
      <div className="space-y-3">
        <div><label className="text-sm text-burgundy">Título hero (línea 1)</label><Input value={draft.heroTitle} onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })} /></div>
        <div><label className="text-sm text-burgundy">Título hero (script)</label><Input value={draft.heroTitleAccent} onChange={(e) => setDraft({ ...draft, heroTitleAccent: e.target.value })} /></div>
        <div><label className="text-sm text-burgundy">Subtítulo hero</label><Textarea value={draft.heroSubtitle} onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })} rows={2} /></div>
        <div><label className="text-sm text-burgundy">Promo título</label><Input value={draft.promoTitle} onChange={(e) => setDraft({ ...draft, promoTitle: e.target.value })} /></div>
        <div><label className="text-sm text-burgundy">Promo subtítulo</label><Textarea value={draft.promoSubtitle} onChange={(e) => setDraft({ ...draft, promoSubtitle: e.target.value })} rows={2} /></div>
        <Button onClick={save} className="bg-burgundy hover:bg-burgundy-light text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
      </div>
    </div>
  );
}

function PopupsTab() {
  const [popup, setPopup] = useState<Popup>(() => store.getPopup());
  const save = () => {
    store.savePopup({ ...popup, id: `popup-${Date.now()}` });
    toast.success("Popup guardado. Se mostrará a los visitantes.");
  };
  return (
    <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-soft max-w-2xl">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Ventana emergente</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch checked={popup.enabled} onCheckedChange={(v) => setPopup({ ...popup, enabled: v })} />
          <span className="text-sm text-burgundy">{popup.enabled ? "Activo" : "Inactivo"}</span>
        </div>
        <div><label className="text-sm text-burgundy">Título</label><Input value={popup.title} onChange={(e) => setPopup({ ...popup, title: e.target.value })} /></div>
        <div><label className="text-sm text-burgundy">Mensaje</label><Textarea value={popup.message} onChange={(e) => setPopup({ ...popup, message: e.target.value })} rows={3} /></div>
        <div><label className="text-sm text-burgundy">Imagen (URL, opcional)</label><Input value={popup.image || ""} onChange={(e) => setPopup({ ...popup, image: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-sm text-burgundy">Texto CTA</label><Input value={popup.cta || ""} onChange={(e) => setPopup({ ...popup, cta: e.target.value })} /></div>
          <div><label className="text-sm text-burgundy">Link CTA</label><Input value={popup.ctaHref || ""} onChange={(e) => setPopup({ ...popup, ctaHref: e.target.value })} placeholder="/tienda" /></div>
        </div>
        <Button onClick={save} className="bg-burgundy hover:bg-burgundy-light text-primary-foreground"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
      </div>
    </div>
  );
}
