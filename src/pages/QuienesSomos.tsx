import { Helmet } from "react-helmet-async";
import { Reveal } from "@/components/Reveal";
import { Award, Flower, Heart, Sparkles } from "lucide-react";

const values = [
  { icon: Flower, title: "Flores frescas", text: "Seleccionadas a diario de los mejores cultivos." },
  { icon: Heart, title: "Amor por el detalle", text: "Cada arreglo es montado a mano por nuestros diseñadores." },
  { icon: Award, title: "Más de 15 años", text: "Acompañando los momentos especiales de Barranquilla." },
  { icon: Sparkles, title: "Experiencia Deluxe", text: "Empaque premium y entrega cuidadosa garantizada." },
];

export default function QuienesSomos() {
  return (
    <>
      <Helmet><title>Quiénes somos — Floristería Deluxe</title></Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <p className="font-script text-3xl text-rose-deep">Nuestra historia</p>
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic">Quiénes Somos</h1>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
        <Reveal direction="left">
          <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=85" alt="Tienda Floristería Deluxe" className="w-full aspect-[4/5] object-cover shadow-luxe" style={{ borderRadius: "55% 45% 50% 50% / 40% 40% 60% 60%" }} />
        </Reveal>
        <Reveal direction="right">
          <h2 className="font-serif text-3xl md:text-4xl text-burgundy italic">Pasión por cada detalle para tus fechas especiales.</h2>
          <div className="space-y-4 mt-5 text-muted-foreground italic leading-relaxed">
            <p>Desde el 2010 Floristería Deluxe ha logrado ofrecer una gran variedad de diseños florales, incluyendo las más frescas y hermosas especies.</p>
            <p>La calidad de nuestras flores puede notarla al apreciar el color y el aroma de las variedades que empleamos.</p>
            <p>Lanzamos floristeriadeluxe.com con entregas a domicilio en Barranquilla, Soledad y el área metropolitana.</p>
          </div>
        </Reveal>
      </section>
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {values.map((v, i) => (
            <Reveal key={v.title} direction="up" delay={i * 0.08}>
              <div className="bg-card rounded-2xl p-5 md:p-6 border border-border/60 text-center hover:shadow-soft transition-shadow h-full">
                <div className="w-12 h-12 rounded-full bg-rose-soft text-rose-deep mx-auto flex items-center justify-center mb-3"><v.icon className="w-5 h-5" /></div>
                <h3 className="font-serif italic text-burgundy">{v.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
