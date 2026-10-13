/*
  Archivo: js/admin/ordenes.js
  Qué es: script propio del listado de órdenes del panel de administración.
  Quién lo usa: solo admin/ordenes.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: Administrador y Vendedor.

  La tabla usa las funciones generales de tablas y paginación de
  admin-comun.js. Muestra primero las órdenes más recientes.
*/

// Órdenes que se están listando y página que se está viendo. Se guardan
// en variables fuera de las funciones para que los botones de paginación
// puedan usarlas al hacer clic. Se declaran con let porque cambian.
let ordenesDelListado = [];
let paginaActual = 1;

// Recibe: el arreglo de órdenes tal como está guardado.
// Hace: arma una copia con el orden invertido. Las órdenes se guardan en el
//       orden en que se crean (la más nueva al final), así que al invertir
//       la lista queda primero la más reciente.
// Devuelve: un arreglo nuevo; el original no se modifica.
function ordenarPorMasRecientes(ordenes) {
  // slice() sin argumentos crea una copia; reverse() invierte esa copia
  return ordenes.slice().reverse();
}

// Recibe: una orden.
// Hace: crea la celda de acciones de su fila, con el enlace "Ver". El id de
//       la orden viaja en la URL. aria-label agrega el número de la orden,
//       para que un lector de pantalla no lea varios enlaces iguales.
// Devuelve: la celda creada.
function crearCeldaAccionesOrden(orden) {
  const celda = document.createElement("td");
  celda.className = "celda-acciones";

  const enlace = document.createElement("a");
  enlace.className = "panel-boton-chico";
  enlace.href = "orden-detalle.html?id=" + encodeURIComponent(orden.id);
  enlace.textContent = "Ver";
  enlace.setAttribute("aria-label", "Ver la orden " + orden.id);

  celda.appendChild(enlace);
  return celda;
}

// Recibe: una orden.
// Hace: crea la fila de la tabla (<tr>) con sus celdas: fecha (mostrada como
//       DD-MM-AAAA), número de orden, cliente, estado (como etiqueta de
//       color), total y acciones.
// Devuelve: la fila creada.
function crearFilaOrden(orden) {
  const fila = document.createElement("tr");

  fila.appendChild(crearCelda(formatearFecha(orden.fecha)));
  fila.appendChild(crearCelda(orden.id));
  fila.appendChild(crearCelda(orden.nombreCliente));

  const celdaEstado = document.createElement("td");
  celdaEstado.appendChild(crearEtiquetaEstado(orden.estado));
  fila.appendChild(celdaEstado);

  fila.appendChild(crearCelda(formatearMonto(orden.total), "celda-numero"));
  fila.appendChild(crearCeldaAccionesOrden(orden));

  return fila;
}

// Recibe: un arreglo de órdenes.
// Hace: borra las filas que tuviera la tabla y dibuja una por cada orden.
//       Si el arreglo está vacío, muestra una sola fila con un aviso.
// Devuelve: nada.
function mostrarTablaOrdenes(ordenes) {
  const cuerpoTabla = document.getElementById("cuerpoTablaOrdenes");
  cuerpoTabla.innerHTML = "";

  if (ordenes.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda("No hay órdenes registradas.");
    celda.colSpan = 6; // la celda ocupa las 6 columnas de la tabla
    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
    return;
  }

  ordenes.forEach(function (orden) {
    cuerpoTabla.appendChild(crearFilaOrden(orden));
  });
}

// Recibe: un arreglo de órdenes.
// Hace: escribe sobre la tabla cuántas órdenes hay y cuántas de ellas están
//       pendientes, que son las que requieren atención.
// Devuelve: nada.
function mostrarResumenOrdenes(ordenes) {
  let cantidadPendientes = 0;

  ordenes.forEach(function (orden) {
    if (orden.estado === "Pendiente") {
      cantidadPendientes = cantidadPendientes + 1;
    }
  });

  const texto = "Órdenes registradas: " + ordenes.length + ". Pendientes: " + cantidadPendientes + ".";
  document.getElementById("resumenOrdenes").textContent = texto;
}

// Recibe: el número de la página que se quiere ver.
// Hace: muestra esa página de ordenesDelListado: actualiza la tabla, el
//       texto y los botones, con las funciones de paginación de
//       admin-comun.js. Esta misma función se entrega a los botones, para
//       que la llamen al hacer clic.
// Devuelve: nada.
function mostrarPagina(numeroPagina) {
  const cantidad = ordenesDelListado.length;

  paginaActual = ajustarNumeroDePagina(numeroPagina, cantidad);

  mostrarTablaOrdenes(obtenerElementosDePagina(ordenesDelListado, paginaActual));
  mostrarTextoPaginacion(paginaActual, cantidad, "orden", "órdenes");
  mostrarBotonesPaginacion(paginaActual, calcularTotalPaginas(cantidad), mostrarPagina);
}

// Recibe: nada.
// Hace: prepara la página. Lo primero es iniciarPanel: si el usuario no
//       puede verla, ya fue redirigido y no se hace nada más. Si puede,
//       lee las órdenes de localStorage, las ordena y muestra el resumen
//       y la primera página.
// Devuelve: nada.
function iniciarOrdenesAdmin() {
  const puedeVerLaPagina = iniciarPanel(ROLES_ADMIN_Y_VENDEDOR, "ordenes");

  if (!puedeVerLaPagina) {
    return;
  }

  ordenesDelListado = ordenarPorMasRecientes(leerDeStorage(CLAVE_ORDENES));
  mostrarResumenOrdenes(ordenesDelListado);
  mostrarPagina(1);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarOrdenesAdmin();
