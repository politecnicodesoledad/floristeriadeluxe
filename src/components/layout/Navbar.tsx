import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/hooks";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/tienda", label: "Tienda" },
  { to: "/dedicatoria", label: "Dedicatoria" },
  { to: "/quienes-somos", label: "Quiénes Somos" },
  { to: "/contacto", label: "Contacto" },
  { to: "/mi-cuenta", label: "Mi Cuenta" },
];

export function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="https://i.ibb.co/NgPCTK4k/Logo-Floristeria-Deluxe.png"
            alt="Floristería Deluxe"
            className="h-14 md:h-16 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-serif italic transition-colors relative ${
                  isActive
                    ? "text-burgundy after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:bg-gold"
                    : "text-foreground/70 hover:text-burgundy"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenCart}
            variant="ghost"
            size="icon"
            className="relative text-burgundy hover:bg-rose-soft"
            aria-label="Carrito"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-burgundy text-primary-foreground text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>
          <Link to="/mi-cuenta" className="hidden md:inline-flex">
            <Button variant="ghost" size="icon" className="text-burgundy hover:bg-rose-soft" aria-label="Mi cuenta">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 text-burgundy"
            aria-label="Menú"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <nav className="container mx-auto px-4 py-3 flex flex-col">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `py-3 px-2 font-serif italic border-b border-border/40 last:border-0 ${
                    isActive ? "text-burgundy" : "text-foreground/80"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}