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
          <h2 className="font-serif text-3xl md:text-4xl text-burgundy italic">Floristería de lujo: sentimientos hechos flor.</h2>
          <div className="space-y-4 mt-5 text-muted-foreground italic leading-relaxed">
            <p>
              <b className="text-burgundy not-italic">floristeriadeluxe.com</b> es una floristería de lujo especializada en transmitir
              sentimientos y conectar emociones a través de sus variedades florales y todo tipo de detalles.
            </p>
            <p>
              Para Floristería Deluxe lo más importante es poder materializar los sentimientos que cada uno de nuestros clientes
              quiere transmitir o expresar, haciéndolos vivir una experiencia única e inigualable donde prime el amor, la alegría,
              el agradecimiento y la reconciliación.
            </p>
          </div>
        </Reveal>
      </section>
      <section className="container mx-auto px-4 py-6">
        <Reveal>
          <h3 className="font-serif text-2xl md:text-3xl text-burgundy italic text-center">Nuestra historia</h3>
          <div className="max-w-3xl mx-auto mt-5 space-y-4 text-muted-foreground italic leading-relaxed text-center md:text-left">
            <p>Desde el 2010 floristería Deluxe ha logrado ofrecer una gran variedad de diseños florales, incluyendo las más frescas y hermosas especies.</p>
            <p>La calidad de nuestras flores puede notarla al apreciar el color y el aroma de las variedades que empleamos. La duración es sin duda el principal elemento a considerar en la escala de cualidades que maneja nuestros productos.</p>
            <p>Para dinamizar el mercado, la floristería recientemente lanzó <b className="text-burgundy not-italic">floristeriadeluxe.com</b>: una tienda de detalles y flores online con entregas a domicilio en cualquier lugar de Barranquilla, Soledad y su área metropolitana. Ofrecemos una atención profesional en el diseño, calidad y precios de cada uno de nuestros detalles, arreglos florales y servicios, siendo nuestros principales valores la <b className="text-burgundy not-italic">amabilidad, honestidad y responsabilidad</b>.</p>
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
