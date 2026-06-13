// Hybrid store v2: Supabase es la fuente de verdad para productos/pedidos/settings.
// localStorage solo guarda el carrito y un cache de lectura para que la UI sea instantánea.
// Las mutaciones que requieren rol admin (productos, settings, orders.update) usan el cliente
// autenticado: si el usuario no es admin, la RLS rechaza la operación.

import { supabase, SUPABASE_READY } from "./supabase";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  featured?: boolean;
};

export type CartItem = { productId: string; qty: number };

export type DeliveryZone = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

export type Order = {
  code: string;
  user_id?: string | null;
  items: { productId: string; title: string; qty: number; price: number; productUrl?: string }[];
  total: number;
  subtotal?: number;
  discount?: number;
  coupon_code?: string | null;
  dedicatoria?: string;
  customer?: { name?: string; phone?: string; address?: string };
  shipping_address?: Record<string, unknown> | null;
  // Nuevos campos de envío
  sender_name?: string;          // De (opcional)
  recipient_name?: string;       // Para
  delivery_date?: string;        // Fecha de entrega (ISO date)
  delivery_time?: "8-13" | "14-18"; // Franja horaria
  delivery_zone?: string;        // Nombre de zona elegida
  delivery_cost?: number;        // Tarifa de esa zona
  payment_method?: "whatsapp" | "bold";
  payment_status?: "pending" | "paid" | "failed";
  status: "Recibido" | "En preparación" | "En camino" | "Entregado";
  createdAt: number;
};

export type Banner = {
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  promoTitle: string;
  promoSubtitle: string;
};

export type Popup = {
  enabled: boolean;
  id: string;
  title: string;
  message: string;
  image?: string;
  cta?: string;
  ctaHref?: string;
};

export type SiteImages = Record<string, string>;

export const SITE_IMAGE_SLOTS: { key: string; label: string; hint: string }[] = [
  { key: "hero_bouquet",  label: "Home · Ramo principal (PNG sin fondo)", hint: "Imagen del ramo que aparece dentro del marco floral." },
  { key: "hero_frame",    label: "Home · Marco floral (PNG transparente)", hint: "El marco que rodea el ramo y rota suavemente." },
  { key: "cat_cumple",    label: "Home · Categoría Cumpleaños",  hint: "Foto circular de la categoría." },
  { key: "cat_bodas",     label: "Home · Categoría Bodas",       hint: "Foto circular de la categoría." },
  { key: "cat_funebre",   label: "Home · Categoría Fúnebre",     hint: "Foto circular de la categoría." },
  { key: "cat_desayunos", label: "Home · Categoría Desayunos",   hint: "Foto circular de la categoría." },
  { key: "promo_banner",  label: "Home · Banner promocional",    hint: "Imagen lateral del bloque 'Mejor que un pastel'." },
  { key: "eventos",       label: "Home · Decoramos tus eventos", hint: "Imagen del bloque de eventos." },
  { key: "acerca",        label: "Home · Acerca de nosotros",    hint: "Imagen con marco orgánico." },
  { key: "club_logo",     label: "Home · Logo Club Puntos Deluxe", hint: "Logo redondo del club." },
  { key: "site_logo",     label: "Logo de la marca (Navbar / Footer)", hint: "Logo principal del sitio." },
];

export const DEFAULT_SITE_IMAGES: SiteImages = {
  hero_bouquet:  "",
  hero_frame:    "",
  cat_cumple:    "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
  cat_bodas:     "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
  cat_funebre:   "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
  cat_desayunos: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80",
  promo_banner:  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1200&q=85",
  eventos:       "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85",
  acerca:        "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=900&q=85",
  club_logo:     "https://i.ibb.co/yc50fWW4/Captura-de-pantalla-2026-04-24-001156.png",
  site_logo:     "https://i.ibb.co/NgPCTK4k/Logo-Floristeria-Deluxe.png",
};

const KEYS = {
  products: "fdx.products",
  cart: "fdx.cart",
  orders: "fdx.orders",
  banner: "fdx.banner",
  popup: "fdx.popup",
  popupSeen: "fdx.popup.seen",
  images: "fdx.images",
  delivery_zones: "fdx.delivery_zones",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("fdx:store", { detail: { key } }));
}

// --- Supabase row mappers ---
type ProductRow = {
  id: string; title: string; description: string | null; price: number;
  original_price: number | null; image: string; category: string; featured: boolean | null;
};
const fromProductRow = (r: ProductRow): Product => ({
  id: r.id, title: r.title, description: r.description ?? "",
  price: r.price, originalPrice: r.original_price ?? undefined,
  image: r.image, category: r.category, featured: !!r.featured,
});
const toProductRow = (p: Product) => ({
  id: p.id, title: p.title, description: p.description, price: p.price,
  original_price: p.originalPrice ?? null, image: p.image,
  category: p.category, featured: !!p.featured,
});

