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

// Recibe: un texto cualquiera (por ejemplo, el nombre de un producto).
// Hace: reemplaza los caracteres que tienen un significado especial en HTML
//       por su versión segura. Así, si alguien escribe <b> o <script> en un
//       campo, la página lo muestra como texto y no lo ejecuta como código.
// Devuelve: el texto listo para insertarlo dentro de un HTML.
function escaparHtml(texto) {
  let textoSeguro = String(texto); // String() convierte números u otros datos en texto

  // El & va primero: si fuera al final, cambiaría los & de los reemplazos anteriores
  textoSeguro = textoSeguro.replace(/&/g, "&amp;");
  textoSeguro = textoSeguro.replace(/</g, "&lt;");
  textoSeguro = textoSeguro.replace(/>/g, "&gt;");
  textoSeguro = textoSeguro.replace(/"/g, "&quot;");
  textoSeguro = textoSeguro.replace(/'/g, "&#39;");

  return textoSeguro;
}

// Recibe: nada.
// Hace: toma la fecha actual del computador y la escribe con el formato
//       AAAA-MM-DD (por ejemplo "2026-10-12"), que es el que usa el sitio
//       para guardar fechas.
// Devuelve: la fecha de hoy como texto.
function obtenerFechaDeHoy() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1; // getMonth cuenta desde 0: enero es 0
  const dia = hoy.getDate();

  // padStart(2, "0") completa con un cero a la izquierda: "5" pasa a "05"
  const mesDosDigitos = String(mes).padStart(2, "0");
  const diaDosDigitos = String(dia).padStart(2, "0");

  return anio + "-" + mesDosDigitos + "-" + diaDosDigitos;
}

// ==========================================================
// Funciones para formularios
// Muestran en la página el resultado de las validaciones
// (las reglas están en js/core/validaciones.js).
//
// Convención de ids: el mensaje de error de un campo se escribe en un
// elemento cuyo id es "error" + el id del campo con la primera letra en
// mayúscula. Ejemplo: el campo "correoContacto" usa "errorCorreoContacto".
// ==========================================================

// Recibe: el id de un campo (por ejemplo "correoContacto").
// Hace: arma el id del elemento donde va su mensaje de error.
// Devuelve: ese id (por ejemplo "errorCorreoContacto").
function obtenerIdError(idCampo) {
  const primeraLetra = idCampo[0].toUpperCase();
  const resto = idCampo.slice(1);
  return "error" + primeraLetra + resto;
}

// Recibe: el id de un campo y el resultado de su validación: un mensaje de
//         error, o "" si el valor es válido.
// Hace: si hay error, marca el campo en rojo (clase is-invalid) y escribe
//       el mensaje bajo el campo. Si no hay error, lo marca en verde
//       (clase is-valid) y borra el mensaje.
//       Las clases is-invalid e is-valid son de Bootstrap y solo dan el
//       estilo; la decisión de si hay error la tomó la validación propia.
// Devuelve: true si el campo quedó válido; false si quedó con error.
function mostrarResultadoCampo(idCampo, mensajeError) {
  const campo = document.getElementById(idCampo);
  const cajaError = document.getElementById(obtenerIdError(idCampo));

  if (mensajeError === "") {
    campo.classList.remove("is-invalid");
    campo.classList.add("is-valid");
    campo.removeAttribute("aria-invalid");
    cajaError.textContent = "";
    return true;
  }

  campo.classList.remove("is-valid");
  campo.classList.add("is-invalid");
  campo.setAttribute("aria-invalid", "true"); // avisa el error a los lectores de pantalla
  cajaError.textContent = mensajeError;
  return false;
}

// Recibe: el id de un campo.
// Hace: le quita el estado de validación: ni rojo ni verde, y sin mensaje.
//       Sirve al limpiar un formulario y para los campos opcionales que
//       quedan vacíos (no tiene sentido marcarlos en verde).
// Devuelve: nada.
function limpiarEstadoCampo(idCampo) {
  const campo = document.getElementById(idCampo);
  const cajaError = document.getElementById(obtenerIdError(idCampo));

  campo.classList.remove("is-invalid");
  campo.classList.remove("is-valid");
  campo.removeAttribute("aria-invalid");
  cajaError.textContent = "";
}

// Recibe: el id de un formulario.
// Hace: busca el primer campo marcado con error dentro de ese formulario
//       y pone el cursor en él, para que el usuario lo corrija.
// Devuelve: nada.
function enfocarPrimerCampoConError(idFormulario) {
  const formulario = document.getElementById(idFormulario);

  // querySelector devuelve el primer elemento que coincide, o null si no hay
  const primerCampoConError = formulario.querySelector(".is-invalid");

  if (primerCampoConError !== null) {
    primerCampoConError.focus();
  }
}

// Recibe: el id de un campo de texto, el id del elemento que muestra el
//         contador y el largo máximo permitido.
// Hace: escribe cuántos caracteres lleva el campo, por ejemplo "120/500".
//       Si se pasa del máximo, agrega la clase "contador-excedido" para
//       que el contador se vea en rojo.
// Devuelve: nada.
function actualizarContador(idCampo, idContador, largoMaximo) {
  const campo = document.getElementById(idCampo);
  const contador = document.getElementById(idContador);
  const largoActual = campo.value.length;

  contador.textContent = largoActual + "/" + largoMaximo;

  if (largoActual > largoMaximo) {
    contador.classList.add("contador-excedido");
  } else {
    contador.classList.remove("contador-excedido");
  }
}
