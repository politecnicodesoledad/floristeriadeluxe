import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, MessageCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/hooks";
import { formatCOP, store, WHATSAPP_NUMBER } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { resolveAssetUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function Producto() {
  const { id } = useParams();
  const { products } = useProducts();
  const [qty, setQty] = useState(1);
  const product = products.find((p) => p.id === id);
  const nav = useNavigate();

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-burgundy">Producto no encontrado</h1>
        <Link to="/tienda" className="text-rose-deep underline mt-4 inline-block">Volver a la tienda</Link>
      </div>
    );
  }
  const similar = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const add = () => {
    store.addToCart(product.id, qty);
    toast.success("Agregado al carrito", { description: `${product.title} x${qty}` });
  };
  const buyWhatsApp = () => {
    const productLink = `${window.location.origin}/producto/${product.id}`;
    const text = `Hola Floristería Deluxe 🌷\nQuiero pedir:\n• ${product.title} x${qty} — ${formatCOP(product.price * qty)}\n🔗 ${productLink}\n\n¿Me ayudas a confirmar?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };
  const buyBold = () => {
    store.addToCart(product.id, qty);
    nav("/checkout");
  };

  return (
    <>
      <Helmet>
        <title>{product.title} — Floristería Deluxe</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <section className="container mx-auto px-4 py-8 md:py-12">
        <Link to="/tienda" className="text-sm text-burgundy hover:text-rose-deep">← Volver a la tienda</Link>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-6">
          <Reveal direction="left">
            <div className="rounded-3xl overflow-hidden bg-rose-soft shadow-luxe">
              <img src={resolveAssetUrl(product.image)} alt={product.title} className="w-full aspect-square object-cover" />
            </div>
          </Reveal>
          <Reveal direction="right">
            <p className="text-xs uppercase tracking-widest text-rose-deep">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-5xl text-burgundy italic mt-1">{product.title}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl text-burgundy font-semibold">{formatCOP(product.price)}</span>
              {product.originalPrice && (
                <span className="text-muted-foreground line-through text-lg">{formatCOP(product.originalPrice)}</span>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed mt-5">{product.description}</p>
            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-full">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-burgundy" aria-label="Restar">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-burgundy font-medium">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-burgundy" aria-label="Sumar">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button onClick={add} variant="outline" className="flex-1 border-burgundy text-burgundy hover:bg-rose-soft h-12 rounded-full">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Añadir al carrito
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button onClick={buyBold} className="bg-burgundy hover:bg-burgundy-light text-primary-foreground h-12 rounded-full">
                  <CreditCard className="w-4 h-4 mr-2" /> Pagar ahora (Bold)
                </Button>
                <Button onClick={buyWhatsApp} className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-full">
                  <MessageCircle className="w-4 h-4 mr-2" /> Comprar por WhatsApp
                </Button>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-rose-soft rounded-xl py-3 px-2"><p className="text-rose-deep font-semibold">Envío gratis</p><p className="text-muted-foreground mt-0.5">Bquilla / Soledad</p></div>
              <div className="bg-rose-soft rounded-xl py-3 px-2"><p className="text-rose-deep font-semibold">Flores frescas</p><p className="text-muted-foreground mt-0.5">Garantizadas</p></div>
              <div className="bg-rose-soft rounded-xl py-3 px-2"><p className="text-rose-deep font-semibold">Pedido WhatsApp</p><p className="text-muted-foreground mt-0.5">Atención 24/7</p></div>
            </div>
          </Reveal>
        </div>
      </section>
      {similar.length > 0 && (
        <section className="container mx-auto px-4 py-10 md:py-16">
          <Reveal><h2 className="font-serif text-2xl md:text-3xl text-burgundy italic text-center mb-8">Te puede gustar también</h2></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
