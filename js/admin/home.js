/*
  Archivo: js/admin/home.js
  Qué es: script propio de la página de inicio del panel de administración.
          Escribe la bienvenida y maneja el botón "Restablecer datos demo".
  Quién lo usa: solo admin/index.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
*/

// Recibe: la sesión del usuario.
// Hace: escribe la bienvenida con su nombre y una frase que resume lo que
//       puede hacer en el panel según su rol.
// Devuelve: nada.
function mostrarBienvenida(sesion) {
  document.getElementById("bienvenidaPanel").textContent = "Bienvenido, " + sesion.nombre + ".";

  let descripcion = "Como Vendedor puedes consultar los productos y revisar las órdenes.";
  if (sesion.tipo === ROL_ADMINISTRADOR) {
    descripcion = "Como Administrador puedes gestionar los productos, los usuarios y las órdenes.";
  }

  document.getElementById("descripcionRol").textContent = descripcion;
}

// Recibe: nada.
// Hace: pide una confirmación y, si el usuario acepta, restablece los datos
//       de demostración (restablecerDatosDemo, de storage.js). Como eso
//       borra también la sesión, después lleva al login con un aviso.
//       Si el usuario cancela, no hace nada.
// Devuelve: nada.
function confirmarYRestablecer() {
  // confirm muestra un cuadro del navegador con Aceptar y Cancelar, y
  // devuelve true solo si se presiona Aceptar
  const acepto = confirm(
    "Se restablecerán los productos, usuarios y órdenes a su estado inicial. " +
    "Se perderán todos los cambios, el carrito y los mensajes, y se cerrará tu sesión. " +
    "¿Quieres continuar?"
  );

  if (!acepto) {
    return;
  }

  restablecerDatosDemo();
  irAPagina("../login.html?aviso=restablecido");
}

// Recibe: la sesión del usuario.
// Hace: prepara la sección "Datos de demostración", que en el HTML parte
//       oculta. Al Administrador se la muestra y le conecta el botón.
//       A los demás roles se la quita de la página: restablecer los datos
//       es una acción reservada al Administrador.
// Devuelve: nada.
function prepararSeccionRestablecer(sesion) {
  const seccion = document.getElementById("seccionRestablecer");

  if (sesion.tipo !== ROL_ADMINISTRADOR) {
    seccion.remove();
    return;
  }

  seccion.hidden = false;
  document.getElementById("botonRestablecer").addEventListener("click", confirmarYRestablecer);
}

// Recibe: nada.
// Hace: prepara la página de inicio del panel. Lo primero es iniciarPanel:
//       pueden entrar el Administrador y el Vendedor, y la opción del menú
//       que se marca es "inicio". Si el usuario no puede ver la página,
//       iniciarPanel ya lo redirigió y aquí no se hace nada más.
// Devuelve: nada.
function iniciarHomeAdmin() {
  const puedeVerLaPagina = iniciarPanel(ROLES_ADMIN_Y_VENDEDOR, "inicio");

  if (!puedeVerLaPagina) {
    return;
  }

  const sesion = obtenerSesion();
  mostrarBienvenida(sesion);
  prepararSeccionRestablecer(sesion);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarHomeAdmin();
