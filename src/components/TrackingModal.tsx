import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function TrackingModal({ code, onClose }: { code: string | null; onClose: () => void }) {
  if (!code) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };
  return (
    <Dialog open={!!code} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-cream max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <DialogTitle className="font-serif text-burgundy text-2xl text-center">¡Pedido enviado!</DialogTitle>
          <DialogDescription className="text-center">
            Guarda este código para rastrear tu pedido. Si no tienes cuenta, tómale una captura de pantalla.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 bg-rose-soft border-2 border-dashed border-rose-deep/50 rounded-xl py-5 px-4">
          <p className="text-xs text-rose-deep uppercase tracking-widest mb-1">Código de seguimiento</p>
          <p className="font-serif text-3xl font-bold text-burgundy tracking-wider">{code}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1 border-burgundy text-burgundy" onClick={copy}>
            <Copy className="w-4 h-4 mr-2" /> Copiar código
          </Button>
          <Button className="flex-1 bg-burgundy hover:bg-burgundy-light text-primary-foreground" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}