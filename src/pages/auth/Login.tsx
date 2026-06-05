import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email.trim(), pwd);
    setLoading(false);
    if (error) return toast.error("No se pudo iniciar sesión", { description: error });
    toast.success("¡Bienvenido de vuelta! 🌷");
    nav(loc.state?.from || "/mi-cuenta", { replace: true });
  };

  const sendReset = async () => {
    if (!email) return toast.error("Escribe tu email primero");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Te enviamos un correo para restablecer tu contraseña.");
  };

  return (
    <>
      <Helmet><title>Iniciar sesión — Floristería Deluxe</title></Helmet>
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto bg-card border border-border/60 rounded-3xl p-7 md:p-9 shadow-soft">
          <div className="text-center">
            <p className="font-script text-3xl text-rose-deep">Bienvenido</p>
            <h1 className="font-serif text-3xl md:text-4xl text-burgundy italic">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa para ver tu historial, rastrear pedidos y guardar direcciones.
            </p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs text-burgundy flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
            </label>
            <label className="block">
              <span className="text-xs text-burgundy flex items-center gap-1"><Lock className="w-3 h-3" /> Contraseña</span>
              <Input type="password" required minLength={6} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" />
            </label>
            <Button type="submit" disabled={loading} className="w-full bg-burgundy hover:bg-burgundy-light text-primary-foreground h-11">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
            </Button>
            <button type="button" onClick={sendReset} className="text-xs text-rose-deep hover:underline block mx-auto">
              ¿Olvidaste tu contraseña?
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6 pt-5 border-t border-border/60">
            ¿Aún no tienes cuenta? <Link to="/registro" className="text-burgundy font-medium hover:underline">Regístrate</Link>
          </p>
        </div>
      </section>
    </>
  );
}