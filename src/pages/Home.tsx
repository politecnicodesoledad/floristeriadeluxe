import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Award, Flower, Gift, MessageCircle, Truck } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useBanner, useProducts } from "@/lib/hooks";

const categories = [
  { name: "Cumpleaños", slug: "Cumpleaños", img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80" },
  { name: "Bodas", slug: "Bodas", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80" },
  { name: "Fúnebre", slug: "Fúnebre", img: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80" },
  { name: "Desayunos", slug: "Desayunos", img: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80" },
];

const promises = [
  { icon: Flower, title: "Arreglos Exclusivos", text: "Más de 230 diseños florales únicos disponibles." },
  { icon: Gift, title: "Para Toda Ocasión", text: "Bodas, cumpleaños, fúnebre, desayunos y más." },
  { icon: MessageCircle, title: "Atención por WhatsApp", text: "Te atendemos de inmediato, 24/7." },
  { icon: Truck, title: "Envíos Gratis", text: "Cobertura en Barranquilla y Soledad." },
];

export default function Home() {
  const banner = useBanner();
  const { products } = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Floristería Deluxe — Flores perfectas para momentos inolvidables</title>
        <meta name="description" content="Arreglos florales exclusivos en Barranquilla y Soledad. Bodas, cumpleaños, fúnebre y desayunos sorpresa. Envíos gratis." />
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute top-10 left-6 w-24 h-24 opacity-30 hidden md:block">
          <img src="https://i.ibb.co/NgPCTK4k/Logo-Floristeria-Deluxe.png" alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="container mx-auto px-4 py-14 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <Reveal direction="left">
            <p className="font-script text-3xl md:text-4xl text-rose-deep mb-2">Floristería Deluxe</p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-burgundy leading-[1.05] italic">
              {banner.heroTitle}
              <br />
              <span className="font-script not-italic text-rose-deep text-5xl md:text-7xl lg:text-8xl block mt-2">
                {banner.heroTitleAccent}
              </span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground italic max-w-md">
              {banner.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/tienda">
                <Button size="lg" className="bg-burgundy hover:bg-burgundy-light text-primary-foreground rounded-full px-7 h-12 shadow-soft">
                  Explorar Tienda <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/quienes-somos">
                <Button size="lg" variant="outline" className="border-burgundy text-burgundy hover:bg-rose-soft rounded-full px-7 h-12">
                  Nuestra Historia
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Award className="w-4 h-4 text-gold" /> Desde 2010</div>
              <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-gold" /> Envío gratis</div>
              <div className="flex items-center gap-1.5"><Flower className="w-4 h-4 text-gold" /> 230+ diseños</div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-72 h-72 md:w-96 md:h-96 bg-rose-mid/50 rounded-[40%] blur-2xl" />
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=85"
                alt="Bouquet de rosas"
                className="relative rounded-[2rem] shadow-luxe w-full aspect-[4/5] object-cover"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-5 -left-5 bg-cream rounded-2xl shadow-soft p-4 hidden sm:block"
              >
                <p className="text-xs text-rose-deep uppercase tracking-widest">Envío hoy</p>
                <p className="font-serif text-burgundy text-xl">Barranquilla</p>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROMESAS */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {promises.map((p, i) => (
            <Reveal key={p.title} direction="up" delay={i * 0.08}>
              <div className="bg-card rounded-2xl p-4 md:p-6 border border-border/60 hover:border-rose-mid hover:shadow-soft transition-all h-full">
                <div className="w-11 h-11 rounded-full bg-rose-soft flex items-center justify-center text-rose-deep mb-3">
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif italic text-burgundy text-base md:text-lg">{p.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <Reveal>
          <div className="text-center mb-10">
            <p className="font-script text-3xl text-rose-deep">Explora</p>
            <h2 className="font-serif text-3xl md:text-5xl text-burgundy italic">Categorías</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Reveal key={c.slug} direction="up" delay={i * 0.08}>
              <Link
                to={`/tienda?cat=${encodeURIComponent(c.slug)}`}
                className="group block relative bg-gradient-rose rounded-3xl p-5 md:p-6 pt-20 md:pt-24 overflow-visible hover:shadow-soft transition-all"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-cream shadow-soft ring-4 ring-background group-hover:scale-105 transition-transform">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-serif italic text-burgundy text-lg md:text-xl text-center mt-2">{c.name}</h3>
                <p className="text-center text-xs md:text-sm text-rose-deep underline mt-2">Comprar Ahora</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <Reveal>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <p className="font-script text-2xl text-rose-deep">Últimos</p>
              <h2 className="font-serif text-3xl md:text-4xl text-burgundy italic">Arreglos Destacados</h2>
            </div>
            <Link to="/tienda" className="text-sm text-burgundy underline underline-offset-4 hover:text-rose-deep">
              Ver toda la tienda →
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {featured.map((p, i) => (
            <Reveal key={p.id} direction="up" delay={i * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <Reveal direction="fade">
          <div className="relative overflow-hidden rounded-3xl shadow-luxe min-h-[260px] md:min-h-[340px] grid md:grid-cols-2">
            <div className="bg-accent/80 p-8 md:p-12 flex flex-col justify-center text-cream">
              <p className="text-xs uppercase tracking-[0.3em] text-cream/90 mb-3">Mejor que un pastel</p>
              <h3 className="font-serif text-3xl md:text-5xl leading-tight text-cream">{banner.promoTitle}</h3>
              <p className="mt-4 text-cream/90 max-w-md italic">{banner.promoSubtitle}</p>
              <Link to="/tienda?cat=Cumplea%C3%B1os" className="mt-6">
                <Button variant="outline" className="border-cream text-cream hover:bg-cream hover:text-burgundy w-fit rounded-none px-7 h-11 tracking-[0.25em] text-xs">
                  EXPLORAR
                </Button>
              </Link>
            </div>
            <div
              className="min-h-[200px] bg-cover bg-center"
              style={{ backgroundImage: "url(https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1200&q=85)" }}
            />
          </div>
        </Reveal>
      </section>

      {/* CLUB DE PUNTOS */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <Reveal direction="up">
          <div className="bg-gradient-to-br from-rose-soft via-cream to-accent/20 rounded-3xl p-8 md:p-14 text-center border border-rose-mid/40">
            <div className="flex justify-center mb-4">
              <img
                src="https://i.ibb.co/yc50fWW4/Captura-de-pantalla-2026-04-24-001156.png"
                alt="Club de Puntos Deluxe"
                className="h-16 w-16 object-contain"
              />
            </div>
            <p className="font-script text-2xl text-rose-deep">Club Exclusivo</p>
            <h2 className="font-serif text-3xl md:text-5xl text-burgundy italic mt-1">Puntos Deluxe</h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground leading-relaxed">
              Cada flor, cada punto, una experiencia deluxe. Únete al club exclusivo de Floristería Deluxe.
              Acumula puntos con cada compra y redime flores premium, decoración profesional y bonos especiales.
            </p>
            <a href="https://puntosdeluxe.com" target="_blank" rel="noopener" className="inline-block mt-6">
              <Button size="lg" className="bg-burgundy hover:bg-burgundy-light text-primary-foreground rounded-full px-8 h-12 shadow-soft">
                Unirme al Club
              </Button>
            </a>
          </div>
        </Reveal>
      </section>

      {/* EVENTOS */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <Reveal direction="left">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85"
              alt="Decoración de evento"
              className="rounded-3xl shadow-luxe w-full aspect-[4/3] object-cover"
            />
          </Reveal>
          <Reveal direction="right">
            <p className="font-script text-3xl text-rose-deep">Más que flores</p>
            <h2 className="font-serif text-3xl md:text-5xl text-burgundy italic mt-1">Decoramos tus eventos</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Diseñamos ambientaciones florales para bodas, quinces, bautizos y eventos corporativos.
              Nuestro equipo creativo cuida cada detalle para que tu momento sea inolvidable.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-foreground/80">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Diseño personalizado por evento</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Montaje y desmontaje incluidos</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> Asesoría sin costo por WhatsApp</li>
            </ul>
            <Link to="/contacto" className="inline-block mt-6">
              <Button className="bg-burgundy hover:bg-burgundy-light text-primary-foreground rounded-full px-7">
                Cotizar mi evento
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ACERCA */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <Reveal direction="left">
            <p className="font-script text-3xl text-rose-deep">Desde 2010</p>
            <h2 className="font-serif text-3xl md:text-4xl text-burgundy italic mt-1">
              Acerca de Nosotros: Pasión por cada detalle.
            </h2>
            <div className="space-y-4 mt-5 text-muted-foreground italic leading-relaxed">
              <p>Floristería Deluxe ha logrado ofrecer una gran variedad de diseños florales, incluyendo las más frescas y hermosas especies.</p>
              <p>La calidad de nuestras flores puede notarla al apreciar el color y el aroma de las variedades que empleamos.</p>
              <p>Recientemente lanzamos nuestra tienda online con entregas a domicilio en Barranquilla, Soledad y el área metropolitana.</p>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1487070183336-b863922373d4?w=900&q=85"
                alt="Tienda Floristería Deluxe"
                className="rounded-[3rem] shadow-luxe w-full aspect-[4/5] object-cover"
                style={{ borderRadius: "55% 45% 50% 50% / 40% 40% 60% 60%" }}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}