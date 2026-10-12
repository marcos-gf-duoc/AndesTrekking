/*
  Archivo: js/data/cupones.js
  Qué es: lista de cupones de descuento válidos en la tienda.
  Quién lo usa: la página del carrito (js/tienda/carrito.js), para revisar
          si el código que escribe el cliente existe y cuánto descuenta.
  Nota: este archivo solo tiene datos, no tiene funciones. Los cupones no se
          copian a localStorage: se leen directo desde aquí. En localStorage
          solo se guarda el código del cupón aplicado (clave at_cupon).
*/

// Cada cupón tiene:
//   codigo      texto que escribe el cliente, guardado en MAYÚSCULAS.
//               Al comparar, lo que escribe el cliente se pasa a mayúsculas,
//               así "andes10" y "ANDES10" valen lo mismo.
//   porcentaje  descuento sobre el subtotal (10 significa 10%)
const CUPONES = [
  { codigo: "ANDES10", porcentaje: 10 },
  { codigo: "OUTDOOR20", porcentaje: 20 }
];
