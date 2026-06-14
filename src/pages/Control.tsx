import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, SITE_IMAGE_SLOTS, type Banner, type Order, type Popup, type Product, type SiteImages, type DeliveryZone, formatCOP } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useBanner, useProducts, useSiteImages } from "@/lib/hooks";
import { isLegacyBrokenImageUrl, resolveAssetUrl } from "@/lib/utils";
import { LogOut, Pencil, Plus, Save, Trash2, Image as ImageIcon, Images as ImagesIcon, Tag, Package, Users, Settings, Ticket, Truck } from "lucide-react";
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
            <TabsTrigger value="zones"><Truck className="w-3.5 h-3.5 mr-1" />Zonas</TabsTrigger>
            <TabsTrigger value="content"><ImageIcon className="w-3.5 h-3.5 mr-1" />Contenido</TabsTrigger>
            <TabsTrigger value="gallery"><ImagesIcon className="w-3.5 h-3.5 mr-1" />Galería</TabsTrigger>
            <TabsTrigger value="clients"><Users className="w-3.5 h-3.5 mr-1" />Clientes</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-3.5 h-3.5 mr-1" />Popup</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6"><ProductsTab /></TabsContent>
          <TabsContent value="orders"   className="mt-6"><OrdersTab /></TabsContent>
          <TabsContent value="coupons"  className="mt-6"><CouponsTab /></TabsContent>
          <TabsContent value="zones"    className="mt-6"><ZonesTab /></TabsContent>
          <TabsContent value="content"  className="mt-6"><BannersTab /></TabsContent>
          <TabsContent value="gallery"  className="mt-6"><GalleryTab /></TabsContent>
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
  const [migrating, setMigrating] = useState(false);
  const [migrateReport, setMigrateReport] = useState<any>(null);

  const runMigration = async (dryRun = false) => {
    const pending = products.filter((product) => isLegacyBrokenImageUrl(product.image));
    if (pending.length === 0) {
      const { hydrateAll } = await import("@/lib/store");
      await hydrateAll();
      setMigrateReport({
        ok: true,
        dryRun,
        drive: { folderCount: 0, fileCount: 0 },
        products: products.length,
        matched: 0,
        uploaded: 0,
        notFoundCount: 0,
        failedCount: 0,
        notFound: [],
        failed: [],
      });
      toast.success("Las imágenes de productos ya están vinculadas");
      return;
    }
    if (!dryRun && !confirm("Esto va a descargar las imágenes desde Google Drive y reemplazar las URLs rotas. ¿Continuar?")) return;
    setMigrating(true);
    setMigrateReport(null);
    try {
      const { data, error } = await supabase.functions.invoke("migrate-drive-images", {
        body: { dryRun },
      });
      if (error) throw error;
      setMigrateReport(data);
      toast.success(
        dryRun
          ? `Encontradas ${data?.matched ?? 0} de ${data?.products ?? 0}`
          : `Migradas ${data?.uploaded ?? 0} imágenes ✨`,
      );
      if (!dryRun) {
        // refrescar productos desde Supabase
        const { hydrateAll } = await import("@/lib/store");
        await hydrateAll();
      }
    } catch (e: any) {
      toast.error("Falló la migración", {
        description: String(e?.message ?? e).includes("Failed to send a request to the Edge Function")
          ? "La función de migración no está desplegada, pero las imágenes actuales ya quedaron corregidas en la tienda."
          : String(e?.message ?? e),
      });
    } finally {
      setMigrating(false);
    }
  };

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
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => runMigration(true)} disabled={migrating} variant="outline" className="border-rose-deep text-rose-deep">
              {migrating ? "Buscando…" : "Probar Drive (dry-run)"}
            </Button>
            <Button onClick={() => runMigration(false)} disabled={migrating} variant="outline" className="border-burgundy text-burgundy">
              {migrating ? "Migrando…" : "Migrar imágenes desde Drive"}
            </Button>
            <Button onClick={startNew} className="bg-burgundy hover:bg-burgundy-light text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Nuevo producto
            </Button>
          </div>
        </div>
        {migrateReport && (
          <div className="mb-4 p-3 rounded-xl bg-rose-soft/60 border border-rose-mid/30 text-xs text-burgundy">
            <p className="font-serif text-sm mb-1">Reporte Drive</p>
            <p>Archivos en Drive: <b>{migrateReport.drive?.fileCount}</b> · Carpetas: <b>{migrateReport.drive?.folderCount}</b></p>
            <p>Productos a migrar: <b>{migrateReport.products}</b> · Encontrados: <b>{migrateReport.matched}</b> · Subidos: <b>{migrateReport.uploaded}</b></p>
            <p>No encontrados: <b>{migrateReport.notFoundCount}</b> · Fallidos: <b>{migrateReport.failedCount}</b></p>
            {migrateReport.notFound?.length > 0 && (
              <details className="mt-2"><summary className="cursor-pointer">Ver primeros no encontrados</summary>
                <ul className="mt-1 space-y-0.5">
                  {migrateReport.notFound.slice(0, 20).map((n: any) => (
                    <li key={n.id} className="font-mono text-[10px]">{n.basename} — {n.title}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-2 max-h-[700px] overflow-y-auto pr-1">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-rose-soft/60 rounded-xl p-2.5">
              <img src={resolveAssetUrl(p.image)} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
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
              <img src={resolveAssetUrl(editing.image) || "https://placehold.co/120x120/eee/aaa?text=Imagen"} alt="" className="w-16 h-16 object-cover rounded-lg" />
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
                {editing.image && <img src={resolveAssetUrl(editing.image)} alt="" className="w-full h-40 object-cover rounded-lg border" />}
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

  const markPaid = async (code: string) => {
    await store.updatePaymentStatus(code, "paid");
    setOrders((prev) => prev.map((o) => o.code === code ? { ...o, payment_status: "paid" } : o));
    toast.success("Marcado como pagado ✓");
  };

  if (loading) return <p className="text-center text-muted-foreground py-12 italic">Cargando pedidos…</p>;
  if (orders.length === 0) return <p className="text-center text-muted-foreground py-12 italic">Aún no hay pedidos registrados.</p>;

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
      <h2 className="font-serif text-burgundy text-xl italic mb-4">Pedidos ({orders.length})</h2>
      <ul className="divide-y divide-border/60">
        {orders.map((o) => (
          <li key={o.code} className="py-4 space-y-2">
            <div className="grid md:grid-cols-[1fr_auto] gap-3 md:items-start">
              <div>
                {/* Encabezado con código y badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-serif text-burgundy text-lg">{o.code}</p>
                  {o.payment_method === "bold" && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">💳 Bold</span>
                  )}
                  {o.payment_method === "whatsapp" && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">💬 WhatsApp</span>
                  )}
                  {o.payment_status === "paid" && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Pagado</span>
                  )}
                  {o.payment_status === "pending" && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⏳ Pendiente</span>
                  )}
                </div>

                {/* Fecha, cliente, total */}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(o.createdAt).toLocaleString("es-CO")} · {formatCOP(o.total)}
                  {o.customer?.name && ` · ${o.customer.name}`}
                  {o.customer?.phone && ` · ${o.customer.phone}`}
                </p>

                {/* Productos con links */}
                <div className="mt-1.5 space-y-0.5">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground/70">
                      <span>{item.title} ×{item.qty} — {formatCOP(item.price * item.qty)}</span>
                      {item.productUrl && (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-burgundy underline hover:text-rose-deep shrink-0"
                        >
                          ver producto →
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Datos de envío */}
                {(o.recipient_name || o.delivery_date || o.delivery_zone) && (
                  <div className="mt-2 p-2.5 bg-rose-soft/50 rounded-xl text-xs space-y-0.5 text-foreground/70">
                    {o.sender_name && <p>👤 <span className="font-medium">De:</span> {o.sender_name}</p>}
                    {o.recipient_name && <p>🎁 <span className="font-medium">Para:</span> {o.recipient_name}</p>}
                    {o.delivery_date && (
                      <p>📅 <span className="font-medium">Entrega:</span> {new Date(o.delivery_date + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                        {o.delivery_time && ` · ${o.delivery_time === "8-13" ? "8 am – 1 pm" : "2 pm – 6 pm"}`}
                      </p>
                    )}
                    {o.delivery_zone && (
                      <p>📍 <span className="font-medium">Zona:</span> {o.delivery_zone}
                        {o.delivery_cost ? ` — ${formatCOP(o.delivery_cost)}` : ""}
                      </p>
                    )}
                    {(o.shipping_address as any)?.address && (
                      <p>🏠 <span className="font-medium">Dirección:</span> {(o.shipping_address as any).address}</p>
                    )}
                    {o.dedicatoria && <p>💌 <span className="font-medium">Dedicatoria:</span> {o.dedicatoria}</p>}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                <Select value={o.status} onValueChange={(v) => change(o.code, v as Order["status"])}>
                  <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                {o.payment_status !== "paid" && (
                  <button
                    onClick={() => markPaid(o.code)}
                    className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full px-3 py-1.5 font-medium w-full md:w-48 transition-colors"
                  >
                    ✓ Marcar como pagado
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============ ZONAS DE ENVÍO ============ */
function ZonesTab() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [draft, setDraft] = useState({ name: "", price: 0 });

  useEffect(() => {
    store.fetchDeliveryZones().then(setZones);
  }, []);

  const save = (updated: DeliveryZone[]) => {
    setZones(updated);
    store.saveDeliveryZones(updated);
    toast.success("Zonas de envío guardadas ✨");
  };

  const add = () => {
    if (!draft.name.trim()) return toast.error("Escribe el nombre de la zona");
    if (draft.price < 0) return toast.error("El precio no puede ser negativo");
    const newZone: DeliveryZone = {
      id: `zone_${Date.now()}`,
      name: draft.name.trim(),
      price: draft.price,
      active: true,
    };
    save([...zones, newZone]);
    setDraft({ name: "", price: 0 });
  };

  const toggle = (id: string) => {
    save(zones.map((z) => z.id === id ? { ...z, active: !z.active } : z));
  };

  const remove = (id: string) => {
    if (!confirm("¿Eliminar esta zona?")) return;
    save(zones.filter((z) => z.id !== id));
  };

  const updatePrice = (id: string, price: number) => {
    save(zones.map((z) => z.id === id ? { ...z, price } : z));
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      {/* Lista de zonas */}
      <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft">
        <h2 className="font-serif text-burgundy text-xl italic mb-1">Zonas configuradas ({zones.length})</h2>
        <p className="text-xs text-muted-foreground mb-4">El cliente verá estas zonas al finalizar la compra. Activa o desactiva según disponibilidad.</p>

        {zones.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">Aún no hay zonas. Agrégalas →</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {zones.map((z) => (
              <li key={z.id} className="py-3 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${z.active ? "text-foreground" : "text-muted-foreground line-through"}`}>{z.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="w-28 h-8 text-sm"
                    value={z.price}
                    min={0}
                    onChange={(e) => updatePrice(z.id, Number(e.target.value))}
                    onBlur={(e) => updatePrice(z.id, Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={z.active} onCheckedChange={() => toggle(z.id)} />
                  <button onClick={() => remove(z.id)} className="text-destructive hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Agregar zona */}
      <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-soft self-start">
        <h2 className="font-serif text-burgundy text-xl italic mb-4">Agregar zona</h2>
        <div className="space-y-3">
          <Input
            placeholder="Nombre (ej: Barranquilla Centro)"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">Tarifa $</span>
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={draft.price || ""}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            />
          </div>
          <Button onClick={add} className="w-full bg-burgundy hover:bg-burgundy-light text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Agregar zona
          </Button>
        </div>
        <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <p className="font-semibold mb-1">💡 Zona "Otro"</p>
          <p>Siempre habrá una opción "Otro" automática para zonas no listadas. El cliente indicará su zona y tú la confirmas por WhatsApp antes de despachar.</p>
        </div>
      </div>
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

/* ============ GALERÍA ============ */
function GalleryTab() {
  const current = useSiteImages();
  const [draft, setDraft] = useState<SiteImages>(current);
  useEffect(() => { setDraft(current); }, [current]);

  const setSlot = (key: string, url: string) => setDraft((d) => ({ ...d, [key]: url }));
  const onFile = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSlot(key, String(reader.result));
    reader.readAsDataURL(file);
  };
  const saveAll = () => {
    store.saveSiteImages(draft);
    toast.success("Galería actualizada ✨");
  };

  return (
    <div className="space-y-4">
      <div className="bg-rose-soft/60 border border-rose-mid/40 rounded-2xl p-4 text-sm text-burgundy">
        Aquí puedes cambiar todas las imágenes de la web. Pega una URL pública (ej: ibb.co, Unsplash) o sube una imagen desde tu equipo. Los cambios se guardan en tu base de datos y aparecen en toda la página al instante.
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {SITE_IMAGE_SLOTS.map((slot) => (
          <div key={slot.key} className="bg-card border border-border/60 rounded-2xl p-4 shadow-soft">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-rose-soft shrink-0 flex items-center justify-center">
                {draft[slot.key]
                  ? <img src={draft[slot.key]} alt="" className="w-full h-full object-cover" />
                  : <ImageIcon className="w-6 h-6 text-rose-mid" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-burgundy text-sm leading-tight">{slot.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{slot.hint}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Input
                value={draft[slot.key] || ""}
                onChange={(e) => setSlot(slot.key, e.target.value)}
                placeholder="https://..."
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && onFile(slot.key, e.target.files[0])}
                  className="text-xs flex-1 border border-dashed border-rose-mid rounded-lg p-1.5"
                />
                {draft[slot.key] && (
                  <button
                    onClick={() => setSlot(slot.key, "")}
                    className="text-xs text-destructive hover:underline px-2"
                    type="button"
                  >
                    Vaciar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={saveAll} size="lg" className="bg-burgundy hover:bg-burgundy-light text-primary-foreground shadow-luxe">
          <Save className="w-4 h-4 mr-2" /> Guardar toda la galería
        </Button>
      </div>
    </div>
  );
}
