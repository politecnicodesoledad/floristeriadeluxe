import { Flower2 } from "lucide-react";
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
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-luxe flex items-center justify-center"
      aria-label="Pedir por WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
      <Flower2 className="w-7 h-7 relative" />
    </motion.a>
  );
}