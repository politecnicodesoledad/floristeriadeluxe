import { Helmet } from "react-helmet-async";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/hooks";
import { Search, X } from "lucide-react";

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
  const [search, setSearch] = useState(params.get("q") || "");

  useEffect(() => {
    setCat(params.get("cat") || "Todos");
    setSearch(params.get("q") || "");
  }, [params]);

  const filtered = useMemo(() => {
    let list = cat === "Todos" ? products : products.filter((p) => p.category === cat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cat, products, search]);

  const changecat = (c: string) => {
    setCat(c);
    const newParams: Record<string, string> = {};
    if (c !== "Todos") newParams.cat = c;
    if (search) newParams.q = search;
    setParams(newParams);
  };

  const changeSearch = (q: string) => {
    setSearch(q);
    const newParams: Record<string, string> = {};
    if (cat !== "Todos") newParams.cat = cat;
    if (q) newParams.q = q;
    setParams(newParams);
  };

  return (
    <>
      <Helmet>
        <title>Tienda — Floristería Deluxe</title>
        <meta name="description" content="Compra arreglos florales online en Barranquilla y todo el Atlántico. Bodas, cumpleaños, fúnebre y desayunos." />
      </Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60">
        <div className="container mx-auto px-4 text-center">
          <p className="font-script text-3xl text-rose-deep">Nuestra colección</p>
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic">Tienda Deluxe</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Arreglos diseñados a mano con las flores más frescas de la temporada.
          </p>
          {/* Barra de búsqueda */}
          <div className="mt-5 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Buscar arreglo, desayuno, planta..."
              className="w-full pl-10 pr-10 py-3 rounded-full border border-border/60 bg-white/80 backdrop-blur text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 shadow-soft"
            />
            {search && (
              <button
                onClick={() => changeSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-burgundy"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filtros por categoría */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="container mx-auto px-2 md:px-4 py-2.5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar md:justify-center pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => changecat(c)}
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
        {search && (
          <p className="text-sm text-muted-foreground mb-4 italic">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para <strong>"{search}"</strong>
            {cat !== "Todos" && <> en <strong>{cat}</strong></>}
          </p>
        )}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No encontramos productos para tu búsqueda.</p>
            <button onClick={() => { changeSearch(""); changecat("Todos"); }} className="mt-3 text-burgundy underline text-sm">
              Ver todos los productos
            </button>
          </div>
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
