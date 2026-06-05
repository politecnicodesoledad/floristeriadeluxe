import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart, useProducts } from "@/lib/hooks";
import { formatCOP, store } from "@/lib/store";
import { Link, useNavigate } from "react-router-dom";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { items } = useCart();
  const { products } = useProducts();
  const nav = useNavigate();

  const lines = useMemo(
    () =>
      items
        .map((i) => {
          const p = products.find((x) => x.id === i.productId);
          return p ? { ...i, product: p } : null;
        })
        .filter(Boolean) as { productId: string; qty: number; product: NonNullable<ReturnType<typeof products.find>> }[],
    [items, products],
  );

  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  const goCheckout = () => {
    onOpenChange(false);
    nav("/checkout");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-background w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b border-border/60">
            <SheetTitle className="font-serif text-burgundy flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Tu Carrito
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {lines.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-20 h-20 rounded-full bg-rose-soft flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-rose-deep" />
                </div>
                <p className="font-serif text-burgundy text-lg">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">Descubre nuestros arreglos exclusivos.</p>
                <Link to="/tienda" onClick={() => onOpenChange(false)}>
                  <Button className="mt-5 bg-burgundy hover:bg-burgundy-light text-primary-foreground">Ir a la tienda</Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {lines.map((l) => (
                  <li key={l.productId} className="flex gap-3 pb-4 border-b border-border/60 last:border-0">
                    <img src={l.product.image} alt="" className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-burgundy text-sm leading-tight line-clamp-2">{l.product.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatCOP(l.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center border border-border rounded-full">
                          <button onClick={() => store.updateQty(l.productId, l.qty - 1)} className="w-7 h-7 flex items-center justify-center text-burgundy" aria-label="Restar">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{l.qty}</span>
                          <button onClick={() => store.updateQty(l.productId, l.qty + 1)} className="w-7 h-7 flex items-center justify-center text-burgundy" aria-label="Sumar">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => store.removeFromCart(l.productId)} className="ml-auto text-muted-foreground hover:text-destructive" aria-label="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-burgundy text-sm">
                      {formatCOP(l.product.price * l.qty)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {lines.length > 0 && (
            <div className="border-t border-border/60 p-5 space-y-3 bg-cream">
              <div className="flex items-center justify-between">
                <span className="font-serif text-burgundy text-lg">Total</span>
                <span className="font-serif text-burgundy text-xl font-semibold">{formatCOP(total)}</span>
              </div>
              <Button onClick={goCheckout} className="w-full bg-burgundy hover:bg-burgundy-light text-primary-foreground h-12 text-base">
                <CreditCard className="w-4 h-4 mr-2" /> Finalizar compra
              </Button>
              <p className="text-[11px] text-center text-muted-foreground">Pagas en línea con Bold o confirmas por WhatsApp</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}