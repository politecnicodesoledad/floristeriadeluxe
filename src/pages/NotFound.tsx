import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <p className="font-script text-4xl text-rose-deep">Oops</p>
      <h1 className="font-serif text-6xl md:text-8xl text-burgundy italic mt-2">404</h1>
      <p className="text-muted-foreground mt-3">La página que buscas no existe o fue movida.</p>
      <Link to="/"><Button className="mt-6 bg-burgundy hover:bg-burgundy-light text-primary-foreground rounded-full px-8 h-12">Volver al inicio</Button></Link>
    </div>
  );
}
