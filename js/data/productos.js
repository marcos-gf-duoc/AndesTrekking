/*
  Archivo: js/data/productos.js
  Qué es: datos iniciales (semilla) de las categorías y los productos.
  Quién lo usa: storage.js copia PRODUCTOS_INICIALES a localStorage
          (clave at_productos) la primera vez que se abre el sitio.
          CATEGORIAS se usa en los filtros y en el formulario de productos.
          IMAGENES_PRODUCTOS se usa en el formulario de productos.
  Nota: este archivo solo tiene datos, no tiene funciones.
*/

// Categorías de la tienda. El texto de "categoria" en cada producto
// debe ser exactamente igual a uno de estos.
const CATEGORIAS = [
  "Mochilas",
  "Calzado",
  "Carpas y Refugio",
  "Ropa Técnica",
  "Accesorios",
  "Navegación y Seguridad"
];

// Imágenes disponibles para los productos: nombres de los archivos que
// están en la carpeta assets/img/productos/. El formulario de productos
// del panel las ofrece en un select.
// JavaScript no puede leer el contenido de una carpeta, por eso la lista se
// escribe a mano: si se agrega una foto a la carpeta, hay que sumarla aquí.
const IMAGENES_PRODUCTOS = [
  "bastones-araucaria.webp",
  "botas-patagonia-mid.webp",
  "botella-glaciar.webp",
  "carpa-refugio-1.webp",
  "carpa-refugio-2.webp",
  "chaqueta-ventisquero.webp",
  "guia-senderos.webp",
  "linterna-lucero-1.webp",
  "linterna-lucero-2.webp",
  "mochila-aconcagua-65.webp",
  "mochila-cumbre-22.webp",
  "mochila-torres-40.webp",
  "saco-cordillera.webp",
  "sandalias-rio-claro.webp",
  "zapatillas-sendero-trail.webp"
];

