import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFAB } from "@/components/layout/WhatsAppFAB";
import { CartDrawer } from "@/components/CartDrawer";
import { PromoPopup } from "@/components/PromoPopup";

import Home from "@/pages/Home";
import Tienda from "@/pages/Tienda";
import Producto from "@/pages/Producto";
import Dedicatoria from "@/pages/Dedicatoria";
import QuienesSomos from "@/pages/QuienesSomos";
import Contacto from "@/pages/Contacto";
import MiCuenta from "@/pages/MiCuenta";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/dedicatoria" element={<Dedicatoria />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFAB />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <PromoPopup />
      <Toaster position="top-center" richColors />
    </div>
  );
}