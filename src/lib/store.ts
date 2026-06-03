// Local store backed by localStorage. Structured so it can be swapped for Supabase later.
// All reads are SSR-safe (no-ops if window is undefined).

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

export type Order = {
  code: string;
  items: { productId: string; title: string; qty: number; price: number }[];
  total: number;
  dedicatoria?: string;
  customer?: { name?: string; phone?: string; address?: string };
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

const KEYS = {
  products: "fdx.products",
  cart: "fdx.cart",
  orders: "fdx.orders",
  banner: "fdx.banner",
  popup: "fdx.popup",
  popupSeen: "fdx.popup.seen",
  user: "fdx.user",
  admin: "fdx.admin",
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
  },
  deleteProduct(id: string) {
    write(KEYS.products, store.getProducts().filter((p) => p.id !== id));
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

  // Orders
  getOrders(): Order[] {
    return read<Order[]>(KEYS.orders, []);
  },
  addOrder(o: Order) {
    write(KEYS.orders, [o, ...store.getOrders()]);
  },
  updateOrderStatus(code: string, status: Order["status"]) {
    write(
      KEYS.orders,
      store.getOrders().map((o) => (o.code === code ? { ...o, status } : o)),
    );
  },
  findOrder(code: string) {
    return store.getOrders().find((o) => o.code.toLowerCase() === code.toLowerCase());
  },

  // Banner / Popup
  getBanner(): Banner {
    return read<Banner>(KEYS.banner, DEFAULT_BANNER);
  },
  saveBanner(b: Banner) {
    write(KEYS.banner, b);
  },
  getPopup(): Popup {
    return read<Popup>(KEYS.popup, DEFAULT_POPUP);
  },
  savePopup(p: Popup) {
    write(KEYS.popup, p);
    // reset seen so admin changes show again
    if (isBrowser()) localStorage.removeItem(KEYS.popupSeen);
  },
  popupSeen(id: string) {
    return isBrowser() && localStorage.getItem(KEYS.popupSeen) === id;
  },
  markPopupSeen(id: string) {
    if (isBrowser()) localStorage.setItem(KEYS.popupSeen, id);
  },

  // User (mock auth)
  getUser(): { loggedIn: boolean; name: string } {
    return read(KEYS.user, { loggedIn: false, name: "Invitado" });
  },
  setUser(u: { loggedIn: boolean; name: string }) {
    write(KEYS.user, u);
  },

  // Admin
  isAdmin(): boolean {
    return read<boolean>(KEYS.admin, false);
  },
  setAdmin(v: boolean) {
    write(KEYS.admin, v);
  },
};

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