function logErr(ctx: string, err: unknown) {
  if (err) console.warn(`[fdx:supabase:${ctx}]`, err);
}

// --- Seed data ---
export const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Ramo Rosas Eternas",
    description: "24 rosas rojas premium con follaje fino y empaque artesanal en papel kraft con cinta de seda.",
    price: 189000,
    originalPrice: 220000,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80",
    category: "Cumpleaños",
    featured: true,
  },
  {
    id: "p2",
    title: "Bouquet Primavera",
    description: "Mezcla de tulipanes amarillos, lisianthus y gypsophila en empaque romántico.",
    price: 145000,
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
    category: "Cumpleaños",
    featured: true,
  },
  {
    id: "p3",
    title: "Arreglo Boda Catedral",
    description: "Arreglo nupcial con rosas blancas, hortensias y eucalipto plateado.",
    price: 320000,
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    category: "Bodas",
    featured: true,
  },
  {
    id: "p4",
    title: "Corona Fúnebre Serenidad",
    description: "Corona de rosas y crisantemos blancos con cinta personalizada.",
    price: 280000,
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    category: "Fúnebre",
  },
  {
    id: "p5",
    title: "Desayuno Sorpresa Deluxe",
    description: "Canasta con frutas, jugo natural, croissants, chocolates y mini ramo de flores.",
    price: 175000,
    originalPrice: 199000,
    image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80",
    category: "Desayunos",
    featured: true,
  },
  {
    id: "p6",
    title: "Caja Corazón Romántica",
    description: "Caja en forma de corazón con rosas rojas preservadas y chocolates finos.",
    price: 210000,
    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80",
    category: "Cumpleaños",
    featured: true,
  },
  {
    id: "p7",
    title: "Ramo Girasoles Sol",
    description: "12 girasoles frescos con follaje verde y empaque kraft elegante.",
    price: 135000,
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80",
    category: "Cumpleaños",
  },
  {
    id: "p8",
    title: "Centro de Mesa Boda",
    description: "Centro de mesa con rosas pastel, peonías y velas para recepción nupcial.",
    price: 240000,
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
    category: "Bodas",
  },
];

export const DEFAULT_BANNER: Banner = {
  heroTitle: "Flores perfectas,",
  heroTitleAccent: "para momentos Inolvidables",
  heroSubtitle: "Arreglos únicos diseñados a mano para cada ocasión especial.",
  promoTitle: "RAMOS DE CUMPLEAÑOS",
  promoSubtitle: "¿Crees en la magia del cumpleaños? Celebra con flores listas para la fiesta.",
};

export const DEFAULT_POPUP: Popup = {
  enabled: true,
  id: "welcome-1",
  title: "Bienvenido a Floristería Deluxe",
  message: "10% de descuento en tu primer pedido por WhatsApp. Código: DELUXE10.",
  cta: "Ver Tienda",
  ctaHref: "/tienda",
};

