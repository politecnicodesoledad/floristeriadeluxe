import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPassword() {
  const nav = useNavigate();
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) return toast.error("Mínimo 6 caracteres");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Contraseña actualizada");
    nav("/mi-cuenta", { replace: true });
  };

  return (
    <>
      <Helmet><title>Restablecer contraseña — Floristería Deluxe</title></Helmet>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-soft">
          <h1 className="font-serif text-2xl text-burgundy italic text-center">Nueva contraseña</h1>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <Input type="password" required minLength={6} placeholder="Nueva contraseña" value={pwd} onChange={(e) => setPwd(e.target.value)} />
            <Button type="submit" disabled={loading} className="w-full bg-burgundy hover:bg-burgundy-light text-primary-foreground h-11">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar contraseña"}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}