/*
  Archivo: js/admin/admin-comun.js
  Qué es: funciones compartidas por todas las páginas del panel de
          administración: protección por rol, menú vertical, saludo,
          cierre de sesión y avisos.
  Quién lo usa: todas las páginas de la carpeta admin/.
  Orden de carga: va DESPUÉS de los archivos de js/core/ (usa auth.js y
          utils.js) y ANTES del script propio de cada página.

  Cómo se usa: el script de cada página llama a iniciarPanel(...) antes de
  hacer cualquier otra cosa, indicando qué roles pueden ver la página y
  qué opción del menú le corresponde.
*/

// Roles que pueden ver casi todo el panel, para no repetir la lista
const ROLES_ADMIN_Y_VENDEDOR = [ROL_ADMINISTRADOR, ROL_VENDEDOR];

// Opciones del menú vertical, en el orden en que aparecen. Cada una tiene:
//   clave   nombre interno, para saber cuál marcar como página actual
//   texto   lo que lee el usuario
//   icono   clase del ícono de Bootstrap Icons
//   ruta    página a la que lleva (relativa a la carpeta admin/)
//   roles   quiénes pueden ver la opción. Si el rol del usuario no está en
//           esta lista, la opción NO se agrega al menú (no basta con
//           deshabilitarla).
const OPCIONES_MENU_PANEL = [
  { clave: "inicio", texto: "Inicio", icono: "bi-house", ruta: "index.html", roles: ROLES_ADMIN_Y_VENDEDOR },
  { clave: "productos", texto: "Productos", icono: "bi-box-seam", ruta: "productos.html", roles: ROLES_ADMIN_Y_VENDEDOR },
  { clave: "usuarios", texto: "Usuarios", icono: "bi-people", ruta: "usuarios.html", roles: [ROL_ADMINISTRADOR] },
  { clave: "ordenes", texto: "Órdenes", icono: "bi-receipt", ruta: "ordenes.html", roles: ROLES_ADMIN_Y_VENDEDOR },
  { clave: "tienda", texto: "Ver tienda", icono: "bi-shop", ruta: "../index.html", roles: ROLES_ADMIN_Y_VENDEDOR }
];

// Recibe: un enlace o botón ya creado, la clase de un ícono y un texto.
// Hace: le pone por dentro el ícono seguido del texto, y la clase que le
//       da el aspecto de opción del menú.
// Devuelve: nada.
function completarOpcionMenu(elemento, claseIcono, texto) {
  elemento.className = "panel-menu-opcion";

  const icono = document.createElement("i");
  icono.className = "bi " + claseIcono;
  icono.setAttribute("aria-hidden", "true"); // el ícono es decorativo: el texto ya lo dice

  elemento.appendChild(icono);
  elemento.appendChild(document.createTextNode(texto));
}

// Recibe: un enlace o botón del menú.
// Hace: lo envuelve en un <li> y lo agrega al final del menú del panel.
// Devuelve: nada.
function agregarOpcionAlMenuPanel(elemento) {
  const item = document.createElement("li");
  item.appendChild(elemento);
  document.getElementById("menuPanel").appendChild(item);
}

// Recibe: nada.
// Hace: cierra la sesión y vuelve al inicio de la tienda ("../" porque el
//       panel está dentro de la carpeta admin/).
// Devuelve: nada.
function cerrarSesionDesdePanel() {
  cerrarSesion();
  irAPagina("../index.html");
}

