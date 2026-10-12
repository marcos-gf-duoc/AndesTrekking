/*
  Archivo: js/data/ordenes.js
  Qué es: datos iniciales (semilla) de las órdenes de compra.
  Quién lo usa: storage.js copia ORDENES_INICIALES a localStorage
          (clave at_ordenes) la primera vez que se abre el sitio.
          El panel admin las muestra en el listado y el detalle de órdenes.
  Nota: este archivo solo tiene datos, no tiene funciones.
*/

// Órdenes iniciales. Cada orden tiene:
//   id             formato ORD-1001, correlativo (la siguiente será ORD-1021)
//   fecha          formato AAAA-MM-DD
//   runCliente, nombreCliente, correoCliente
//                  copia de los datos del cliente al momento de comprar
//   items          productos comprados. Cada item guarda el nombre y el precio
//                  del momento de la compra: si después cambia el producto,
//                  la orden antigua no cambia
//   subtotal       suma de precio x cantidad de todos los items
//   cupon          código del cupón usado, o null si no se usó ninguno
//   descuento      subtotal x porcentaje del cupón / 100 (0 si no hay cupón)
//   total          subtotal - descuento
//   estado         "Pendiente", "En proceso", "Enviada" o "Cancelada"
// Los clientes, códigos y precios coinciden con usuarios.js y productos.js.
const ORDENES_INICIALES = [
  {
    id: "ORD-1001",
    fecha: "2026-08-03",
    runCliente: "19011001K",
    nombreCliente: "Camila Soto Fuentes",
    correoCliente: "cliente@gmail.com",
    items: [
      { codigo: "MOC-002", nombre: "Mochila Torres 40 L", precio: 89990, cantidad: 1 },
      { codigo: "ACC-002", nombre: "Botella térmica Glaciar 750 ml", precio: 19990, cantidad: 2 }
    ],
    subtotal: 129970,
    cupon: null,
    descuento: 0,
    total: 129970,
    estado: "Enviada"
  },
  {
    id: "ORD-1002",
    fecha: "2026-08-05",
    runCliente: "152348762",
    nombreCliente: "Felipe Araya Contreras",
    correoCliente: "felipe.araya@gmail.com",
    items: [
      { codigo: "CAL-001", nombre: "Botas Patagonia Mid impermeables", precio: 109990, cantidad: 1 }
    ],
    subtotal: 109990,
    cupon: "ANDES10",
    descuento: 10999,
    total: 98991,
    estado: "Enviada"
  },
  {
    id: "ORD-1003",
    fecha: "2026-08-09",
    runCliente: "174563292",
    nombreCliente: "Daniela Pérez Vidal",
    correoCliente: "daniela.perez@gmail.com",
    items: [
      { codigo: "CAR-001", nombre: "Carpa Refugio 2 personas", precio: 159990, cantidad: 1 },
      { codigo: "CAR-002", nombre: "Saco de dormir Cordillera -5 °C", precio: 84990, cantidad: 2 }
    ],
    subtotal: 329970,
    cupon: "OUTDOOR20",
    descuento: 65994,
    total: 263976,
    estado: "Enviada"
  },
  {
    id: "ORD-1004",
    fecha: "2026-08-12",
    runCliente: "187654327",
    nombreCliente: "Ignacio Morales Tapia",
    correoCliente: "ignacio.morales@duoc.cl",
    items: [
      { codigo: "ROP-002", nombre: "Primera capa térmica Lenga", precio: 29990, cantidad: 3 }
    ],
    subtotal: 89970,
    cupon: null,
    descuento: 0,
    total: 89970,
    estado: "Enviada"
  },
  {
    id: "ORD-1005",
    fecha: "2026-08-16",
    runCliente: "169087547",
    nombreCliente: "Francisca Herrera Lagos",
    correoCliente: "fran.herrera@gmail.com",
    items: [
      { codigo: "NAV-001", nombre: "Linterna frontal Lucero 400 lm", precio: 24990, cantidad: 1 },
      { codigo: "NAV-002", nombre: "Guía de senderos y seguridad en montaña", precio: 0, cantidad: 1 }
    ],
    subtotal: 24990,
    cupon: null,
    descuento: 0,
    total: 24990,
    estado: "Enviada"
  },
  {
    id: "ORD-1006",
    fecha: "2026-08-20",
    runCliente: "19011001K",
    nombreCliente: "Camila Soto Fuentes",
    correoCliente: "cliente@gmail.com",
    items: [
      { codigo: "CAL-003", nombre: "Sandalias Río Claro", precio: 34990, cantidad: 1 }
    ],
    subtotal: 34990,
    cupon: null,
    descuento: 0,
    total: 34990,
    estado: "Cancelada"
  },
  {
    id: "ORD-1007",
    fecha: "2026-08-24",
    runCliente: "152348762",
    nombreCliente: "Felipe Araya Contreras",
    correoCliente: "felipe.araya@gmail.com",
    items: [
      { codigo: "MOC-001", nombre: "Mochila Aconcagua 65 L", precio: 129990, cantidad: 1 },
      { codigo: "ACC-001", nombre: "Bastones de trekking Araucaria (par)", precio: 44990, cantidad: 1 }
    ],
    subtotal: 174980,
    cupon: "ANDES10",
    descuento: 17498,
    total: 157482,
    estado: "Enviada"
  },
  {
    id: "ORD-1008",
    fecha: "2026-08-28",
    runCliente: "169087547",
    nombreCliente: "Francisca Herrera Lagos",
    correoCliente: "fran.herrera@gmail.com",
    items: [
      { codigo: "ROP-001", nombre: "Chaqueta impermeable Ventisquero", precio: 99990, cantidad: 1 },
      { codigo: "ROP-002", nombre: "Primera capa térmica Lenga", precio: 29990, cantidad: 2 }
    ],
    subtotal: 159970,
    cupon: null,
    descuento: 0,
    total: 159970,
    estado: "Enviada"
  },
  {
    id: "ORD-1009",
    fecha: "2026-09-02",
    runCliente: "174563292",
    nombreCliente: "Daniela Pérez Vidal",
    correoCliente: "daniela.perez@gmail.com",
    items: [
      { codigo: "CAL-002", nombre: "Zapatillas Sendero Trail", precio: 74990, cantidad: 2 }
    ],
    subtotal: 149980,
    cupon: null,
    descuento: 0,
    total: 149980,
    estado: "Enviada"
  },
  {
    id: "ORD-1010",
    fecha: "2026-09-06",
    runCliente: "187654327",
    nombreCliente: "Ignacio Morales Tapia",
    correoCliente: "ignacio.morales@duoc.cl",
    items: [
      { codigo: "ACC-002", nombre: "Botella térmica Glaciar 750 ml", precio: 19990, cantidad: 4 }
    ],
    subtotal: 79960,
    cupon: "ANDES10",
    descuento: 7996,
    total: 71964,
    estado: "Enviada"
  },
  {
    id: "ORD-1011",
    fecha: "2026-09-10",
    runCliente: "19011001K",
    nombreCliente: "Camila Soto Fuentes",
    correoCliente: "cliente@gmail.com",
    items: [
      { codigo: "CAR-002", nombre: "Saco de dormir Cordillera -5 °C", precio: 84990, cantidad: 1 },
      { codigo: "NAV-001", nombre: "Linterna frontal Lucero 400 lm", precio: 24990, cantidad: 2 }
    ],
    subtotal: 134970,
    cupon: null,
    descuento: 0,
    total: 134970,
    estado: "Cancelada"
  },
  {
    id: "ORD-1012",
    fecha: "2026-09-14",
    runCliente: "169087547",
    nombreCliente: "Francisca Herrera Lagos",
    correoCliente: "fran.herrera@gmail.com",
    items: [
      { codigo: "MOC-003", nombre: "Mochila de ataque Cumbre 22 L", precio: 39990, cantidad: 1 },
      { codigo: "ACC-001", nombre: "Bastones de trekking Araucaria (par)", precio: 44990, cantidad: 1 },
      { codigo: "ACC-002", nombre: "Botella térmica Glaciar 750 ml", precio: 19990, cantidad: 1 }
    ],
    subtotal: 104970,
    cupon: null,
    descuento: 0,
    total: 104970,
    estado: "Enviada"
  },
  {
    id: "ORD-1013",
    fecha: "2026-09-18",
    runCliente: "152348762",
    nombreCliente: "Felipe Araya Contreras",
    correoCliente: "felipe.araya@gmail.com",
    items: [
      { codigo: "CAR-001", nombre: "Carpa Refugio 2 personas", precio: 159990, cantidad: 1 }
    ],
    subtotal: 159990,
    cupon: "OUTDOOR20",
    descuento: 31998,
    total: 127992,
    estado: "Enviada"
  },
  {
    id: "ORD-1014",
    fecha: "2026-09-22",
    runCliente: "174563292",
    nombreCliente: "Daniela Pérez Vidal",
    correoCliente: "daniela.perez@gmail.com",
    items: [
      { codigo: "ROP-001", nombre: "Chaqueta impermeable Ventisquero", precio: 99990, cantidad: 2 }
    ],
    subtotal: 199980,
    cupon: null,
    descuento: 0,
    total: 199980,
    estado: "En proceso"
  },
  {
    id: "ORD-1015",
    fecha: "2026-09-26",
    runCliente: "187654327",
    nombreCliente: "Ignacio Morales Tapia",
    correoCliente: "ignacio.morales@duoc.cl",
    items: [
      { codigo: "CAL-001", nombre: "Botas Patagonia Mid impermeables", precio: 109990, cantidad: 1 },
      { codigo: "ROP-002", nombre: "Primera capa térmica Lenga", precio: 29990, cantidad: 1 }
    ],
    subtotal: 139980,
    cupon: "ANDES10",
    descuento: 13998,
    total: 125982,
    estado: "En proceso"
  },
  {
    id: "ORD-1016",
    fecha: "2026-09-30",
    runCliente: "19011001K",
    nombreCliente: "Camila Soto Fuentes",
    correoCliente: "cliente@gmail.com",
    items: [
      { codigo: "MOC-001", nombre: "Mochila Aconcagua 65 L", precio: 129990, cantidad: 1 }
    ],
    subtotal: 129990,
    cupon: null,
    descuento: 0,
    total: 129990,
    estado: "En proceso"
  },
  {
    id: "ORD-1017",
    fecha: "2026-10-03",
    runCliente: "169087547",
    nombreCliente: "Francisca Herrera Lagos",
    correoCliente: "fran.herrera@gmail.com",
    items: [
      { codigo: "CAL-002", nombre: "Zapatillas Sendero Trail", precio: 74990, cantidad: 1 },
      { codigo: "NAV-002", nombre: "Guía de senderos y seguridad en montaña", precio: 0, cantidad: 1 },
      { codigo: "ACC-002", nombre: "Botella térmica Glaciar 750 ml", precio: 19990, cantidad: 1 }
    ],
    subtotal: 94980,
    cupon: null,
    descuento: 0,
    total: 94980,
    estado: "En proceso"
  },
  {
    id: "ORD-1018",
    fecha: "2026-10-06",
    runCliente: "152348762",
    nombreCliente: "Felipe Araya Contreras",
    correoCliente: "felipe.araya@gmail.com",
    items: [
      { codigo: "NAV-001", nombre: "Linterna frontal Lucero 400 lm", precio: 24990, cantidad: 3 }
    ],
    subtotal: 74970,
    cupon: null,
    descuento: 0,
    total: 74970,
    estado: "Pendiente"
  },
  {
    id: "ORD-1019",
    fecha: "2026-10-08",
    runCliente: "174563292",
    nombreCliente: "Daniela Pérez Vidal",
    correoCliente: "daniela.perez@gmail.com",
    items: [
      { codigo: "MOC-002", nombre: "Mochila Torres 40 L", precio: 89990, cantidad: 1 },
      { codigo: "ACC-001", nombre: "Bastones de trekking Araucaria (par)", precio: 44990, cantidad: 2 }
    ],
    subtotal: 179970,
    cupon: "OUTDOOR20",
    descuento: 35994,
    total: 143976,
    estado: "Pendiente"
  },
  {
    id: "ORD-1020",
    fecha: "2026-10-10",
    runCliente: "187654327",
    nombreCliente: "Ignacio Morales Tapia",
    correoCliente: "ignacio.morales@duoc.cl",
    items: [
      { codigo: "CAR-002", nombre: "Saco de dormir Cordillera -5 °C", precio: 84990, cantidad: 1 },
      { codigo: "ROP-001", nombre: "Chaqueta impermeable Ventisquero", precio: 99990, cantidad: 1 }
    ],
    subtotal: 184980,
    cupon: null,
    descuento: 0,
    total: 184980,
    estado: "Pendiente"
  }
];
