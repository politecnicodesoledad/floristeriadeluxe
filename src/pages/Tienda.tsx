import { Helmet } from "react-helmet-async";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/hooks";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Todos", "Cumpleaños", "Bodas", "Fúnebre", "Desayunos"];

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
      <section className="container mx-auto px-4 py-10">
        <Reveal>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                onClick={() => change(c)}
                variant={cat === c ? "default" : "outline"}
                className={cat === c ? "bg-burgundy hover:bg-burgundy-light text-primary-foreground rounded-full" : "border-burgundy/40 text-burgundy hover:bg-rose-soft rounded-full"}
              >
                {c}
              </Button>
            ))}
          </div>
        </Reveal>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No hay productos en esta categoría aún.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
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