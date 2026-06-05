import { Helmet } from "react-helmet-async";

export default function Terminos() {
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones — Floristería Deluxe</title>
        <meta name="description" content="Términos y condiciones de uso de floristeriadeluxe.com" />
      </Helmet>
      <section className="bg-gradient-hero py-10 md:py-14 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <p className="font-script text-2xl text-rose-deep">Legal</p>
          <h1 className="font-serif text-3xl md:text-5xl text-burgundy italic">Términos y Condiciones</h1>
        </div>
      </section>
      <article className="container mx-auto px-4 py-10 max-w-3xl prose prose-sm md:prose-base">
        <p className="text-muted-foreground italic mb-6">
          Bienvenido/a a floristeriadeluxe.com. Estos Términos y Condiciones de Servicio («Términos») rigen el uso de
          nuestro sitio web y los servicios que ofrecemos. Al acceder o utilizar nuestro sitio web, usted acepta estar
          sujeto a estos Términos, incluyendo todas las cláusulas relativas al consumidor conforme a la Ley 1480 de
          2011 (Estatuto del Consumidor) y demás normativa aplicable al comercio electrónico en Colombia.
        </p>

        <Section title="1. Definiciones">
          <ul>
            <li><b>«Sitio web»</b> floristeriadeluxe.com, operado por Deluxe corporation SAS, NIT 901761416-3.</li>
            <li><b>«Nosotros»</b>, <b>«nuestro»</b> se refiere a Deluxe corporation SAS.</li>
            <li><b>«Usted»</b>, <b>«su»</b> se refiere al usuario o visitante de nuestro sitio web.</li>
            <li><b>«Servicios»</b> todos los productos, servicios y características disponibles a través del sitio.</li>
            <li><b>«Consumidor»</b> persona natural o jurídica que adquiera un producto, según la Ley 1480 de 2011.</li>
          </ul>
        </Section>

        <Section title="2. Uso del Sitio Web y Capacidad Legal">
          <p><b>Elegibilidad:</b> Debes ser mayor de edad (18 años) con capacidad legal para contratar, o persona jurídica.</p>
          <p><b>Registro de Cuenta:</b> Eres responsable de la confidencialidad de tu contraseña y de toda actividad bajo tu cuenta.</p>
          <p><b>Precisión de la Información:</b> Debes proporcionar información precisa, completa y actualizada.</p>
          <p><b>Conducta Prohibida:</b> No usar el sitio para fines ilegales, distribuir malware, acceso no autorizado, o dañar el sitio.</p>
        </Section>

        <Section title="3. Productos, Precios y Pedidos">
          <p><b>Disponibilidad:</b> Todos los productos están sujetos a disponibilidad.</p>
          <p><b>Precios:</b> En Pesos Colombianos (COP) e incluyen IVA salvo indicación contraria.</p>
          <p><b>Descripciones:</b> Imágenes ilustrativas; el producto puede variar ligeramente por la naturaleza fresca.</p>
          <p><b>Proceso:</b> El contrato se perfecciona al recibir confirmación de tu pago y enviarte el correo de confirmación.</p>
        </Section>

        <Section title="4. Pagos">
          <p>Aceptamos los métodos indicados en la pasarela. Tu información de pago se procesa mediante plataformas certificadas PCI DSS y no se almacena en nuestros servidores.</p>
        </Section>

        <Section title="5. Envíos y Entregas">
          <p>Cobertura, tiempos y costos se especifican durante la compra. No respondemos por demoras por fuerza mayor, condiciones climáticas o direcciones erróneas. Reclamaciones por daños o faltantes deben informarse dentro de las 24 horas siguientes a la entrega con evidencia fotográfica.</p>
        </Section>

        <Section title="6. Derecho de Retracto (Ley 1480 de 2011)">
          <p>Plazo de 5 días hábiles desde la entrega para retractarse, EXCEPTO bienes perecederos. Las flores y arreglos florales frescos, una vez entregados en óptimas condiciones, NO admiten retracto por su naturaleza perecedera. Si hay defectos de calidad aplica nuestra garantía.</p>
        </Section>

        <Section title="7. Garantía de Calidad">
          <p>Garantizamos calidad y frescura al momento de la entrega. Reclamaciones máximo 24 horas después con evidencia fotográfica. Reposición o reembolso si procede.</p>
        </Section>

        <Section title="8. Reversión de Pagos (Ley 1480 de 2011)">
          <p>Puedes solicitar reversión total o parcial en casos de fraude, operación no solicitada, producto no recibido o defectuoso, dentro de los 5 días hábiles siguientes al conocimiento del hecho, según el Artículo 51 del Estatuto del Consumidor.</p>
        </Section>

        <Section title="9. Propiedad Intelectual">
          <p>Todo el contenido del sitio es propiedad de Deluxe corporation SAS o de sus proveedores y está protegido por leyes de derechos de autor y marcas comerciales colombianas e internacionales.</p>
        </Section>

        <Section title="10. Enlaces a Terceros">
          <p>No controlamos ni asumimos responsabilidad por sitios o servicios de terceros enlazados.</p>
        </Section>

        <Section title="11. Limitación de Responsabilidad">
          <p>En la máxima medida permitida por ley, no seremos responsables de daños indirectos, incidentales, especiales o consecuentes. Nuestra responsabilidad se limita al valor total de los productos comprados.</p>
        </Section>

        <Section title="12. Indemnización">
          <p>Aceptas indemnizar a Deluxe corporation SAS por cualquier reclamación derivada de tu uso del sitio o incumplimiento de estos Términos.</p>
        </Section>

        <Section title="13. Ley Aplicable y Jurisdicción">
          <p>Estos Términos se rigen por las leyes de Colombia. Disputas serán resueltas por los tribunales de Barranquilla, Colombia.</p>
        </Section>

        <Section title="14. Cambios">
          <p>Podemos modificar estos Términos en cualquier momento. Cambios materiales serán notificados con aviso razonable.</p>
        </Section>

        <Section title="15. Contáctenos">
          <p>
            <b>Razón Social:</b> Deluxe corporation SAS<br />
            <b>NIT:</b> 901761416-3<br />
            <b>Dirección:</b> Barranquilla – Carrera 43 #79-226 local 1<br />
            <b>Correo:</b> floristeriadeluxe@gmail.com<br />
            <b>Teléfono:</b> 300 630 1123
          </p>
        </Section>
      </article>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-serif text-burgundy text-xl md:text-2xl italic mb-2">{title}</h2>
      <div className="text-sm md:text-base text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}