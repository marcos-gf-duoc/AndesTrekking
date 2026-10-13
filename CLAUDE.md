# CLAUDE.md: Proyecto AndesTrekking (DSY1104, Evaluación Parcial 1)

> Archivo de contexto para Claude Code. Se lee al inicio de cada sesión.
> Es un documento vivo: se actualizará al cerrar cada etapa del proyecto.
> Última actualización: etapa (a), estructura de carpetas y flujo de navegación.

---

## 1. Contexto

- **Proyecto:** tienda online "AndesTrekking", especializada en trekking, senderismo y outdoor (mochilas, calzado, carpas, ropa técnica, accesorios).
- **Asignatura:** DSY1104 Desarrollo Fullstack II (Duoc UC), Evaluación Parcial 1 (30%).
- **Autor:** Marcos Godoy. Trabajo **individual**, único colaborador del repositorio.
- **Nivel técnico del autor:** inicial. Todo el código debe poder explicarse línea por línea en una defensa oral.
- **Dos partes:**
  - Tienda pública.
  - Sistema administrativo protegido por autenticación y roles.
- **Sin backend:** toda la persistencia es con `localStorage`.
- **Fuente de verdad:** este archivo resume el enunciado oficial (Anexo 1) y las decisiones aprobadas por el autor. Si hay copias locales del enunciado en `docs-curso/`, se pueden consultar, pero **las decisiones de este archivo mandan**.

## 2. Reglas de trabajo para Claude Code (obligatorias)

1. **Responde siempre en español.**
2. **Una tarea pequeña a la vez.** Antes de crear o modificar archivos, explica en 2–4 líneas qué vas a hacer y en qué archivos.
3. **Después de cada archivo creado o modificado**, explica brevemente qué hace y por qué, en lenguaje simple, para que el autor pueda defenderlo.
4. **No hagas `git commit`, `git push` ni crees ramas.** El autor hace todos los commits.
   - Al iniciar una tarea, revisa en qué rama está el autor (`git branch --show-current`, solo lectura). Si está en `main` o en una rama que no corresponde, **avísale** y sugiere la rama según la sección 13, antes de modificar archivos.
   - Al terminar cada tarea, **propón** el mensaje de commit.
   - Formato del mensaje: `tipo: descripción en español`, en minúsculas y en imperativo.
   - Tipos permitidos: `feat`, `fix`, `style`, `docs`, `refactor`, `chore`.
   - Ejemplo: `feat: agregar validación de RUN en registro`.
5. **No incorpores tecnologías nuevas sin preguntar** (librerías, frameworks, CDNs, extensiones, herramientas de build). Bootstrap 5 ya está aprobado.
6. **No inventes requisitos.** Si algo no está en este archivo, pregunta. Si propones algo extra, márcalo como "SUGERENCIA" y espera aprobación.
7. **Complejidad básica:**
   - Funciones simples con nombres descriptivos en español.
   - Nada de clases, módulos ES (`import/export`), frameworks, `async/await` innecesario ni encadenamientos difíciles de leer.
   - Preferir `for`/`forEach`, `if/else` claros y variables intermedias con nombres explicativos.
8. **Comenta el código:**
   - Un comentario de cabecera por archivo (qué es y qué páginas lo usan).
   - Un comentario por función (qué recibe, qué hace y qué devuelve).
   - Comentarios en las líneas no obvias.
9. **Si detectas un conflicto** entre este archivo y una petición, o entre dos reglas, **detente y consulta** al autor.
10. **Al terminar cada tarea**, da una mini lista de prueba manual: qué abrir y qué probar para comprobar que funciona.

## 3. Stack y restricciones técnicas

