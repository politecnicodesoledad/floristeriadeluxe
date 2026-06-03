import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/Reveal";
import { WHATSAPP_NUMBER } from "@/lib/store";
import { Heart } from "lucide-react";

const ideas = [
  '"En cada pétalo escribo lo que mi voz aún no se atreve a decir."',
  '"Eres la razón de cada amanecer floreciendo en mi corazón."',
  '"Hoy te regalo flores; mañana te regalaría el mundo entero."',
  '"Que cada flor te recuerde lo única que eres para mí."',
];

export default function Dedicatoria() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const send = () => {
    const txt = `🌷 *Dedicatoria Floristería Deluxe*\n\nPara: ${to}\nDe: ${from}\n\n"${msg}"`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`, "_blank");
  };
  return (
    <>
      <Helmet><title>Dedicatorias — Floristería Deluxe</title></Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <Heart className="w-10 h-10 text-rose-deep mx-auto" />
          <p className="font-script text-3xl text-rose-deep mt-2">Palabras con flores</p>
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic">Dedicatorias</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Personaliza tu arreglo con un mensaje único. Nosotros lo escribimos en una hermosa tarjeta de regalo.</p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
        <Reveal direction="left">
          <div className="bg-card rounded-3xl border border-border/60 p-6 md:p-8 shadow-soft">
            <h2 className="font-serif text-2xl text-burgundy italic mb-5">Escribe tu mensaje</h2>
            <div className="space-y-4">
              <div><label className="text-sm text-burgundy">Para</label><Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Nombre del destinatario" className="mt-1" /></div>
              <div><label className="text-sm text-burgundy">De</label><Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Tu nombre" className="mt-1" /></div>
              <div><label className="text-sm text-burgundy">Mensaje</label><Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Escribe aquí lo que quieres decirle..." rows={6} className="mt-1" /></div>
              <Button onClick={send} disabled={!to || !msg} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12">Enviar por WhatsApp</Button>
            </div>
          </div>
        </Reveal>
        <Reveal direction="right">
          <h2 className="font-serif text-2xl text-burgundy italic mb-5">Ideas para inspirarte</h2>
          <div className="space-y-3">
            {ideas.map((i, idx) => (
              <div key={idx} className="bg-rose-soft border border-rose-mid/40 rounded-2xl p-5">
                <p className="font-serif italic text-burgundy">{i}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
