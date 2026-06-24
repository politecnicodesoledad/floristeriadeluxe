import { motion } from "framer-motion";
import { WHATSAPP_NUMBER } from "@/lib/store";

export function WhatsAppFAB() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola Floristería Deluxe! Me interesa un arreglo.")}`}
      target="_blank"
      rel="noopener"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20b858] text-white shadow-luxe rounded-full pl-4 pr-5 py-3 transition-colors"
      aria-label="Pedir por WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping" />
      {/* Ícono oficial de WhatsApp */}
      <svg viewBox="0 0 32 32" className="w-6 h-6 relative shrink-0" fill="currentColor">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.77L0 32l8.437-2.007A15.934 15.934 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.771-1.854l-.486-.289-5.007 1.192 1.216-4.882-.316-.502A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.274-9.874c-.398-.199-2.356-1.162-2.72-1.295-.365-.133-.631-.199-.897.199-.265.398-1.029 1.295-1.261 1.561-.232.265-.465.298-.863.1-.398-.2-1.681-.62-3.202-1.977-1.183-1.057-1.982-2.363-2.214-2.761-.232-.398-.025-.613.175-.811.18-.179.398-.465.597-.698.2-.232.266-.398.398-.664.133-.265.067-.498-.033-.697-.1-.2-.897-2.162-1.229-2.96-.324-.778-.652-.673-.897-.685l-.764-.013c-.265 0-.697.1-1.062.498-.365.398-1.394 1.362-1.394 3.323s1.427 3.854 1.626 4.12c.2.265 2.809 4.287 6.806 6.016.951.41 1.693.655 2.272.839.955.304 1.824.261 2.511.158.766-.114 2.356-.963 2.688-1.893.333-.93.333-1.728.232-1.893-.1-.166-.365-.265-.764-.465z"/>
      </svg>
      <span className="relative text-sm font-semibold leading-none">WhatsApp</span>
    </motion.a>
  );
}
