import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { WHATSAPP_NUMBER } from "@/lib/store";

/**
 * Recordatorio flotante de Puntos Deluxe.
 * - Aparece en /producto/* y en /checkout primero a los 6s.
 * - En otras páginas, aparece cada ~30s con autoclose 7s.
 * - El usuario puede cerrar manualmente.
 */
export function PuntosDeluxeToast() {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    const trigger = pathname.startsWith("/producto/") || pathname === "/checkout";
    const firstDelay = trigger ? 6000 : 12000;
    const t = setTimeout(() => setShow(true), firstDelay);
    const interval = setInterval(() => setShow(true), 35000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [pathname]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 7000);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola Floristería Deluxe! Quiero reclamar mis Puntos Deluxe.")}`}
          target="_blank"
          rel="noopener"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-24 right-4 sm:right-5 z-40 max-w-[88vw] sm:max-w-xs bg-gradient-to-br from-burgundy to-rose-deep text-cream rounded-2xl shadow-luxe px-4 py-3 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-cream text-sm leading-snug">¡Gana Puntos Deluxe!</p>
            <p className="text-[11px] text-cream/85 leading-snug mt-0.5">
              Reclámalos por WhatsApp con cada compra.
            </p>
          </div>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow(false); }} className="text-cream/70 hover:text-cream shrink-0" aria-label="Cerrar">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.a>
      )}
    </AnimatePresence>
  );
}