import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { formatCOP, store, type Product } from "@/lib/store";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    store.addToCart(product.id, 1);
    toast.success("Agregado al carrito", { description: product.title });
  };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
      <Link
        to={`/producto/${product.id}`}
        className="group block bg-card rounded-2xl overflow-hidden border border-border/60 hover:shadow-soft transition-shadow"
      >
        <div className="aspect-square overflow-hidden bg-rose-soft relative">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {product.originalPrice && (
            <span className="absolute top-2 left-2 bg-burgundy text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
              OFERTA
            </span>
          )}
        </div>
        <div className="p-3 md:p-4">
          <p className="text-[10px] md:text-xs uppercase tracking-wider text-rose-deep font-medium mb-1">
            {product.category}
          </p>
          <h3 className="font-serif text-burgundy text-sm md:text-base leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="min-w-0">
              {product.originalPrice && (
                <p className="text-[11px] text-muted-foreground line-through">
                  {formatCOP(product.originalPrice)}
                </p>
              )}
              <p className="text-sm md:text-base font-semibold text-burgundy">
                {formatCOP(product.price)}
              </p>
            </div>
            <button
              onClick={onAdd}
              aria-label="Añadir al carrito"
              className="shrink-0 w-9 h-9 rounded-full bg-burgundy text-primary-foreground flex items-center justify-center hover:bg-burgundy-light transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}