- HTML5 semántico: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`. Usar `lang="es"` en todas las páginas.
- CSS3 en **hojas externas propias**:
  - `css/estilos.css` (común) y `css/admin.css` (panel).
  - Deben definir la identidad visual con variables CSS, componentes propios y selectores propios.
- **Bootstrap 5 como complemento** (grilla, navbar, cards, formularios, modales, utilidades):
  - Archivos **locales** en `assets/vendor/bootstrap/`, porque la presentación puede ser sin internet.
  - Sin jQuery.
  - El diseño **no** debe depender solo de clases de Bootstrap; el autor debe poder mostrar su CSS propio.
- Las clases `is-valid` e `is-invalid` de Bootstrap se usan **solo para el estilo**. Toda la lógica de validación es JavaScript propio.
- **No usar** la validación nativa del navegador como única validación. Los formularios llevan `novalidate`, y JS valida y muestra los mensajes.
- JavaScript vanilla, cargado con `<script src>` al final del `<body>`, en este orden:
  1. Bootstrap bundle
  2. `js/data/*`
  3. `js/core/*`
  4. Script común de la zona (`tienda-comun.js` o `admin-comun.js`)
  5. Script de la página
- **Sin `fetch` de archivos locales.** El header y el footer se escriben en cada HTML, porque `fetch` falla al abrir archivos con `file://`.
- **Herramientas aprobadas por el autor:**
  - **Live Server** (extensión de VS Code, ya instalada): el sitio se prueba con "Go Live" en `http://127.0.0.1:5500`, para que la tienda y el panel compartan el mismo `localStorage`. Es solo una herramienta de desarrollo; el proyecto no depende de ella. Las rutas deben ser **relativas** (`css/estilos.css`, `../css/estilos.css`), nunca absolutas (`/css/...`), para que el sitio también abra desde el ZIP entregado.
  - **Bootstrap Icons** en archivos **locales**, en `assets/vendor/bootstrap-icons/`. Se debe copiar `bootstrap-icons.min.css` **junto con su carpeta `fonts/`**, porque el CSS carga las fuentes con una ruta relativa. Uso: `<i class="bi bi-cart3" aria-hidden="true"></i>`. Si el ícono es el único contenido de un botón o enlace, agregar un texto accesible (`aria-label` o un `span.visually-hidden`).

## 4. Estructura de carpetas

```
andestrekking/
├── CLAUDE.md                  # este archivo
├── README.md                  # descripción del proyecto (se crea en etapa b)
├── .gitignore                 # debe ignorar docs-curso/
├── index.html                 # Home tienda
├── productos.html             # Listado de productos
├── producto.html              # Detalle (?codigo=XXX)
├── carrito.html               # Mi carrito de compras
├── registro.html              # Registro de usuario (crea Cliente)
├── login.html                 # Inicio de sesión
├── nosotros.html              # Empresa y desarrollador
├── blogs.html                 # Noticias importantes
├── blog-1.html                # Detalle blog 1
├── blog-2.html                # Detalle blog 2
├── contacto.html              # Formulario de contacto
├── admin/
│   ├── index.html             # Home admin (menú vertical + bienvenida)
│   ├── productos.html         # Listado de productos (tabla + paginación)
│   ├── producto-form.html     # Nuevo / Editar producto (?codigo=XXX = editar)
│   ├── producto-detalle.html  # Mostrar producto (solo lectura → botón Editar)
│   ├── usuarios.html          # Listado de usuarios
│   ├── usuario-form.html      # Nuevo / Editar usuario (?run=XXX = editar)
│   ├── usuario-detalle.html   # Mostrar usuario
│   ├── ordenes.html           # Listado de órdenes
│   └── orden-detalle.html     # Detalle de orden
├── css/
│   ├── estilos.css            # identidad visual común (variables, tienda, formularios)
│   └── admin.css              # layout del panel (menú vertical, tablas)
├── js/
│   ├── data/                  # datos iniciales (semillas), solo arreglos/objetos
│   │   ├── productos.js       # PRODUCTOS_INICIALES + CATEGORIAS
│   │   ├── usuarios.js        # USUARIOS_INICIALES
│   │   ├── ordenes.js         # ORDENES_INICIALES
│   │   ├── cupones.js         # CUPONES
│   │   ├── blogs.js           # (opcional) contenido de blogs si se lista por JS
│   │   └── regiones.js        # REGIONES (16 regiones de Chile con sus comunas)
│   ├── core/                  # lógica compartida
│   │   ├── storage.js         # leer/guardar en localStorage + carga de semillas
│   │   ├── utils.js           # formatearPrecio, obtenerParametroUrl, etc.
│   │   ├── validaciones.js    # funciones de validación puras (validarRun, validarCorreo...)
│   │   └── auth.js            # login, logout, sesión, protección de páginas por rol
│   ├── tienda/
│   │   ├── tienda-comun.js    # contador del carrito, enlaces de sesión, newsletter
│   │   ├── home.js
│   │   ├── productos.js
│   │   ├── producto.js
│   │   ├── carrito.js
│   │   ├── registro.js
│   │   ├── login.js
│   │   └── contacto.js
│   └── admin/
│       ├── admin-comun.js     # protección, menú según rol, saludo, cerrar sesión
│       ├── home.js
│       ├── productos.js
│       ├── producto-form.js
│       ├── producto-detalle.js
│       ├── usuarios.js
│       ├── usuario-form.js
│       ├── usuario-detalle.js
│       ├── ordenes.js
│       └── orden-detalle.js
├── assets/
│   ├── img/
│   │   ├── logo/              # logo (lo entrega el autor más adelante)
│   │   ├── productos/         # imágenes de productos (licencia libre)
│   │   ├── blog/
│   │   └── general/           # hero, nosotros, placeholder.webp
│   └── vendor/
│       ├── bootstrap/         # bootstrap.min.css + bootstrap.bundle.min.js (local)
│       └── bootstrap-icons/   # bootstrap-icons.min.css + carpeta fonts/ (local)
├── docs/
│   ├── ERS_AndesTrekking_v1.docx   # ERS (se completa fuera de Claude Code)
│   └── creditos-imagenes.md        # fuente y licencia de cada imagen descargada
└── docs-curso/                # PDFs del curso, IGNORADO por Git (no se publica)
```

Convenciones de nombres:

- Archivos en minúsculas y con guiones (`producto-form.html`).
- Variables y funciones en camelCase y en español (`calcularTotal`).
- Constantes de datos en MAYÚSCULAS (`PRODUCTOS_INICIALES`).
- Claves de `localStorage` con prefijo `at_`.

## 5. Páginas, roles y navegación

**Menú de la tienda** (igual en todas las páginas públicas):

- Logo y nombre a la izquierda.
- Enlaces: Inicio | Productos | Nosotros | Blogs | Contacto.
- Carrito con contador a la derecha.
- Enlaces "Iniciar sesión | Registrarse". Con sesión activa se muestran "Hola, {nombre} | Cerrar sesión", y para Admin o Vendedor además "Panel".

**Footer de la tienda:**

- Nombre.
- Categorías.
- Medios de pago (íconos o texto).
- Newsletter con validación de correo.

**Login:**

- Incluye el enlace "¿No tienes cuenta? Regístrate" (el diagrama une Login → Registro).

**Redirección después del login:**

| Rol | Destino |
|---|---|
| Administrador | `admin/index.html` |
| Vendedor | `admin/index.html` (menú reducido) |
| Cliente | `index.html` |

**Permisos en el panel:**

| Página admin | Administrador | Vendedor | Cliente / sin sesión |
|---|---|---|---|
| `index.html` (home) | Sí | Sí | No (redirige) |
| `productos.html`, `producto-detalle.html` | Sí | Sí (solo lectura: sin Nuevo/Editar/Eliminar) | No |
| `producto-form.html` | Sí | No (redirige a home admin) | No |
| `usuarios.html`, `usuario-form.html`, `usuario-detalle.html` | Sí | No (no aparece en su menú) | No |
| `ordenes.html`, `orden-detalle.html` | Sí | Sí | No |

**Protección de páginas** (`auth.js` → `protegerPagina(rolesPermitidos)`), llamada al inicio de cada página admin:

- Sin sesión: ir a `login.html` con un mensaje.
- Rol Cliente: ir a `index.html` con el mensaje "No tienes permisos".
- Vendedor en una página no permitida: ir a `admin/index.html`.

**Menú vertical del admin:**

- Opciones: Inicio, Productos, Usuarios, Órdenes, Ver tienda, Cerrar sesión.
- Se genera según el rol. Las opciones no permitidas **no aparecen**; no basta con deshabilitarlas.

**Advertencia para el ERS:** esto **no es seguridad real**. Las contraseñas quedan en texto plano en `localStorage` y se pueden ver o editar desde DevTools. Es una simulación válida solo sin backend.

## 6. Modelo de datos (localStorage)

**Funcionamiento general:**

- Al cargar cualquier página, `storage.js` revisa cada clave.
- Si una clave no existe, la crea copiando su arreglo semilla.
- Desde ese momento, la tienda y el admin leen y escriben **solo en localStorage**.
- Existe una función `restablecerDatosDemo()`, invocable desde un botón del home admin, que borra las claves y recarga las semillas.

| Clave | Tipo | Contenido |
|---|---|---|
| `at_productos` | arreglo | productos |
| `at_usuarios` | arreglo | usuarios |
| `at_ordenes` | arreglo | órdenes |
| `at_mensajes` | arreglo | mensajes de contacto |
| `at_carrito` | arreglo | `{codigo, cantidad}` |
| `at_cupon` | string o null | código de cupón aplicado |
| `at_sesion` | objeto o null | `{run, nombre, correo, tipo}` |
| `at_suscriptores` | arreglo | correos de la newsletter |

**Producto:** `{ codigo, nombre, descripcion, precio, stock, stockCritico, categoria, imagenes: [rutas] }`

- `codigo` es único y no se puede editar en modo Editar.
- `imagenes` lleva una o más rutas relativas a `assets/img/productos/`. Si está vacío, se usa `assets/img/general/placeholder.webp`.
- Categorías (`CATEGORIAS`): Mochilas, Calzado, Carpas y Refugio, Ropa Técnica, Accesorios, Navegación y Seguridad.
- Semilla: 12 a 16 productos con al menos 2 por categoría. Incluir:
  - Uno con stock 0, para probar "Agotado".
  - Uno con stock bajo el crítico, para probar la alerta.
  - Uno con precio 0, para probar "Gratis".

**Usuario:** `{ run, nombre, apellidos, correo, password, telefono, fechaNacimiento, tipo, region, comuna, direccion }`

- `run` y `correo` son únicos. `run` no se puede editar en modo Editar.
- `tipo` puede ser `"Administrador"`, `"Vendedor"` o `"Cliente"`.
- Semillas (los RUN son válidos con módulo 11):

| Rol | RUN | Correo | Contraseña |
|---|---|---|---|
| Administrador | `123456785` | `admin@duoc.cl` | `admin123` |
| Vendedor | `201234565` | `vendedor@duoc.cl` | `vende123` |
| Cliente | `19011001K` | `cliente@gmail.com` | `cliente1` |

**Orden:** `{ id, fecha, runCliente, nombreCliente, correoCliente, items: [{codigo, nombre, precio, cantidad}], subtotal, cupon, descuento, total, estado }`

- `id` con formato `ORD-1001`, correlativo.
- `fecha` en formato ISO `AAAA-MM-DD`.
- `estado` puede ser Pendiente, En proceso, Enviada o Cancelada.
- La tabla del listado muestra, como el mockup: Fecha, N° Orden, Cliente, Estado y Total.
- Semilla: unas 20 órdenes de ejemplo coherentes con los productos y clientes semilla, en estados variados.
- Una orden nueva creada desde "Pagar" queda en estado "Pendiente".

**Mensaje:** `{ id, fecha, nombre, correo, comentario }`. Se guarda; su vista en el admin queda como requisito futuro.

**Cupones (`CUPONES`, SUGERENCIA aprobada):** `[{ codigo: "ANDES10", porcentaje: 10 }, { codigo: "OUTDOOR20", porcentaje: 20 }]`

- Se aplica un solo cupón a la vez.
- El código no distingue mayúsculas de minúsculas.

**Regiones (`REGIONES`):**

- Arreglo de `{ nombre, comunas: [..] }` con las 16 regiones de Chile y todas sus comunas.
- El autor lo revisará manualmente; dejar un comentario indicándolo.

## 7. Reglas de validación

**Comportamiento común:**

- Validar en tiempo real (eventos `input` y `blur`) y también al enviar (`submit`). Si hay errores, impedir el envío y enfocar el primer campo con error.
- Mensaje de error específico bajo el campo, en un `div.invalid-feedback`, más clase `is-invalid`. Con el campo válido, usar `is-valid`.
- Mostrar sugerencias dinámicas cuando ayuden (por ejemplo, el contador de caracteres "120/500", o "Escribe el RUN sin puntos ni guion").
- Usar `<label for>`, atributos `autocomplete` adecuados y `maxlength` como apoyo (el límite real lo valida JS).
- Recortar espacios (`trim`) antes de validar los textos.
- Dominios de correo permitidos (en todas partes): `@duoc.cl`, `@profesor.duoc.cl` y `@gmail.com`.

**Login:**

- Correo: requerido, máximo 100, dominio permitido.
- Contraseña: requerida, entre 4 y 10 caracteres.
- Además: el usuario debe existir y la contraseña debe coincidir. Si no, mostrar un error genérico: "Correo o contraseña incorrectos".

**Registro (tienda) y Nuevo/Editar usuario (admin):** es el mismo conjunto de reglas.

| Campo | Reglas |
|---|---|
| RUN | Requerido; de 7 a 9 caracteres; solo dígitos más un dígito verificador final (0–9 o K/k, que se normaliza a mayúscula); sin puntos ni guion; dígito verificador correcto según módulo 11; único |
| Nombre | Requerido; máximo 50 |
| Apellidos | Requerido; máximo 100 |
| Correo | Requerido; máximo 100; dominio permitido; único |
| Confirmar correo | Requerido; igual al correo |
| Contraseña | Requerida; de 4 a 10 caracteres. En Editar es opcional: si queda vacía, se conserva la anterior |
| Confirmar contraseña | Igual a la contraseña |
| Teléfono | Opcional; si se ingresa, 9 dígitos que empiecen con 9 (móvil chileno) |
| Fecha de nacimiento | Opcional; si se ingresa, no puede ser futura |
| Tipo de usuario | Solo en el admin; select requerido (Administrador, Vendedor, Cliente). En el registro de la tienda se asigna "Cliente" sin mostrar el campo |
| Región | Requerida (select desde `REGIONES`) |
| Comuna | Requerida; depende de la región. Al cambiar la región se recargan las comunas y se reinicia la selección |
| Dirección | Requerida; máximo 300 |

**Algoritmo del RUN (módulo 11):**

1. Separar el cuerpo (todos los caracteres menos el último) y el dígito verificador (el último).
2. Recorrer el cuerpo de derecha a izquierda, multiplicando cada dígito por la serie 2, 3, 4, 5, 6, 7, que vuelve a 2 después del 7. Sumar todos los productos.
3. Calcular `resultado = 11 - (suma % 11)`.
4. Si el resultado es 11, el dígito esperado es `0`. Si es 10, el dígito esperado es `K`. En cualquier otro caso es el mismo número.
5. Comparar con el dígito ingresado.

Casos de prueba:

| RUN | Resultado esperado |
|---|---|
| `123456785` | Válido |
| `19011001K` | Válido |
| `9876545` | Válido (7 caracteres) |
| `190110222` | Válido |
| `19011022K` | **Inválido** (es el ejemplo del Anexo, cuyo dígito verificador correcto es 2) |
| `12.345.678-5` | Inválido por formato |

**Contacto:**

- Nombre: requerido, máximo 100.
- Correo: **opcional**; si se ingresa, máximo 100 y dominio permitido.
- Comentario: requerido, máximo 500, con contador de caracteres.
- Al enviar con datos válidos: guardar en `at_mensajes`, mostrar confirmación y limpiar el formulario.

**Producto (Nuevo/Editar, solo Administrador):**

| Campo | Reglas |
|---|---|
| Código | Requerido; texto; mínimo 3 caracteres; sin máximo; único |
| Nombre | Requerido; máximo 100 |
| Descripción | Opcional; máximo 500, con contador |
| Precio | Requerido; número ≥ 0; admite decimales. 0 significa producto gratis ("FREE") |
| Stock | Requerido; entero ≥ 0 |
| Stock crítico | Opcional; entero ≥ 0. Si stock ≤ stock crítico, mostrar alerta en el formulario y resaltar la fila en el listado |
| Categoría | Requerida (select desde `CATEGORIAS`) |
| Imagen | Opcional; select con las imágenes disponibles en `assets/img/productos/` y vista previa |

**Newsletter (SUGERENCIA aprobada):** correo requerido con dominio permitido. Se guarda en `at_suscriptores` sin duplicados.

## 8. Reglas del carrito y las órdenes

**Añadir productos:**

- Se puede añadir desde Productos (cantidad 1) y desde Detalle (cantidad elegida).
- La cantidad en el carrito va de 1 hasta el stock disponible.
- Si se intenta superar el stock, mostrar un aviso y limitar la cantidad.
- Con stock 0, el botón muestra "Agotado" y queda deshabilitado.

**Contador del menú:** suma de unidades, actualizado en todas las páginas.

**Página del carrito:**

- Por producto: imagen, nombre, descripción corta, precio unitario, botones − y + con la cantidad, subtotal y botón "Eliminar".
- Si el botón − llega a 0, pedir confirmación para eliminar el producto.
- Al cargar el carrito se descartan los productos que ya no existen en `at_productos`.

**Totales:**

- Subtotal = Σ(precio × cantidad).
- Descuento = subtotal × porcentaje del cupón.
- Total = subtotal − descuento.
- Un cupón inválido muestra un mensaje; uno válido muestra el descuento aplicado y permite quitarlo.

**Formato de precios:**

- Usar `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })`, sin decimales si el valor es entero.
- Precio 0 se muestra como "Gratis".

**Botón PAGAR:**

1. Si el carrito está vacío, el botón queda deshabilitado.
2. Sin sesión: guardar un aviso y redirigir a `login.html`. Después del login como Cliente, volver al carrito.
3. Con sesión: crear la orden (estado "Pendiente"), descontar el stock en `at_productos`, vaciar el carrito y el cupón, y mostrar una confirmación con el N° de orden.

## 9. Contenido y diseño

- **Identidad visual:**
  - Paleta outdoor (verdes bosque, tierra y acento naranja), definida en variables CSS en `:root`.
  - Tipografía legible.
  - Diseño responsivo (móvil primero) y coherente entre todas las páginas.
- **Accesibilidad básica:**
  - `alt` descriptivo en las imágenes.
  - Contraste suficiente.
  - Foco visible.
  - Etiquetas en todos los campos.
  - Un solo `h1` por página.
- **Home:** hero con título, texto, imagen y botón "Ver productos", más una grilla de productos destacados (imagen, nombre, precio).
- **Productos:** grilla con imagen, nombre, precio y botón "Añadir". Al hacer clic en la tarjeta se abre `producto.html?codigo=...`.
- **Detalle:**
  - Ruta de navegación Inicio > Categoría > Producto.
  - Imagen principal con miniaturas (solo si hay más de una imagen).
  - Nombre, precio, descripción, selector de cantidad y botón "Añadir al carrito".
  - Productos relacionados de la misma categoría, hasta 4.
- **Nosotros:** qué es AndesTrekking (misión e historia) y el desarrollador (Marcos Godoy, una persona).
- **Blogs:** "Noticias importantes" con 2 casos curiosos de temática outdoor (imagen, título, descripción corta y botón "Ver caso"). Cada detalle lleva imagen, título y descripción larga.
- **Imágenes:**
  - Descargar solo imágenes de **licencia libre** (por ejemplo Unsplash o Pexels).
  - Formato `.webp` o `.jpg`, con un peso máximo aproximado de 200 KB cada una.
  - Registrar la fuente y la licencia de cada imagen en `docs/creditos-imagenes.md`.
  - El logo lo entregará el autor más adelante; mientras tanto, usar el nombre en texto.

## 10. Decisiones aprobadas (registro)

| ID | Decisión |
|---|---|
| D-01 | Trabajo individual: los commits del autor son la evidencia de Git. Se usan ramas por funcionalidad y commits pequeños. |
| D-02 | No se incluye video (confirmado por el docente). |
| D-03 | Registro unificado según la sección 7; los requisitos del cliente mandan sobre los mockups. RUN y correo únicos. |
| D-04 | Autenticación simulada con localStorage, redirección por rol y protección de páginas (sección 5). |
| D-05 | Vistas de órdenes para Admin y Vendedor, con semillas y con órdenes creadas por "Pagar". Pagar exige sesión. |
| D-06 | RUN validado con módulo 11 correcto. El ejemplo del Anexo es inválido. |
| D-07 | Se aplican las propuestas del análisis para carrito, productos, admin, imagen, precio, contacto y menores (secciones 6–9). |
| D-08 | Imágenes predefinidas en `assets/img/productos/`, elegidas con un select en el formulario. |
| D-09 | Complejidad básica y defendible (sección 2.7). |
| D-10 | Bootstrap local como complemento; el CSS propio debe ser visible y explicable. |
| D-11 | Live Server aprobado como herramienta de desarrollo, con rutas siempre relativas. |
| D-12 | Bootstrap Icons aprobado, en archivos locales. |
| D-13 | Los avisos entre páginas viajan como códigos fijos en la URL, sin claves nuevas en localStorage: `?aviso=sesion`, `?aviso=permisos` y `?aviso=restablecido`. El texto de cada aviso lo define el sitio (`tienda-comun.js`), nunca la URL. Para volver al carrito después del login se usa `login.html?volver=carrito`. |
| S-01 | Un solo formulario por entidad para Nuevo y Editar (el modo se define por el parámetro en la URL). |
| S-02 | Código de producto y RUN no editables en modo Editar (son identificadores). |
| S-03 | Header y footer escritos en cada HTML (sin `fetch`), para que funcione con `file://`. |
| S-04 | Un Administrador no puede eliminar su propio usuario mientras tiene la sesión iniciada. |

## 11. Fuera de alcance (no implementar)

- Backend, base de datos, APIs externas y pagos reales.
- Ítems extra del menú del mockup (Reports, Employees, Settings, Search, Help).
- Vista de mensajes de contacto en el admin (requisito futuro).
- Cifrado de contraseñas (se documenta como limitación).

## 12. Estado del proyecto

- [x] (a) Estructura de carpetas y flujo de navegación
- [x] (b) Plan de trabajo y estrategia de Git (ver sección 13)
- [ ] (c) Requisitos (planilla)
- [ ] (d) ERS v1 (se trabaja fuera de Claude Code)
- [ ] (e) HTML y CSS base
- [ ] (f) Validaciones JS
- [ ] (g) Carrito con localStorage
- [ ] (h) Guion de presentación y preguntas de defensa

## 13. Estrategia de Git (trabajo individual)

- **`main`:** siempre estable y funcional. No se trabaja directamente en `main` (solo el commit inicial).
- **Ramas:** una por funcionalidad, creada desde `main` y con nombre `tipo/descripcion-corta`. Se integran con un **Pull Request en GitHub**, usando "Create a merge commit" (sin squash), para conservar cada commit como evidencia.
- **Ramas planificadas**, en orden:

| # | Rama | Contenido |
|---|---|---|
| 1 | `feature/estructura-base` | Carpetas, Bootstrap e íconos locales, `estilos.css` base (variables, header, footer), plantilla de página |
| 2 | `feature/datos-semilla` | `js/data/*`, `storage.js`, `utils.js` |
| 3 | `feature/catalogo` | Home, productos y detalle renderizados con JS (sin carrito) |
| 4 | `feature/paginas-informativas` | Nosotros, blogs, blog-1, blog-2 |
| 5 | `feature/validaciones-formularios` | `validaciones.js`, contacto, newsletter, registro (con regiones y comunas) |
| 6 | `feature/autenticacion-roles` | `auth.js`, login, sesión en el header, protección de páginas, `admin-comun.js`, home admin |
| 7 | `feature/admin-productos` | Listado, formulario, detalle y eliminación de productos |
| 8 | `feature/admin-usuarios` | Listado, formulario, detalle y eliminación de usuarios |
| 9 | `feature/carrito` | Añadir, contador, página del carrito, cupones |
| 10 | `feature/ordenes` | Pagar (crea la orden y descuenta stock), listado y detalle de órdenes |
| 11 | `style/responsive-accesibilidad` | Pulido visual, revisión móvil, accesibilidad |
| 12 | `docs/ers-y-readme` | ERS v1 en `docs/`, README final, créditos de imágenes |

- **Commits:**
  - Pequeños: una unidad lógica por commit (por ejemplo, "agregar validación de RUN" y no "avance del registro").
  - Formato `tipo: descripción` (sección 2, regla 4).
  - Prohibidos los mensajes genéricos como "cambios", "update", "fix" o "avance".
- **Cierre de la entrega:** etiqueta `v1.0-entrega1` en `main`.
