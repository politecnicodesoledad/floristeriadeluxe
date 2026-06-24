import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFAB } from "@/components/layout/WhatsAppFAB";
import { CartDrawer } from "@/components/CartDrawer";
import { PromoPopup } from "@/components/PromoPopup";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { hydrateAll } from "@/lib/store";

import Home from "@/pages/Home";
import Tienda from "@/pages/Tienda";
import Producto from "@/pages/Producto";
import Dedicatoria from "@/pages/Dedicatoria";
import QuienesSomos from "@/pages/QuienesSomos";
import Contacto from "@/pages/Contacto";
import MiCuenta from "@/pages/MiCuenta";
import Login from "@/pages/auth/Login";
import Registro from "@/pages/auth/Registro";
import ResetPassword from "@/pages/auth/ResetPassword";
import Terminos from "@/pages/Terminos";
import Privacidad from "@/pages/Privacidad";
import Checkout from "@/pages/Checkout";
import Control from "@/pages/Control";
import NotFound from "@/pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return null;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => { hydrateAll(); }, []);
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <ScrollToTop />
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
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/mi-cuenta" element={<ProtectedRoute><MiCuenta /></ProtectedRoute>} />
            <Route path="/control" element={<ProtectedRoute adminOnly><Control /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppFAB />
        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
        <PromoPopup />
        <Toaster position="top-center" richColors />
      </div>
    </AuthProvider>
  );
}
