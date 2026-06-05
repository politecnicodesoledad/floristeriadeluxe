import { Helmet } from "react-helmet-async";

export default function Privacidad() {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad — Floristería Deluxe</title>
        <meta name="description" content="Política de privacidad y manejo de datos personales de floristeriadeluxe.com" />
      </Helmet>
      <section className="bg-gradient-hero py-10 md:py-14 border-b border-border/60 text-center">
        <div className="container mx-auto px-4">
          <p className="font-script text-2xl text-rose-deep">Legal</p>
          <h1 className="font-serif text-3xl md:text-5xl text-burgundy italic">Política de Privacidad</h1>
        </div>
      </section>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="text-muted-foreground italic mb-6">
          Su privacidad es de suma importancia para nosotros. Cumplimos con la Ley 1581 de 2012 (Ley de Protección de Datos Personales) y sus decretos reglamentarios.
        </p>

        <S title="1. Información que Recopilamos">
          <p><b>Datos personales:</b> nombre, documento, email, dirección, teléfono, datos de pago.</p>
          <p><b>Uso:</b> IP, navegador, páginas visitadas, productos vistos.</p>
          <p><b>Dispositivo:</b> modelo, identificadores únicos, red móvil.</p>
          <p><b>Transacciones:</b> productos comprados, historial de pedidos, fechas.</p>
        </S>
        <S title="2. Cómo Usamos Su Información">
          <ul className="list-disc pl-5">
            <li>Procesar y cumplir tus pedidos.</li>
            <li>Gestionar tu cuenta de usuario.</li>
            <li>Personalizar tu experiencia y recomendarte productos.</li>
            <li>Atención al cliente, actualizaciones de pedidos y boletines (si los aceptas).</li>
            <li>Mejorar nuestros servicios y prevenir fraudes.</li>
            <li>Cumplir obligaciones legales y fiscales en Colombia.</li>
          </ul>
        </S>
        <S title="3. Cómo Compartimos Su Información">
          <p>Compartimos datos con proveedores de servicios (pasarela de pago, logística, analítica), autoridades cuando la ley lo exija, o en caso de transferencias de negocio. Solo con tu consentimiento explícito para fines no cubiertos por esta política.</p>
        </S>
        <S title="4. Cookies">
          <p>Usamos cookies de sesión y persistentes para la funcionalidad del sitio (carrito, login), análisis y personalización. Puedes desactivarlas en tu navegador (algunas funciones podrían no operar correctamente).</p>
        </S>
        <S title="5. Seguridad">
          <p>Implementamos medidas técnicas, administrativas y físicas razonables para proteger tu información. Ningún método 100% seguro existe, pero usamos medios comercialmente aceptables.</p>
        </S>
        <S title="6. Retención de Datos">
          <p>Retenemos tu información solo el tiempo necesario para los fines establecidos y para cumplir obligaciones legales.</p>
        </S>
        <S title="7. Sus Derechos (Ley 1581 de 2012)">
          <ul className="list-disc pl-5">
            <li><b>Acceso/Consulta</b> a tus datos.</li>
            <li><b>Rectificación y actualización.</b></li>
            <li><b>Supresión/revocación</b> de autorización.</li>
            <li><b>Limitación del tratamiento.</b></li>
            <li><b>Portabilidad de datos.</b></li>
            <li><b>Oposición</b> al procesamiento por motivos legítimos.</li>
          </ul>
          <p>Para ejercer estos derechos contáctanos al email o teléfono de abajo.</p>
        </S>
        <S title="8. Enlaces a Otros Sitios">
          <p>Revisa la política de privacidad de cualquier sitio externo enlazado; no asumimos responsabilidad por ellos.</p>
        </S>
        <S title="9. Cambios">
          <p>Podemos actualizar esta política. Cambios sustanciales serán notificados aquí. Revisa periódicamente.</p>
        </S>
        <S title="10. Contáctenos">
          <p>
            <b>Razón Social:</b> Deluxe corporation SAS<br />
            <b>NIT:</b> 901761416-3<br />
            <b>Dirección:</b> Calle 44 #35-37 barrio Chiquinquirá / Carrera 43 #79-226 local 1<br />
            <b>Correo:</b> floristeriadeluxe@gmail.com<br />
            <b>Teléfono:</b> 300 630 1123
          </p>
        </S>
      </article>
    </>
  );
}

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="font-serif text-burgundy text-xl md:text-2xl italic mb-2">{title}</h2>
      <div className="text-sm md:text-base text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}