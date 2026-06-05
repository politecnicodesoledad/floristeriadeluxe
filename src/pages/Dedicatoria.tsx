import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { Heart, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES: { id: string; title: string; messages: string[] }[] = [
  {
    id: "cumpleanos",
    title: "Cumpleaños Feliz",
    messages: [
      "¡Feliz cumpleaños! Que en este día tan especial, Dios te bendiga con mucha felicidad. Que en la vida siempre encuentres razones para sonreír y dar gracias.",
      "¡Feliz cumpleaños! Que este día sea especial y lo vivas en grande. Y que tu vida sea larga y esté llena de felicidad. Te deseo lo mejor porque te lo mereces.",
      "Eres una persona con un gran corazón y es un regalo tenerte cerca. Nunca dejes de luchar por tus sueños ni te dejes abatir por los fracasos. Cada día levántate con ganas de conquistar el mundo y así será. ¡Yo creo en ti!",
      "Hace unos años, una persona muy especial vino al mundo para hacerlo un lugar mejor. ¡Feliz cumpleaños! Que disfrutes de este día con ilusión y mucha alegría.",
      "Te deseo felicidad, salud y que todos tus sueños se hagan realidad. Que tu vida sea larga para que durante muchos años tu luz interior ilumine a los que están cerca de ti.",
      "Llegó el momento de celebrar; es tu cumpleaños. ¡Felicitaciones! Me alegra mucho que estés cumpliendo un año más de vida y deseo que sea el mejor que hayas vivido.",
    ],
  },
  {
    id: "agradecimiento",
    title: "Agradecimiento",
    messages: [
      "Gracias por acogerme en su hogar y hacerme sentir parte de su familia, los quiero un montón.",
      "No tengo palabras para agradecer a Dios por traerme personas tan buenas a mi vida como ustedes, los llevo en el corazón.",
      "Gracias por llenar mi corazón en el momento que más lo necesitaba.",
      "Por mucho que me esfuerce, no encuentro maneras de agradecerte tus esfuerzos tal y como te lo mereces.",
      "Aunque estés lejos, mi corazón nunca olvidará que somos amigos y que estamos unidos por miles de aventuras y desafíos que supimos vencer juntos. Gracias por existir.",
      "La gratitud, como ciertas flores, no se da en la altura y mejor reverdece en la tierra buena de los humildes. Gracias por tanto.",
      "Me gustaría agradecértelo de todo corazón, pero para ti, mi querido amigo/a, mi corazón no tiene fondo.",
      "Aprendo cada día que estar contigo es la fortaleza de mi vida, por todo lo que me das, por tu amor incondicional, muchas pero muchas gracias.",
    ],
  },
  {
    id: "amor",
    title: "Para mi gran amor",
    messages: [
      "En esta fecha conviertes un día más en un día muy especial, lo conviertes en un día de sentimiento, nostalgia, y felicidad. ¡Feliz cumpleaños querida esposa!",
      "Desde el corazón te escribo para desearte un feliz día y un feliz año cariño, por cada segundo que me has regalado y me regalas. ¡Disfruta de tu día preciosa, te quiero!",
      "Ni en un millón de frases bonitas de cumpleaños con mensajes de amor podría describir lo que siento por ti un día normal, menos podría describirlo hoy. ¡Feliz cumpleaños esposa amada!",
      "Aprovecho esta felicitación para recordarte que eres la persona que más quiero en este mundo. Gracias por existir y elegirme siempre a mí. ¡Feliz cumpleaños amor!",
      "Qué suerte tengo de tener a la mejor esposa del mundo a mi lado, una mujer que convierte todos mis días en días únicos e inolvidables. ¡Feliz cumpleaños amada mía!",
      "Por cuanto te quiero, por cuanto me quieres, por cuanto te necesito, por cuanto bien me haces… ¡Feliz cumpleaños, te amo sobre todo lo demás!",
    ],
  },
  {
    id: "aniversario",
    title: "Aniversario",
    messages: [
      "Hace mucho tiempo me hice tuya y tú te hiciste mío, hemos permanecido juntos a lo largo del tiempo, hemos superado lágrimas, discusiones, disfrutado de risas y de victorias conjuntas. ¡Feliz aniversario!",
      "Un aniversario de bodas es la celebración del amor, la confianza, la tolerancia, tenacidad y compañerismo a lo largo de los años. ¡Feliz aniversario!",
      "Conocerte fue el destino, convertirme en tu mejor amigo fue la mejor decisión, y que el amor creciera entre los dos, uno de los mejores regalos que nos dio la vida. Te amo.",
      "Puedo pasar toda la eternidad amándote, cuidándote, respetándote y demostrándote todos los días lo mucho que te adoro. ¡Te adoro!",
      "Hoy cumplimos un año más, uno más en el que te elijo. En mil vidas, en un millón de mundos, siempre te elegiré. ¡Feliz aniversario de bodas!",
      "Para siempre parece un largo tiempo, pero quiero pasarlo solo a tu lado, porque eres lo más maravilloso que ocurrió en mi vida. ¡Feliz aniversario mi reina preciosa!",
    ],
  },
  {
    id: "mama",
    title: "A mi madre",
    messages: [
      "Gracias Mamá, por ser la Madre más valiente y decidida del mundo, invencible ante la vida y luchadora por tus hijos. Gracias por tu amor infinito.",
      "Amo y admiro a esa Mujer, que nunca se cansó de luchar por su familia. ¡Te Amo Mamá!",
      "Una Madre no es la que da la vida, eso sería demasiado fácil. Una Madre es la que da el amor y entrega todo a sus hijos.",
      "Madre te quiero tanto, admiro y respeto, porque fuiste capaz de dar todo, sin recibir nada. De querer con todo tu corazón, sin esperar nada a cambio.",
      "Te admiro y quiero Madre querida, con todo mi ser y mi corazón, aunque sé que nunca podré quererte como lo has hecho tú con tu infinito amor.",
      "Mientras más pasa el tiempo, más me doy cuenta de que la mejor amiga que he tenido, ha sido mi Mamá.",
      "Te agradezco hoy Madre, todo lo que tengo, lo que soy y lo que un día seré. Todo ha sido gracias a ti. Gracias Madre mía.",
    ],
  },
  {
    id: "enamorar",
    title: "Para enamorar",
    messages: [
      "Tardé un minuto en conocerte, pero me tomará toda una vida poder llegar a olvidarte.",
      "Nadaría el mar entero, cruzaría la tierra entera, solo para acercarme y decirte cuánto te quiero.",
      "Tanto tiempo, tantas personas, tantas cosas y pensar que todo este tiempo yo solo te buscaba a ti.",
      "Quiero que nuestro amor no tenga un final feliz, porque simplemente no quiero que tenga final.",
      "Pueden existir miles de cielos con millones de estrellas pero para mí tú siempre serás la estrella que más brille.",
      "Sabes que estás enamorado cuando no puedes dormir por pensar en esa persona.",
      "Cada vez que me despido de ti, mi corazón pregunta cuándo te volveré a ver.",
    ],
  },
  {
    id: "condolencias",
    title: "Condolencias",
    messages: [
      "Las personas solamente mueren cuando sus seres queridos las dejan de recordar. Él fue una persona excepcional que siempre estará en nuestros recuerdos.",
      "Hay ausencias que son muy difíciles de llenar pero sabes que cuentas con todo mi apoyo para superar este difícil momento.",
      "Hemos compartido muchos momentos de la vida, y en estos momentos tan difíciles quiero que sepas que comparto tus sentimientos y que estaré cerca de ti si me necesitas.",
      "Dijo Jesús: Yo soy la resurrección y la vida; el que cree en mí, aunque esté muerto, vivirá.",
      "Nuestros corazones y oraciones les acompañen en este momento, estamos seguros que nuestro Dios todopoderoso les dará ánimo, paz y tranquilidad.",
      "No me atrevería a decir que entiendo tu dolor pero sí que puedes contar conmigo para apoyarte en estos duros momentos.",
      "Las personas que queremos no se van nunca, se quedan con nosotros, todo el día, en nuestra mente y en nuestro corazón.",
      "Que la paz del señor los llene de resignación y alivie el dolor de su corazón. Nuestras más sentidas condolencias.",
    ],
  },
];

export default function Dedicatoria() {
  const [active, setActive] = useState<string>("cumpleanos");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Mensaje copiado ✨");
    setTimeout(() => setCopied(null), 1800);
  };

  const current = CATEGORIES.find((c) => c.id === active)!;

  return (
    <>
      <Helmet>
        <title>Dedicatorias — Floristería Deluxe</title>
        <meta name="description" content="Mensajes para cumpleaños, agradecimiento, aniversario, condolencias y más. Copia y úsalos en tu tarjeta." />
      </Helmet>
      <section className="bg-gradient-hero py-12 md:py-16 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <Heart className="w-10 h-10 text-rose-deep mx-auto" />
          <p className="font-script text-3xl text-rose-deep mt-2">Palabras con flores</p>
          <h1 className="font-serif text-4xl md:text-5xl text-burgundy italic">Dedicatorias</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Elige una categoría y copia el mensaje perfecto. Lo escribiremos a mano en una hermosa tarjeta junto a tu arreglo.
          </p>
        </div>
      </section>

      {/* Categorías */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="container mx-auto px-2 md:px-4 py-2.5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar md:justify-center pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`shrink-0 px-4 h-9 rounded-full text-sm font-serif italic transition-all ${
                  active === c.id
                    ? "bg-burgundy text-primary-foreground shadow-soft"
                    : "bg-rose-soft/60 text-burgundy hover:bg-rose-mid/50"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-8 md:py-12">
        <Reveal>
          <h2 className="font-serif text-2xl md:text-3xl text-burgundy italic text-center mb-6">{current.title}</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {current.messages.map((m, i) => {
            const id = `${current.id}-${i}`;
            return (
              <Reveal key={id} direction="up" delay={i * 0.04}>
                <div className="bg-card border border-rose-mid/40 rounded-2xl p-5 shadow-soft flex flex-col gap-3 h-full">
                  <p className="font-serif italic text-burgundy text-sm md:text-base leading-relaxed flex-1">
                    "{m}"
                  </p>
                  <button
                    onClick={() => copy(m, id)}
                    className="self-end text-xs font-medium text-rose-deep hover:text-burgundy flex items-center gap-1.5"
                  >
                    {copied === id ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
