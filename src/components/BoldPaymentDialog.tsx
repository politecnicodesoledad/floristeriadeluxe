import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/store";

/**
 * Se muestra cuando han pasado 4 min desde que el usuario abrió el botón Bold
 * sin confirmación de pago. Le ofrece terminar por WhatsApp.
 */
export function BoldPaymentDialog({ startedAt, onClose }: { startedAt: number | null; onClose: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!startedAt) return;
    const ms = Math.max(0, 4 * 60 * 1000 - (Date.now() - startedAt));
    const t = setTimeout(() => setOpen(true), ms);
    return () => clearTimeout(t);
  }, [startedAt]);

  const goWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, tuve problemas con el pago en línea, ¿me ayudan a completarlo?")}`, "_blank");
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose(); }}>
      <DialogContent className="bg-cream max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-burgundy text-2xl">¿Tuviste problemas con el pago?</DialogTitle>
          <DialogDescription>
            Si la pasarela está demorando o algo no salió bien, podemos ayudarte a completar tu pedido por WhatsApp en menos de 1 minuto.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); onClose(); }}>Sigo intentando</Button>
          <Button onClick={goWhatsApp} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
            <MessageCircle className="w-4 h-4 mr-1" /> Por WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}