// --- API ---
export const store = {
  // Products
  getProducts(): Product[] {
    const list = read<Product[]>(KEYS.products, []);
    if (list.length === 0) {
      write(KEYS.products, SEED_PRODUCTS);
      return SEED_PRODUCTS;
    }
    return list;
  },
  saveProducts(list: Product[]) {
    write(KEYS.products, list);
  },
  upsertProduct(p: Product) {
    const list = store.getProducts();
    const idx = list.findIndex((x) => x.id === p.id);
    if (idx >= 0) list[idx] = p;
    else list.unshift(p);
    write(KEYS.products, list);
    if (SUPABASE_READY) {
      supabase.from("products").upsert(toProductRow(p)).then(({ error }) => logErr("upsertProduct", error));
    }
  },
  deleteProduct(id: string) {
    write(KEYS.products, store.getProducts().filter((p) => p.id !== id));
    if (SUPABASE_READY) {
      supabase.from("products").delete().eq("id", id).then(({ error }) => logErr("deleteProduct", error));
    }
  },

  // Cart
  getCart(): CartItem[] {
    return read<CartItem[]>(KEYS.cart, []);
  },
  saveCart(items: CartItem[]) {
    write(KEYS.cart, items);
  },
  addToCart(productId: string, qty = 1) {
    const cart = store.getCart();
    const found = cart.find((c) => c.productId === productId);
    if (found) found.qty += qty;
    else cart.push({ productId, qty });
    store.saveCart(cart);
  },
  removeFromCart(productId: string) {
    store.saveCart(store.getCart().filter((c) => c.productId !== productId));
  },
  updateQty(productId: string, qty: number) {
    const cart = store.getCart().map((c) =>
      c.productId === productId ? { ...c, qty: Math.max(1, qty) } : c,
    );
    store.saveCart(cart);
  },
  clearCart() {
    store.saveCart([]);
  },

  // Orders (cache — usa fetchUserOrders / fetchAllOrders para datos frescos)
  getOrders(): Order[] {
    return read<Order[]>(KEYS.orders, []);
  },
  async addOrder(o: Order): Promise<Order> {
    // si está logueado, asocia el pedido
    const { data: { user } } = await supabase.auth.getUser();
    const full: Order = { ...o, user_id: user?.id ?? null };
    write(KEYS.orders, [full, ...store.getOrders()]);
    if (SUPABASE_READY) {
      const { error } = await supabase.from("orders").insert({
        code: full.code,
        user_id: full.user_id ?? null,
        items: full.items,
        total: full.total,
        subtotal: full.subtotal ?? full.total,
        discount: full.discount ?? 0,
        coupon_code: full.coupon_code ?? null,
        dedicatoria: full.dedicatoria ?? null,
        customer: full.customer ?? null,
        shipping_address: full.shipping_address ?? null,
        sender_name: full.sender_name ?? null,
        recipient_name: full.recipient_name ?? null,
        delivery_date: full.delivery_date ?? null,
        delivery_time: full.delivery_time ?? null,
        delivery_zone: full.delivery_zone ?? null,
        delivery_cost: full.delivery_cost ?? 0,
        payment_method: full.payment_method ?? "whatsapp",
        payment_status: full.payment_status ?? "pending",
        status: full.status,
        created_at: new Date(full.createdAt).toISOString(),
      });
      logErr("addOrder", error);
    }
    return full;
  },
  updateOrderStatus(code: string, status: Order["status"]) {
    write(
      KEYS.orders,
      store.getOrders().map((o) => (o.code === code ? { ...o, status } : o)),
    );
    if (SUPABASE_READY) {
      supabase.from("orders").update({ status }).eq("code", code).then(({ error }) => logErr("updateOrderStatus", error));
    }
  },
  async fetchUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(100);
    if (error || !data) { logErr("fetchUserOrders", error); return []; }
    return data.map(rowToOrder);
  },
  async fetchAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error || !data) { logErr("fetchAllOrders", error); return []; }
    return data.map(rowToOrder);
  },
  findOrder(code: string) {
    return store.getOrders().find((o) => o.code.toLowerCase() === code.toLowerCase());
  },
  async findOrderRemote(code: string): Promise<Order | null> {
    if (!SUPABASE_READY) return store.findOrder(code) ?? null;
    const { data, error } = await supabase
      .from("orders").select("*").ilike("code", code.trim()).maybeSingle();
    if (error || !data) return store.findOrder(code) ?? null;
    const o = rowToOrder(data);
    // refresh cache so historial muestra el pedido
    const cached = store.getOrders().filter((x) => x.code !== o.code);
    write(KEYS.orders, [o, ...cached]);
    return o;
  },
  async applyCoupon(code: string): Promise<{ code: string; discount_percent: number } | null> {
    if (!code.trim()) return null;
    const { data, error } = await supabase.rpc("apply_coupon", { _code: code.trim() });
    if (error) { logErr("applyCoupon", error); return null; }
    const row = Array.isArray(data) ? data[0] : data;
    return row ?? null;
  },

  // Banner / Popup
  getBanner(): Banner {
    return read<Banner>(KEYS.banner, DEFAULT_BANNER);
  },
  saveBanner(b: Banner) {
    write(KEYS.banner, b);
    if (SUPABASE_READY) {
      supabase.from("site_settings").upsert({ key: "banner", value: b, updated_at: new Date().toISOString() })
        .then(({ error }) => logErr("saveBanner", error));
    }
  },
  getPopup(): Popup {
    return read<Popup>(KEYS.popup, DEFAULT_POPUP);
  },
  savePopup(p: Popup) {
    write(KEYS.popup, p);
    // reset seen so admin changes show again
    if (isBrowser()) localStorage.removeItem(KEYS.popupSeen);
    if (SUPABASE_READY) {
      supabase.from("site_settings").upsert({ key: "popup", value: p, updated_at: new Date().toISOString() })
        .then(({ error }) => logErr("savePopup", error));
    }
  },
  popupSeen(id: string) {
    return isBrowser() && localStorage.getItem(KEYS.popupSeen) === id;
  },
  markPopupSeen(id: string) {
    if (isBrowser()) localStorage.setItem(KEYS.popupSeen, id);
  },

  // Site images (galería editable)
  getSiteImages(): SiteImages {
    return { ...DEFAULT_SITE_IMAGES, ...read<SiteImages>(KEYS.images, {}) };
  },
  saveSiteImages(images: SiteImages) {
    write(KEYS.images, images);
    if (SUPABASE_READY) {
      supabase.from("site_settings").upsert({ key: "site_images", value: images, updated_at: new Date().toISOString() })
        .then(({ error }) => logErr("saveSiteImages", error));
    }
  },

  // Delivery zones
  getDeliveryZones(): DeliveryZone[] {
    return read<DeliveryZone[]>(KEYS.delivery_zones, []);
  },
  saveDeliveryZones(zones: DeliveryZone[]) {
    write(KEYS.delivery_zones, zones);
    if (SUPABASE_READY) {
      supabase.from("site_settings").upsert({ key: "delivery_zones", value: zones, updated_at: new Date().toISOString() })
        .then(({ error }) => logErr("saveDeliveryZones", error));
    }
  },
  async fetchDeliveryZones(): Promise<DeliveryZone[]> {
    if (SUPABASE_READY) {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "delivery_zones").maybeSingle();
      if (data?.value) {
        const zones = data.value as DeliveryZone[];
        write(KEYS.delivery_zones, zones);
        return zones;
      }
    }
    return store.getDeliveryZones();
  },
};

