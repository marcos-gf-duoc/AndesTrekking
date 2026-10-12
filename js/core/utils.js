/*
  Archivo: js/core/utils.js
  Qué es: funciones pequeñas de uso general, que no pertenecen a una página
          en particular.
  Quién lo usa: las páginas de la tienda y del panel admin que muestran
          precios o que reciben un dato por la URL (por ejemplo
          producto.html?codigo=MOC-001).
*/

// Recibe: un precio como número (por ejemplo 129990).
// Hace: lo convierte en un texto con formato de pesos chilenos.
// Devuelve: el texto listo para mostrar. Ejemplos:
//           129990  -> "$129.990"
//           1990.5  -> "$1.990,50"
//           0       -> "Gratis"
function formatearPrecio(precio) {
  // Regla del negocio: un producto con precio 0 se muestra como "Gratis"
  if (precio === 0) {
    return "Gratis";
  }

  // Sin decimales si el precio es entero; con 2 decimales si no lo es
  let cantidadDecimales = 0;
  if (!Number.isInteger(precio)) {
    cantidadDecimales = 2;
  }

  // Intl.NumberFormat es una herramienta del navegador que da formato a los
  // números según el país: "es-CL" es español de Chile y "CLP" el peso chileno
  const formateador = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: cantidadDecimales,
    maximumFractionDigits: cantidadDecimales
  });

  return formateador.format(precio);
}

// Recibe: el nombre de un parámetro de la URL (por ejemplo "codigo").
// Hace: lo busca en la dirección de la página actual. En
//       producto.html?codigo=MOC-001 el parámetro "codigo" vale "MOC-001".
// Devuelve: el valor como texto, o null si el parámetro no está en la URL.
function obtenerParametroUrl(nombre) {
  // window.location.search es la parte de la URL desde el signo "?"
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get(nombre);
}
