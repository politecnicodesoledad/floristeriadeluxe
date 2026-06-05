import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT_EMAIL, STORE_ADDRESS, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/store";

export function Footer() {
  return (
    <footer className="bg-gradient-cream border-t border-border/60 mt-20">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <img
            src="https://i.ibb.co/NgPCTK4k/Logo-Floristeria-Deluxe.png"
            alt="Floristería Deluxe"
            className="h-16 mb-4"
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Diseñamos arreglos florales únicos desde 2010, con las flores más frescas
            de la temporada y entregas express en Barranquilla y Soledad.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://instagram.com" target="_blank" rel="noopener" className="w-9 h-9 rounded-full bg-rose-soft flex items-center justify-center text-burgundy hover:bg-rose-mid transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" className="w-9 h-9 rounded-full bg-rose-soft flex items-center justify-center text-burgundy hover:bg-rose-mid transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-burgundy text-lg mb-4">Enlaces rápidos</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tienda" className="hover:text-burgundy">Tienda</Link></li>
            <li><Link to="/dedicatoria" className="hover:text-burgundy">Dedicatoria</Link></li>
            <li><Link to="/quienes-somos" className="hover:text-burgundy">Quiénes Somos</Link></li>
            <li><Link to="/contacto" className="hover:text-burgundy">Contacto</Link></li>
            <li><Link to="/mi-cuenta" className="hover:text-burgundy">Mi Cuenta</Link></li>
            <li><Link to="/terminos" className="hover:text-burgundy">Términos y Condiciones</Link></li>
            <li><Link to="/privacidad" className="hover:text-burgundy">Política de Privacidad</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-burgundy text-lg mb-4">Contacto</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-rose-deep" />
              <span>{STORE_ADDRESS}</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-rose-deep" />
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-burgundy">{WHATSAPP_DISPLAY}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-rose-deep" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-burgundy break-all">{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-burgundy text-lg mb-4">Horario</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>Lunes – Sábado: 8:00 am – 8:00 pm</li>
            <li>Domingo: 9:00 am – 6:00 pm</li>
            <li className="pt-2 text-xs italic">Pedidos por WhatsApp 24/7</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Floristería Deluxe — Todos los derechos reservados.
      </div>
    </footer>
  );
}