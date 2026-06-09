import { Helmet } from "react-helmet-async";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/hooks";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Todos",
  "Arreglos Florales",
  "Fúnebre",
  "Desayunos y Anchetas",
  "Bodas",
  "Eventos",
  "Plantas",
  "Complementos",
];

export default function Tienda() {
  const { products } = useProducts();
  const [params, setParams] = useSearchParams();
  const [cat, setCat] = useState(params.get("cat") || "Todos");

  useEffect(() => {
    setCat(params.get("cat") || "Todos");
  }, [params]);

  const filtered = useMemo(
    () => (cat === "Todos" ? products : products.filter((p) => p.category === cat)),
    [cat, products],
  );

  const change = (c: string) => {
    setCat(c);
    if (c === "Todos") setParams({});
    else setParams({ cat: c });
  };

  return (
    <>
      <Helmet>
        <title>Tienda — Floristería Deluxe</title>
        <meta name="description" content="Compra arreglos florales online en Barranquilla. Bodas, cumpleaños, fúnebre y desayunos." />
      </Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60">
        <div className="container mx-auto px-4 text-center">
          <p className="font-script text-3xl text-rose-deep">Nuestra colección</p>
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic">Tienda Deluxe</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Arreglos diseñados a mano con las flores más frescas de la temporada.
          </p>
        </div>
      </section>
      {/* Filtros sticky con scroll horizontal en móvil */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="container mx-auto px-2 md:px-4 py-2.5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar md:justify-center pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => change(c)}
                className={`shrink-0 px-4 h-9 rounded-full text-sm font-serif italic transition-all ${
                  cat === c
                    ? "bg-burgundy text-primary-foreground shadow-soft"
                    : "bg-rose-soft/60 text-burgundy hover:bg-rose-mid/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <section className="container mx-auto px-3 md:px-4 py-6 md:py-10">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No hay productos en esta categoría aún.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-5">
            {filtered.map((p, i) => (
              <Reveal key={p.id} direction="up" delay={i * 0.04}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}