import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { resolveAssetUrl } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState(() => store.getPopup());
  const navigate = useNavigate();

  useEffect(() => {
    const p = store.getPopup();
    setPopup(p);
    if (p.enabled && !store.popupSeen(p.id)) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    store.markPopupSeen(popup.id);
    setOpen(false);
  };

  const cta = () => {
    close();
    if (popup.ctaHref) {
      if (popup.ctaHref.startsWith("http")) window.open(popup.ctaHref, "_blank");
      else navigate(popup.ctaHref);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="bg-cream max-w-md p-0 overflow-hidden">
        {popup.image && <img src={resolveAssetUrl(popup.image)} alt="" className="w-full h-44 object-cover" />}
        <div className="p-6 text-center">
          <h3 className="font-serif text-2xl text-burgundy">{popup.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{popup.message}</p>
          <div className="mt-5 flex gap-2 justify-center">
            <Button variant="outline" className="border-burgundy text-burgundy" onClick={close}>
              Cerrar
            </Button>
            {popup.cta && (
              <Button className="bg-burgundy hover:bg-burgundy-light text-primary-foreground" onClick={cta}>
                {popup.cta}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}