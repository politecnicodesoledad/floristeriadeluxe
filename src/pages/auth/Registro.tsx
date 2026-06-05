import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(2, "Nombre muy corto").max(100),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
  accept_terms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los términos" }) }),
});

export default function Registro() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, accept_terms: accept });
    if (!parsed.success) return toast.error(parsed.error.errors[0]?.message ?? "Datos inválidos");
    setLoading(true);
    const { error } = await signUp({ ...form, accept_terms: accept });
    setLoading(false);
    if (error) return toast.error("No pudimos crear tu cuenta", { description: error });
    toast.success("¡Cuenta creada! Revisa tu email para confirmar.");
    nav("/mi-cuenta", { replace: true });
  };

  return (
    <>
      <Helmet><title>Crear cuenta — Floristería Deluxe</title></Helmet>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-md mx-auto bg-card border border-border/60 rounded-3xl p-7 md:p-9 shadow-soft">
          <div className="text-center">
            <p className="font-script text-3xl text-rose-deep">Únete</p>
            <h1 className="font-serif text-3xl md:text-4xl text-burgundy italic">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Lleva tu historial, gana Puntos Deluxe y agiliza tus próximas compras.
            </p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <Input required placeholder="Nombre completo" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <Input required placeholder="Teléfono (ej: +57 300 630 1123)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input required type="password" minLength={6} placeholder="Contraseña (mín. 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
              <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} className="mt-0.5" />
              <span>
                Acepto los <Link to="/terminos" className="text-burgundy underline">Términos y Condiciones</Link> y la{" "}
                <Link to="/privacidad" className="text-burgundy underline">Política de Privacidad</Link>.
              </span>
            </label>
            <Button type="submit" disabled={loading} className="w-full bg-burgundy hover:bg-burgundy-light text-primary-foreground h-11 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6 pt-5 border-t border-border/60">
            ¿Ya tienes cuenta? <Link to="/login" className="text-burgundy font-medium hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </section>
    </>
  );
}