function rowToOrder(d: any): Order {
  return {
    code: d.code,
    user_id: d.user_id ?? null,
    items: d.items,
    total: d.total,
    subtotal: d.subtotal ?? undefined,
    discount: d.discount ?? 0,
    coupon_code: d.coupon_code ?? null,
    dedicatoria: d.dedicatoria ?? undefined,
    customer: d.customer ?? undefined,
    shipping_address: d.shipping_address ?? null,
    sender_name: d.sender_name ?? undefined,
    recipient_name: d.recipient_name ?? undefined,
    delivery_date: d.delivery_date ?? undefined,
    delivery_time: d.delivery_time ?? undefined,
    delivery_zone: d.delivery_zone ?? undefined,
    delivery_cost: d.delivery_cost ?? 0,
    payment_method: d.payment_method ?? "whatsapp",
    payment_status: d.payment_status ?? "pending",
    status: d.status,
    createdAt: new Date(d.created_at).getTime(),
  };
}

// ============================================================
// Hidratación desde Supabase (se llama desde App.tsx al montar)
// ============================================================
export async function hydrateAll() {
  if (!SUPABASE_READY || !isBrowser()) return;
  await Promise.all([hydrateProducts(), hydrateOrders(), hydrateSettings()]);
}

async function hydrateProducts() {
  const { data, error } = await supabase
    .from("products").select("*").order("created_at", { ascending: false });
  if (error) return logErr("hydrateProducts", error);
  if (!data) return;
  if (data.length === 0) {
    // tabla vacía: subir seed solo la primera vez
    const rows = SEED_PRODUCTS.map(toProductRow);
    const { error: insErr } = await supabase.from("products").upsert(rows);
    if (!insErr) write(KEYS.products, SEED_PRODUCTS);
    return;
  }
  write(KEYS.products, data.map(fromProductRow));
}

async function hydrateOrders() {
  const { data, error } = await supabase
    .from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) return logErr("hydrateOrders", error);
  if (!data) return;
  const orders: Order[] = data.map((d: any) => ({
    code: d.code, items: d.items, total: d.total,
    dedicatoria: d.dedicatoria ?? undefined, customer: d.customer ?? undefined,
    status: d.status, createdAt: new Date(d.created_at).getTime(),
  }));
  write(KEYS.orders, orders);
}

async function hydrateSettings() {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) return logErr("hydrateSettings", error);
  if (!data) return;
  const banner = data.find((x: any) => x.key === "banner")?.value as Banner | undefined;
  const popup  = data.find((x: any) => x.key === "popup")?.value  as Popup  | undefined;
  const images = data.find((x: any) => x.key === "site_images")?.value as SiteImages | undefined;
  const zones  = data.find((x: any) => x.key === "delivery_zones")?.value as DeliveryZone[] | undefined;
  if (banner) write(KEYS.banner, banner);
  else if (SUPABASE_READY) {
    await supabase.from("site_settings").upsert({ key: "banner", value: DEFAULT_BANNER });
  }
  if (popup) write(KEYS.popup, popup);
  else if (SUPABASE_READY) {
    await supabase.from("site_settings").upsert({ key: "popup", value: DEFAULT_POPUP });
  }
  if (images) write(KEYS.images, images);
  if (zones) write(KEYS.delivery_zones, zones);
}

export function generateTrackingCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `DLX-${n}`;
}

export function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export const WHATSAPP_NUMBER = "573006301123";
export const WHATSAPP_DISPLAY = "300 630 1123";
export const CONTACT_EMAIL = "floristeriadeluxe@gmail.com";
export const STORE_ADDRESS = "Carrera 43 #79-226 local 1, Barranquilla";
