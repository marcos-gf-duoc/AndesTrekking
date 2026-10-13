/*
  Archivo: js/admin/admin-comun.js
  Qué es: funciones compartidas por todas las páginas del panel de
          administración: protección por rol, menú vertical, saludo,
          cierre de sesión, avisos, celdas de tabla, paginación,
          etiquetas de estado y conexión de los campos de formulario.
  Quién lo usa: todas las páginas de la carpeta admin/.
  Orden de carga: va DESPUÉS de los archivos de js/core/ (usa auth.js y
          utils.js) y ANTES del script propio de cada página.

  Cómo se usa: el script de cada página llama a iniciarPanel(...) antes de
  hacer cualquier otra cosa, indicando qué roles pueden ver la página y
  qué opción del menú le corresponde.
*/

// Roles que pueden ver casi todo el panel, para no repetir la lista
const ROLES_ADMIN_Y_VENDEDOR = [ROL_ADMINISTRADOR, ROL_VENDEDOR];

// Rutas de las imágenes vistas desde la carpeta admin/. Llevan "../" porque
// las imágenes están en la raíz del proyecto, una carpeta más arriba.
const CARPETA_IMAGENES_PANEL = "../assets/img/productos/";
const IMAGEN_DE_REEMPLAZO_PANEL = "../assets/img/general/placeholder.webp";

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
  "producto-actualizado": "Los cambios del producto se guardaron.",
  "usuario-creado": "El usuario se creó correctamente.",
  "usuario-actualizado": "Los cambios del usuario se guardaron."
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

// ==========================================================
// Tablas y paginación
// Funciones generales para los listados del panel (productos, usuarios y
// órdenes). Cada listado guarda su propia lista y su página actual, y
// usa estas funciones para calcular y dibujar.
// Los ids "textoPaginacion" y "botonesPaginacion" son los mismos en todas
// las páginas con listado.
// ==========================================================

// Cantidad de filas que muestra cada página de una tabla
const ELEMENTOS_POR_PAGINA = 5;

// Recibe: el texto de una celda y, opcionalmente, una clase CSS.
// Hace: crea una celda de tabla (<td>). El texto se escribe con textContent,
//       así que se muestra tal cual aunque tenga símbolos de HTML.
// Devuelve: la celda creada.
function crearCelda(texto, clase) {
  const celda = document.createElement("td");
  celda.textContent = texto;

  // clase es opcional: si no se entrega, vale undefined y no se aplica
  if (clase !== undefined) {
    celda.className = clase;
  }

  return celda;
}

// Recibe: la cantidad total de elementos de un listado.
// Hace: calcula cuántas páginas se necesitan. Math.ceil redondea hacia
//       arriba: 14 elementos de a 5 dan 2,8, es decir, 3 páginas.
// Devuelve: el total de páginas (como mínimo 1, aunque no haya elementos).
function calcularTotalPaginas(cantidadElementos) {
  const totalPaginas = Math.ceil(cantidadElementos / ELEMENTOS_POR_PAGINA);

  if (totalPaginas < 1) {
    return 1;
  }

  return totalPaginas;
}

// Recibe: el número de página pedido y la cantidad total de elementos.
// Hace: si el número se sale del rango, lo lleva al límite más cercano:
//       menos de 1 pasa a 1, y más que la última página pasa a la última.
// Devuelve: un número de página válido.
function ajustarNumeroDePagina(numeroPagina, cantidadElementos) {
  const totalPaginas = calcularTotalPaginas(cantidadElementos);

  if (numeroPagina < 1) {
    return 1;
  }

  if (numeroPagina > totalPaginas) {
    return totalPaginas;
  }

  return numeroPagina;
}

// Recibe: el arreglo completo de un listado y un número de página.
// Hace: calcula en qué posición empieza esa página y corta el arreglo.
//       Página 1: posiciones 0 a 4. Página 2: posiciones 5 a 9. Etcétera.
// Devuelve: un arreglo nuevo con los elementos de esa página.
function obtenerElementosDePagina(lista, numeroPagina) {
  const posicionInicial = (numeroPagina - 1) * ELEMENTOS_POR_PAGINA;
  const posicionFinal = posicionInicial + ELEMENTOS_POR_PAGINA;

  // slice copia desde posicionInicial hasta antes de posicionFinal
  return lista.slice(posicionInicial, posicionFinal);
}

