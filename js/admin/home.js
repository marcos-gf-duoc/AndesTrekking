/*
  Archivo: js/admin/home.js
  Qué es: script propio de la página de inicio del panel de administración.
  Quién lo usa: solo admin/index.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
*/

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
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarHomeAdmin();
