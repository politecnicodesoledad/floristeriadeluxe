import { Helmet } from "react-helmet-async";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_EMAIL, STORE_ADDRESS, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/store";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

export default function Contacto() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const send = () => {
    const text = `Hola Floristería Deluxe, soy ${name}.\n\n${msg}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };
  return (
    <>
      <Helmet><title>Contacto — Floristería Deluxe</title></Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <p className="font-script text-3xl text-rose-deep">Hablemos</p>
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic">Contacto</h1>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
        <Reveal direction="left">
          <h2 className="font-serif text-2xl text-burgundy italic mb-5">Información</h2>
          <ul className="space-y-4">
            <li className="flex gap-3"><div className="w-10 h-10 rounded-full bg-rose-soft text-rose-deep flex items-center justify-center shrink-0"><MapPin className="w-4 h-4" /></div><div><p className="font-serif text-burgundy">Dirección</p><p className="text-sm text-muted-foreground">{STORE_ADDRESS}</p></div></li>
            <li className="flex gap-3"><div className="w-10 h-10 rounded-full bg-rose-soft text-rose-deep flex items-center justify-center shrink-0"><Phone className="w-4 h-4" /></div><div><p className="font-serif text-burgundy">WhatsApp</p><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-sm text-muted-foreground hover:text-burgundy">{WHATSAPP_DISPLAY}</a></div></li>
            <li className="flex gap-3"><div className="w-10 h-10 rounded-full bg-rose-soft text-rose-deep flex items-center justify-center shrink-0"><Mail className="w-4 h-4" /></div><div><p className="font-serif text-burgundy">Email</p><a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-muted-foreground hover:text-burgundy break-all">{CONTACT_EMAIL}</a></div></li>
          </ul>
        </Reveal>
        <Reveal direction="right">
          <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-soft">
            <h2 className="font-serif text-2xl text-burgundy italic mb-5">Envíanos un mensaje</h2>
            <div className="space-y-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="¿En qué podemos ayudarte?" rows={6} />
              <Button onClick={send} disabled={!name || !msg} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"><MessageCircle className="w-4 h-4 mr-2" /> Enviar por WhatsApp</Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
