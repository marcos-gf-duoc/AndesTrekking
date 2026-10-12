/*
  Archivo: js/tienda/home.js
  Qué es: script propio de la página de inicio.
  Quién lo usa: solo index.html.
  Orden de carga: va al final, DESPUÉS de js/tienda/tienda-comun.js, porque
          usa mostrarTarjetasProductos (y esta usa storage.js y utils.js).
*/

// Códigos de los productos que se muestran como destacados en el home,
// en el orden en que aparecen. Para cambiar los destacados, se cambia esta lista.
const CODIGOS_DESTACADOS = ["MOC-001", "CAL-001", "CAR-001", "ROP-001"];

// Recibe: nada.
// Hace: lee los productos guardados en localStorage y busca, uno por uno,
//       los códigos de CODIGOS_DESTACADOS. Si un código ya no existe
//       (por ejemplo, porque el administrador eliminó el producto), lo salta.
// Devuelve: un arreglo con los productos destacados encontrados.
function obtenerProductosDestacados() {
  const productos = leerDeStorage(CLAVE_PRODUCTOS);
  const destacados = [];

  CODIGOS_DESTACADOS.forEach(function (codigoBuscado) {
    // Recorre todos los productos hasta encontrar el del código buscado
    for (let i = 0; i < productos.length; i++) {
      if (productos[i].codigo === codigoBuscado) {
        destacados.push(productos[i]);
        break; // ya se encontró: no hace falta seguir recorriendo
      }
    }
  });

  return destacados;
}

// Recibe: nada.
// Hace: dibuja las tarjetas de los productos destacados dentro del elemento
//       con id "grillaDestacados" de index.html.
// Devuelve: nada.
function iniciarHome() {
  const destacados = obtenerProductosDestacados();
  mostrarTarjetasProductos(destacados, "grillaDestacados");
}

// Se ejecuta al cargar el archivo. Como el script está al final del body,
// el elemento "grillaDestacados" ya existe en la página.
iniciarHome();
