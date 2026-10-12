# AndesTrekking 🏔️

Tienda online de artículos de trekking, senderismo y deportes outdoor, con un panel administrativo protegido por roles.

Proyecto de la **Evaluación Parcial 1** de la asignatura **DSY1104 Desarrollo Fullstack II** (Duoc UC).

> **Estado:** en desarrollo (entrega 1, frontend).

## Funcionalidades

**Tienda (pública)**

- Inicio con productos destacados.
- Catálogo de productos y detalle de cada producto.
- Carrito de compras guardado en el navegador, con cupones de descuento.
- Registro de usuarios e inicio de sesión.
- Páginas Nosotros, Blogs y Contacto.

**Panel administrativo (protegido)**

- Mantenedor de productos: listar, crear, mostrar, editar y eliminar.
- Mantenedor de usuarios: listar, crear, mostrar, editar y eliminar.
- Listado y detalle de órdenes.

**Roles**

| Rol | Acceso |
|---|---|
| Administrador | Acceso total al panel |
| Vendedor | Productos (solo lectura) y órdenes |
| Cliente | Solo la tienda |

## Tecnologías

- HTML5 semántico
- CSS3 propio (hojas externas)
- Bootstrap 5 y Bootstrap Icons como complemento (archivos locales)
- JavaScript vanilla, con validaciones propias
- `localStorage` para la persistencia (no hay backend en esta etapa)
- Git y GitHub para el control de versiones

## Cómo ejecutarlo

1. Descarga o clona el repositorio.
2. Abre la carpeta en VS Code y usa la extensión **Live Server** ("Go Live"). También puedes abrir `index.html` directamente en el navegador.

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Vendedor | vendedor@duoc.cl | vende123 |
| Cliente | cliente@gmail.com | cliente1 |

> ⚠️ **Limitación conocida:** la autenticación es una simulación en el navegador. Las contraseñas se guardan sin cifrar en `localStorage`, por lo que **no es seguridad real**. En una etapa con backend, la validación se hará en el servidor.

## Estructura del proyecto

```
├── *.html        Páginas de la tienda
├── admin/        Páginas del panel administrativo
├── css/          Estilos propios
├── js/
│   ├── data/     Datos iniciales (productos, usuarios, órdenes, regiones)
│   ├── core/     Lógica compartida (almacenamiento, validaciones, sesión)
│   ├── tienda/   Scripts de cada página de la tienda
│   └── admin/    Scripts de cada página del panel
├── assets/       Imágenes y librerías locales
└── docs/         Documentación (ERS y créditos de imágenes)
```

## Documentación

- Especificación de Requisitos de Software (ERS v1): `docs/` (en elaboración)
- Créditos de imágenes: `docs/creditos-imagenes.md`

## Herramientas de apoyo

Durante el desarrollo se utilizó **Claude (Anthropic)** como asistente para el análisis de requisitos, la planificación y la generación de código. Todo el código fue revisado, probado e integrado por el autor. El contexto entregado al asistente está en `CLAUDE.md`.

## Autor

**Marcos Godoy**, estudiante de Ingeniería en Informática, Duoc UC.
