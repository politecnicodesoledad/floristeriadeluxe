import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/store";

export function TopBar() {
  return (
    <div className="w-full bg-rose-soft border-b border-border/60 text-burgundy text-xs">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="https://instagram.com" target="_blank" rel="noopener" className="hover:text-rose-deep transition-colors" aria-label="Instagram">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener" className="hover:text-rose-deep transition-colors" aria-label="Facebook">
            <Facebook className="w-4 h-4" />
          </a>
          <span className="hidden sm:inline opacity-70">Síguenos en redes</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 hover:text-rose-deep transition-colors">
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{WHATSAPP_DISPLAY}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hidden md:flex items-center gap-1.5 hover:text-rose-deep transition-colors">
            <Mail className="w-3.5 h-3.5" />
            <span>{CONTACT_EMAIL}</span>
          </a>
        </div>
      </div>
    </div>
  );
}