// Productos iniciales. Cada producto tiene:
//   codigo        identificador único (no se repite)
//   nombre        nombre que ve el cliente
//   descripcion   texto corto del producto
//   precio        en pesos chilenos; 0 significa "Gratis"
//   stock         unidades disponibles; 0 significa "Agotado"
//   stockCritico  si stock <= stockCritico, el admin ve una alerta
//   categoria     una de las CATEGORIAS
//   imagenes      nombres de archivo de las fotos, que están en la carpeta
//                 assets/img/productos/. La primera es la foto principal.
//                 Si está vacío, se usa assets/img/general/placeholder.webp
const PRODUCTOS_INICIALES = [
  // ---------- Mochilas ----------
  {
    codigo: "MOC-001",
    nombre: "Mochila Aconcagua 65 L",
    descripcion: "Mochila de expedición de 65 litros con espaldar ajustable, cinturón acolchado y cubre mochila incluido.",
    precio: 129990,
    stock: 12,
    stockCritico: 3,
    categoria: "Mochilas",
    imagenes: ["mochila-aconcagua-65.webp"]
  },
  {
    codigo: "MOC-002",
    nombre: "Mochila Torres 40 L",
    descripcion: "Mochila de 40 litros para travesías de dos o tres días, con acceso frontal y porta bastones.",
    precio: 89990,
    stock: 20,
    stockCritico: 5,
    categoria: "Mochilas",
    imagenes: ["mochila-torres-40.webp"]
  },
  {
    codigo: "MOC-003",
    nombre: "Mochila de ataque Cumbre 22 L",
    descripcion: "Mochila liviana de 22 litros para salidas por el día, compatible con bolsa de hidratación.",
    precio: 39990,
    stock: 2, // caso de prueba: stock bajo el crítico (alerta en el admin)
    stockCritico: 5,
    categoria: "Mochilas",
    imagenes: ["mochila-cumbre-22.webp"]
  },

  // ---------- Calzado ----------
  {
    codigo: "CAL-001",
    nombre: "Botas Patagonia Mid impermeables",
    descripcion: "Botas de caña media con membrana impermeable y suela de alto agarre para terreno húmedo.",
    precio: 109990,
    stock: 15,
    stockCritico: 4,
    categoria: "Calzado",
    imagenes: ["botas-patagonia-mid.webp"]
  },
  {
    codigo: "CAL-002",
    nombre: "Zapatillas Sendero Trail",
    descripcion: "Zapatillas livianas para senderos, con puntera reforzada y buena amortiguación.",
    precio: 74990,
    stock: 18,
    stockCritico: 4,
    categoria: "Calzado",
    imagenes: ["zapatillas-sendero-trail.webp"]
  },
  {
    codigo: "CAL-003",
    nombre: "Sandalias Río Claro",
    descripcion: "Sandalias de secado rápido con correas ajustables, ideales para cruzar ríos y descansar en el campamento.",
    precio: 34990,
    stock: 0, // caso de prueba: sin stock (botón "Agotado" en la tienda)
    stockCritico: 3,
    categoria: "Calzado",
    imagenes: ["sandalias-rio-claro.webp"]
  },

  // ---------- Carpas y Refugio ----------
  {
    codigo: "CAR-001",
    nombre: "Carpa Refugio 2 personas",
    descripcion: "Carpa de tres estaciones para dos personas, con doble techo y varillas de aluminio. Pesa 2,4 kg.",
    precio: 159990,
    stock: 8,
    stockCritico: 2,
    categoria: "Carpas y Refugio",
    imagenes: ["carpa-refugio-1.webp", "carpa-refugio-2.webp"]
  },
  {
    codigo: "CAR-002",
    nombre: "Saco de dormir Cordillera -5 °C",
    descripcion: "Saco de dormir tipo momia con temperatura de confort de -5 °C y bolsa de compresión.",
    precio: 84990,
    stock: 10,
    stockCritico: 3,
    categoria: "Carpas y Refugio",
    imagenes: ["saco-cordillera.webp"]
  },

  // ---------- Ropa Técnica ----------
  {
    codigo: "ROP-001",
    nombre: "Chaqueta impermeable Ventisquero",
    descripcion: "Chaqueta cortaviento e impermeable con capucha ajustable y costuras selladas.",
    precio: 99990,
    stock: 14,
    stockCritico: 4,
    categoria: "Ropa Técnica",
    imagenes: ["chaqueta-ventisquero.webp"]
  },
  {
    codigo: "ROP-002",
    nombre: "Primera capa térmica Lenga",
    descripcion: "Polera térmica de manga larga que mantiene el calor y seca rápido el sudor.",
    precio: 29990,
    stock: 25,
    stockCritico: 6,
    categoria: "Ropa Técnica",
    imagenes: [] // caso de prueba: sin foto (se muestra la imagen de reemplazo)
  },

  // ---------- Accesorios ----------
  {
    codigo: "ACC-001",
    nombre: "Bastones de trekking Araucaria (par)",
    descripcion: "Par de bastones telescópicos de aluminio con empuñadura de corcho y puntas de repuesto.",
    precio: 44990,
    stock: 16,
    stockCritico: 4,
    categoria: "Accesorios",
    imagenes: ["bastones-araucaria.webp"]
  },
  {
    codigo: "ACC-002",
    nombre: "Botella térmica Glaciar 750 ml",
    descripcion: "Botella de acero inoxidable de doble pared: mantiene el frío 24 horas y el calor 12 horas.",
    precio: 19990,
    stock: 30,
    stockCritico: 8,
    categoria: "Accesorios",
    imagenes: ["botella-glaciar.webp"]
  },

  // ---------- Navegación y Seguridad ----------
  {
    codigo: "NAV-001",
    nombre: "Linterna frontal Lucero 400 lm",
    descripcion: "Linterna frontal recargable de 400 lúmenes con luz roja y resistencia a la lluvia.",
    precio: 24990,
    stock: 22,
    stockCritico: 5,
    categoria: "Navegación y Seguridad",
    imagenes: ["linterna-lucero-1.webp", "linterna-lucero-2.webp"]
  },
  {
    codigo: "NAV-002",
    nombre: "Guía de senderos y seguridad en montaña",
    descripcion: "Guía impresa de regalo con consejos de seguridad, señalética de senderos y números de emergencia.",
    precio: 0, // caso de prueba: precio 0 (se muestra "Gratis")
    stock: 50,
    stockCritico: 10,
    categoria: "Navegación y Seguridad",
    imagenes: ["guia-senderos.webp"]
  }
];
