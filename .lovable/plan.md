## Antes de empezar — 2 advertencias críticas

**🔴 Rota tu llave secreta de Bold YA.** La pegaste en el chat (`210pPxa-_g-MsKKY8TeYpA`). Cualquiera que lea esta conversación la tiene. Entra a tu panel Bold → genera llaves nuevas → me pasas SOLO la **llave de identidad** (la pública) por aquí. La **secreta nueva** la subes tú al final con el botón seguro (`add_secret`), nunca por chat.

**🟡 Bold "Botón de pagos" exige firmar un hash SHA-256 con tu llave secreta.** Ese hash NO puede generarse en el navegador (cualquiera lo vería). Como solo quieres Supabase (sin Lovable Cloud), la única forma segura es una **Supabase Edge Function** que yo escribo y tú despliegas con `supabase functions deploy bold-sign` desde tu terminal. Si no quieres usar la CLI de Supabase, la alternativa es que el botón siga llevando a WhatsApp hasta que tengas backend. Confírmame cuál.

---

## Lo que voy a construir (en este orden)

### 1. Estabilidad + identidad
- Confirmar que el blanco no vuelve (era reinicio de Vite por nueva dependencia).
- Favicon = logo (necesito que subas el PNG/SVG del logo si quieres uno específico; mientras tanto genero uno con el monograma "D").
- Responsive móvil real: cards de tienda más compactas en celular (2 cols pequeñas), filtros en scroll horizontal sticky.

### 2. Auth real con Supabase Auth + perfiles + rol admin
- Tabla `profiles` (id = auth.users.id, nombre, telefono, acepto_terminos_at).
- Tabla `user_roles` + enum `app_role` ('admin','user') + función `has_role` SECURITY DEFINER (patrón seguro, no roles en profiles).
- Trigger auto-crea profile al registrarse.
- `/registro` con nombre, teléfono, email, contraseña, checkbox T&C obligatorio.
- `/login` con email + password + recuperar contraseña.
- `/mi-cuenta` (autenticada) con tabs: **Mis pedidos** (historial real desde `orders.user_id`), **Rastreo** (input código), **Configuración** (editar nombre/teléfono/contraseña), **Direcciones de envío** (CRUD).
- El admin (angieflorez2008@hotmail.com) se siembra: te dejo SQL para crear el usuario y darle rol admin.

### 3. Admin reescrito en `/control` (ruta secreta, no en navbar)
- Acceso solo si `has_role(uid, 'admin')`. Si no, 404.
- Pestañas: **Productos** (CRUD con form mucho más intuitivo: paso a paso con preview en vivo, dropdown de categorías, drag & drop o URL para imagen, validación clara), **Pedidos** (lista con cliente, total, estado editable), **Cupones** (código, % descuento, activo, vencimiento), **Contenido** (banner hero, popup, galerías por sección con URLs editables), **Clientes** (lista).
- Quito el botón "Admin" del navbar y la página `/admin`.

### 4. Páginas nuevas + contenido
- `/terminos` con el texto completo que me pasaste.
- `/privacidad` con el texto completo que me pasaste.
- `/quienes-somos` actualizado con tu copy nuevo.
- `/dedicatorias` rediseñado: 7 categorías con tabs/acordeón y todos los mensajes que me pasaste, botón "copiar" en cada uno.
- Links a Términos/Privacidad en footer y en checkbox de registro.

### 5. Home rediseñado
- Hero: imagen central PNG de un ramo (sin fondo) dentro de un **marco circular hecho con guirnalda de flores** generado con imagegen.
- Cada sección con su imagen-header arriba (editable desde admin).
- Mapa Google Maps embebido al final (iframe de tu link).
- Hero notification flotante "Gana Puntos Deluxe en cada compra por WhatsApp" que aparece y desaparece suave cada ~25s.

### 6. Carrito → Checkout → Bold
- Drawer del carrito + página `/checkout` (estilo de tus screenshots: form izquierda, resumen derecha).
- Campo **cupón** que llama RPC `apply_coupon(code)` → devuelve % descuento.
- Si el usuario está logueado, autorrellena nombre/email/teléfono y permite elegir dirección guardada.
- Botón **"Pagar con Bold"**: invoca edge function `bold-sign` que devuelve `{ orderId, amount, hash, integritySignature }` y abre el checkout Bold con el script oficial.
- Webhook `bold-webhook` (otra edge function) recibe la confirmación y actualiza `orders.status` y `payment_status`.
- **Popup de 4 min:** si el usuario abre Bold y no confirma en 4 minutos, modal "¿Tuviste problemas? Termina por WhatsApp" con botón cerrar.

### 7. Detalles finos
- Toast tipo hero "Gana Puntos Deluxe" también al entrar a `/producto/:id`.
- Validación con Zod en todos los forms.
- Loading states y skeletons.

---

## SQL que te paso al final

Te entrego **un solo archivo** `SUPABASE_SCHEMA.sql` con TODO listo para copy-paste en Supabase SQL Editor: tablas nuevas (`profiles`, `user_roles`, `addresses`, `coupons`), columnas nuevas en `orders` (`user_id`, `payment_status`, `payment_method`, `coupon_code`, `discount`), enum `app_role`, función `has_role`, trigger de profile, RLS reescrito (ya no "todo público" — ahora `auth.uid()` o `has_role` según corresponda), grants, e instrucciones para crear el usuario admin desde Supabase Dashboard.

---

## Detalles técnicos

- React Router queda igual (BrowserRouter).
- Estado: el `store.ts` actual se reescribe para leer de Supabase con cliente autenticado; cache local solo para carrito.
- Bold integración: SDK web oficial `<script src="https://checkout.bold.co/library/boldPaymentButton.js">` + función Deno que calcula `sha256(orderId + amount + currency + secretKey)`.
- Vercel: build sigue siendo `dist/` estático. Las edge functions son del lado de Supabase, no de Vercel.
- Sin `.vercel/output/functions/`.

---

## Lo que necesito de ti antes de arrancar

1. **¿Rotaste la llave Bold?** Pásame solo la nueva llave de **identidad** por chat. La secreta nueva la subes con el botón seguro cuando te lo pida.
2. **¿Tienes Supabase CLI instalado?** (para `supabase functions deploy`). Si no, Bold queda como "redirigir a WhatsApp" hasta que la tengas.
3. **¿Subes el logo** (PNG) para favicon y como base de la flor central? Si no, genero uno con IA.

Cuando me confirmes, ejecuto todo de corrido y te entrego: SQL listo, instrucciones de despliegue de edge functions, y la app funcionando.