// Recibe: el texto del botón, la página a la que lleva, si va
//         deshabilitado, si corresponde a la página actual y la función
//         que se debe llamar al hacer clic.
// Hace: crea un botón de paginación dentro de un <li>. Al hacer clic,
//       llama a la función recibida y le entrega el número de página.
// Devuelve: el <li> creado.
function crearBotonPagina(texto, paginaDestino, estaDeshabilitado, esPaginaActual, funcionAlCambiar) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "panel-paginacion-boton";
  boton.textContent = texto;
  boton.disabled = estaDeshabilitado;

  if (esPaginaActual) {
    boton.classList.add("activa");
    boton.setAttribute("aria-current", "page"); // avisa a los lectores de pantalla
  }

  boton.addEventListener("click", function () {
    funcionAlCambiar(paginaDestino);
  });

  const item = document.createElement("li");
  item.appendChild(boton);
  return item;
}

// Recibe: la página que se está viendo, el total de páginas y la función
//         del listado que muestra una página (por ejemplo mostrarPagina).
// Hace: dibuja los botones "Anterior", uno por cada página y "Siguiente".
//       "Anterior" queda deshabilitado en la primera página y "Siguiente"
//       en la última. Si hay una sola página, no dibuja ningún botón.
// Devuelve: nada.
function mostrarBotonesPaginacion(paginaActual, totalPaginas, funcionAlCambiar) {
  const lista = document.getElementById("botonesPaginacion");
  lista.innerHTML = "";

  if (totalPaginas <= 1) {
    return;
  }

  lista.appendChild(crearBotonPagina("Anterior", paginaActual - 1, paginaActual === 1, false, funcionAlCambiar));

  for (let numero = 1; numero <= totalPaginas; numero++) {
    lista.appendChild(crearBotonPagina(String(numero), numero, false, numero === paginaActual, funcionAlCambiar));
  }

  lista.appendChild(crearBotonPagina("Siguiente", paginaActual + 1, paginaActual === totalPaginas, false, funcionAlCambiar));
}

// Recibe: la página que se está viendo, el total de elementos y el nombre
//         de lo que se lista, en singular y en plural ("producto",
//         "productos").
// Hace: escribe bajo la tabla qué elementos se están viendo, por ejemplo
//       "Mostrando 6 a 10 de 14 productos".
// Devuelve: nada.
function mostrarTextoPaginacion(paginaActual, cantidadElementos, palabraSingular, palabraPlural) {
  const texto = document.getElementById("textoPaginacion");

  if (cantidadElementos === 0) {
    texto.textContent = "";
    return;
  }

  const primero = (paginaActual - 1) * ELEMENTOS_POR_PAGINA + 1;
  let ultimo = paginaActual * ELEMENTOS_POR_PAGINA;

  // En la última página puede haber menos elementos
  if (ultimo > cantidadElementos) {
    ultimo = cantidadElementos;
  }

  let palabra = palabraPlural;
  if (cantidadElementos === 1) {
    palabra = palabraSingular;
  }

  texto.textContent = "Mostrando " + primero + " a " + ultimo + " de " + cantidadElementos + " " + palabra;
}

// ==========================================================
// Estados de las órdenes
// ==========================================================

// Estados que puede tener una orden, en el orden en que avanza una compra
const ESTADOS_DE_ORDEN = ["Pendiente", "En proceso", "Enviada", "Cancelada"];

// Recibe: el estado de una orden ("Pendiente", "En proceso", "Enviada" o
//         "Cancelada").
// Hace: crea una etiqueta con el nombre del estado y un color según cuál
//       sea. El texto siempre está escrito: el color es solo un apoyo.
// Devuelve: la etiqueta creada (un <span>).
function crearEtiquetaEstado(estado) {
  const etiqueta = document.createElement("span");
  etiqueta.textContent = estado;

  // Cada estado tiene su clase CSS (css/admin.css). Un estado desconocido
  // queda con el estilo base, sin color propio.
  let claseEstado = "";
  if (estado === "Pendiente") {
    claseEstado = "estado-pendiente";
  } else if (estado === "En proceso") {
    claseEstado = "estado-proceso";
  } else if (estado === "Enviada") {
    claseEstado = "estado-enviada";
  } else if (estado === "Cancelada") {
    claseEstado = "estado-cancelada";
  }

  etiqueta.className = "etiqueta-estado " + claseEstado;
  return etiqueta;
}

// ==========================================================
// Formularios del panel
// ==========================================================

// Recibe: el id de un campo y la función que lo revisa.
// Hace: deja el campo conectado para revisarse en tiempo real: mientras el
//       usuario escribe o elige ("input") y cuando sale del campo ("blur").
// Devuelve: nada.
function revisarEnTiempoReal(idCampo, funcionRevisar) {
  const campo = document.getElementById(idCampo);
  campo.addEventListener("input", funcionRevisar);
  campo.addEventListener("blur", funcionRevisar);
}

// ==========================================================
// Inicio de cada página del panel
// ==========================================================

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
