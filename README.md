# AndesTrekking 🏔️

Tienda online de artículos de trekking, senderismo y deportes outdoor, con un panel administrativo protegido por roles.

Proyecto de la **Evaluación Parcial 1** de la asignatura **DSY1104 Desarrollo Fullstack II** (Duoc UC).

> **Estado:** entrega 1 (frontend) completa. No tiene backend: los datos se guardan en el navegador.

## Funcionalidades

**Tienda (pública)**

- Inicio con productos destacados.
- Catálogo con filtro por categoría y detalle de cada producto, con fotos y productos relacionados.
- Carrito de compras guardado en el navegador: cantidades limitadas por el stock y cupones de descuento.
- Pago simulado: crea una orden, descuenta el stock y muestra el número de orden. Exige iniciar sesión.
- Registro de usuarios e inicio de sesión, con validaciones propias en JavaScript.
- Páginas Nosotros, Blogs (dos artículos) y Contacto.
- Suscripción a la newsletter en el pie de página.

**Panel administrativo (protegido)**

- Mantenedor de productos: listar, crear, mostrar, editar y eliminar, con alerta de stock crítico.
- Mantenedor de usuarios: listar, crear, mostrar, editar y eliminar.
- Órdenes: listado, detalle y cambio de estado. Al cancelar una orden, sus productos vuelven al stock.
- Listados con paginación y botón para restablecer los datos de demostración.

**Roles**

| Rol | Acceso |
|---|---|
| Administrador | Acceso total al panel |
| Vendedor | Productos (solo lectura) y órdenes |
| Cliente | Solo la tienda |

Las opciones que un rol no puede usar no aparecen en su menú.

**Validaciones**

Todos los formularios se validan con JavaScript propio, en tiempo real y al enviar, con mensajes de error específicos bajo cada campo. Entre otras reglas:

- RUN chileno con dígito verificador (módulo 11), sin puntos ni guion.
- Correos solo de `@duoc.cl`, `@profesor.duoc.cl` y `@gmail.com`.
- Región y comuna dependientes: al cambiar la región se cargan sus comunas.

**Accesibilidad y diseño responsivo**

- HTML semántico, un solo `h1` por página y etiquetas en todos los campos.
- Navegación con teclado: enlace "Saltar al contenido" y foco visible.
- Diseño adaptado a teléfono, tableta y escritorio.

## Tecnologías

- HTML5 semántico
- CSS3 propio en hojas externas (`css/estilos.css` y `css/admin.css`)
- Bootstrap 5 y Bootstrap Icons como complemento (archivos locales, funciona sin internet)
- JavaScript vanilla, sin frameworks
- `localStorage` para la persistencia
- Git y GitHub para el control de versiones

## Cómo ejecutarlo

1. Descarga o clona el repositorio.
2. Abre la carpeta en VS Code y usa la extensión **Live Server** ("Go Live"). También puedes abrir `index.html` directamente en el navegador.

### Datos de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Vendedor | vendedor@duoc.cl | vende123 |
| Cliente | cliente@gmail.com | cliente1 |

Cupones de descuento: `ANDES10` (10 %) y `OUTDOOR20` (20 %).

El sitio parte con 14 productos, 7 usuarios y 20 órdenes de ejemplo. Para volver a ese estado inicial, entra como Administrador y usa **Restablecer datos demo** en el inicio del panel.

> ⚠️ **Limitación conocida:** la autenticación es una simulación en el navegador. Las contraseñas se guardan sin cifrar en `localStorage`, por lo que **no es seguridad real**. En una etapa con backend, la validación se hará en el servidor.

## Estructura del proyecto

```
├── *.html        Páginas de la tienda
├── admin/        Páginas del panel administrativo
├── css/          Estilos propios
├── js/
│   ├── data/     Datos iniciales (productos, usuarios, órdenes, cupones, regiones)
│   ├── core/     Lógica compartida (almacenamiento, validaciones, sesión)
│   ├── tienda/   Scripts de cada página de la tienda
│   └── admin/    Scripts de cada página del panel
├── assets/       Imágenes y librerías locales
└── docs/         Documentación (ERS, planilla de requisitos y créditos de imágenes)
```

## Fuera del alcance de esta entrega

- Backend, base de datos y pagos reales.
- Cifrado de contraseñas.
- Vista de los mensajes de contacto en el panel (se guardan, pero aún no se muestran).

## Documentación

- Especificación de Requisitos de Software (ERS v1): `docs/ERS_AndesTrekking_v1.docx`
- Planilla de requerimientos (42 requisitos): `docs/Planilla_Requerimientos_AndesTrekking.xlsx`
- Créditos de imágenes: `docs/creditos-imagenes.md`

## Herramientas de apoyo

Durante el desarrollo se utilizó **Claude (Anthropic)** como asistente para el análisis de requisitos, la planificación y la generación de código. Todo el código fue revisado, probado e integrado por el autor. El contexto entregado al asistente está en `CLAUDE.md`.

## Autor

**Marcos Godoy**, estudiante de Ingeniería en Informática, Duoc UC.