// Recibe: la sesión del usuario y la clave de la opción que corresponde a
//         la página actual (por ejemplo "inicio").
// Hace: arma el menú vertical. Recorre OPCIONES_MENU_PANEL y agrega solo
//       las opciones que el rol del usuario puede ver. Marca la de la
//       página actual y, al final, agrega el botón "Cerrar sesión".
// Devuelve: nada.
function mostrarMenuPanel(sesion, claveActiva) {
  // Parte de cero, por si la función se llamara más de una vez
  document.getElementById("menuPanel").innerHTML = "";

  OPCIONES_MENU_PANEL.forEach(function (opcion) {
    // indexOf devuelve -1 cuando el rol no está en la lista de la opción
    const puedeVerla = opcion.roles.indexOf(sesion.tipo) !== -1;

    if (!puedeVerla) {
      return; // dentro de forEach, return pasa a la opción siguiente
    }

    const enlace = document.createElement("a");
    enlace.href = opcion.ruta;
    completarOpcionMenu(enlace, opcion.icono, opcion.texto);

    if (opcion.clave === claveActiva) {
      enlace.classList.add("activa");
      enlace.setAttribute("aria-current", "page");
    }

    agregarOpcionAlMenuPanel(enlace);
  });

  // "Cerrar sesión" es un botón porque ejecuta una acción, no lleva a
  // otra página
  const botonCerrar = document.createElement("button");
  botonCerrar.type = "button";
  completarOpcionMenu(botonCerrar, "bi-box-arrow-right", "Cerrar sesión");
  botonCerrar.addEventListener("click", cerrarSesionDesdePanel);
  agregarOpcionAlMenuPanel(botonCerrar);
}

// Recibe: la sesión del usuario.
// Hace: escribe el saludo del menú, con el nombre y el rol entre
//       paréntesis, por ejemplo "Hola, Marcos (Administrador)".
// Devuelve: nada.
function mostrarSaludoPanel(sesion) {
  const saludo = document.getElementById("saludoPanel");
  saludo.textContent = "Hola, " + sesion.nombre + " (" + sesion.tipo + ")";
}

// ==========================================================
// Avisos del panel
// Cada página del panel puede tener un elemento con id "avisoPanel", que
// parte oculto. Sirve para confirmar una acción ("Se eliminó el producto")
// y para los avisos que llegan por la URL al volver de un formulario.
// ==========================================================

// Texto de cada aviso que puede llegar por la URL (?aviso=código). La URL
// lleva solo el código; el texto se define aquí (decisión D-13).
const TEXTOS_DE_AVISOS_PANEL = {
  "producto-creado": "El producto se creó correctamente.",
  "producto-actualizado": "Los cambios del producto se guardaron."
};

// Recibe: el texto de un aviso.
// Hace: lo escribe en la caja de avisos de la página y la muestra. Si la
//       página no tiene esa caja, no hace nada.
// Devuelve: nada.
function mostrarAvisoPanel(texto) {
  const caja = document.getElementById("avisoPanel");

  if (caja === null) {
    return;
  }

  caja.textContent = texto;
  caja.hidden = false;
}

// Recibe: nada.
// Hace: lee el parámetro "aviso" de la URL y, si es un código conocido,
//       muestra su texto. Con un código desconocido no hace nada.
// Devuelve: nada.
function mostrarAvisoDeUrlPanel() {
  const codigo = obtenerParametroUrl("aviso");

  if (codigo === null) {
    return;
  }

  const texto = TEXTOS_DE_AVISOS_PANEL[codigo];

  if (typeof texto !== "string") {
    return;
  }

  mostrarAvisoPanel(texto);
}

// Recibe: el arreglo de roles que pueden ver la página y la clave de su
//         opción en el menú.
// Hace: es lo primero que ejecuta cada página del panel:
//       1. Protege la página (protegerPagina, de auth.js). Si el usuario no
//          puede verla, ya quedó redirigido y no se hace nada más.
//       2. Arma el menú y el saludo, y muestra el aviso de la URL si lo hay.
//       3. Muestra el panel, que en el HTML parte oculto con el atributo
//          "hidden" para que no se vea ni un instante sin permiso.
// Devuelve: true si la página se puede mostrar; false si el usuario fue
//           redirigido. Con false, el script de la página debe detenerse.
function iniciarPanel(rolesPermitidos, claveActiva) {
  if (!protegerPagina(rolesPermitidos)) {
    return false;
  }

  const sesion = obtenerSesion();

  mostrarMenuPanel(sesion, claveActiva);
  mostrarSaludoPanel(sesion);
  mostrarAvisoDeUrlPanel();

  document.getElementById("panel").hidden = false;
  return true;
}
