/*
  Archivo: js/admin/productos.js
  Qué es: script propio del listado de productos del panel de administración.
  Quién lo usa: solo admin/productos.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: Administrador y Vendedor. El Vendedor la ve
          en solo lectura: sin Nuevo, Editar ni Eliminar.

  Paginación: la tabla no muestra todos los productos a la vez, sino de a
  PRODUCTOS_POR_PAGINA. Los botones bajo la tabla cambian de página sin
  recargar: solo se vuelven a dibujar las filas.
*/

// Cantidad de productos que se muestran en cada página de la tabla
const PRODUCTOS_POR_PAGINA = 5;

// Productos que se están listando y página que se está viendo. Se guardan
// en variables fuera de las funciones para que los botones de paginación
// puedan usarlas al hacer clic. Se declaran con let porque cambian.
let productosDelListado = [];
let paginaActual = 1;

// Indica si quien mira la página es Administrador. Se define al iniciar la
// página y decide qué acciones se dibujan: el Vendedor solo puede "Ver".
let usuarioEsAdministrador = false;

// Recibe: un producto.
// Hace: revisa si su stock está en nivel crítico, es decir, si es menor o
//       igual al stock crítico definido para ese producto.
// Devuelve: true si está en nivel crítico; false si no.
function tieneStockCritico(producto) {
  return producto.stock <= producto.stockCritico;
}

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

// Recibe: un producto.
// Hace: crea la fila de la tabla (<tr>) con sus celdas: código, nombre,
//       categoría, precio, stock y acciones. Si tiene stock crítico,
//       resalta la fila y agrega la etiqueta "Stock crítico" junto al
//       número: así el aviso no depende solo del color.
// Devuelve: la fila creada.
function crearFilaProducto(producto) {
  const fila = document.createElement("tr");

  fila.appendChild(crearCelda(producto.codigo));
  fila.appendChild(crearCelda(producto.nombre));
  fila.appendChild(crearCelda(producto.categoria));
  fila.appendChild(crearCelda(formatearPrecio(producto.precio), "celda-numero"));

  const celdaStock = crearCelda(String(producto.stock), "celda-numero");

  if (tieneStockCritico(producto)) {
    fila.classList.add("fila-stock-critico");

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-critico";
    etiqueta.textContent = "Stock crítico";
    celdaStock.appendChild(etiqueta);
  }

  fila.appendChild(celdaStock);
  fila.appendChild(crearCeldaAcciones(producto));

  return fila;
}

// Recibe: el texto del enlace, la página a la que lleva (sin el código),
//         el producto y una clase CSS adicional (puede ser "").
// Hace: crea un enlace de acción de la tabla, con el código del producto en
//       la URL. aria-label agrega el nombre del producto: sin eso, un
//       lector de pantalla leería varios enlaces iguales que dicen "Ver".
// Devuelve: el enlace creado.
function crearEnlaceAccion(texto, pagina, producto, claseExtra) {
  const enlace = document.createElement("a");
  enlace.className = "panel-boton-chico " + claseExtra;
  enlace.href = pagina + "?codigo=" + encodeURIComponent(producto.codigo);
  enlace.textContent = texto;
  enlace.setAttribute("aria-label", texto + " " + producto.nombre);
  return enlace;
}

// Recibe: un producto.
// Hace: crea la celda de acciones de su fila. Todos ven "Ver". Solo el
//       Administrador ve además "Editar" y "Eliminar": para el Vendedor
//       esos elementos no se crean (no basta con ocultarlos).
// Devuelve: la celda creada.
function crearCeldaAcciones(producto) {
  const celda = document.createElement("td");
  celda.className = "celda-acciones";

  celda.appendChild(crearEnlaceAccion("Ver", "producto-detalle.html", producto, ""));

  if (!usuarioEsAdministrador) {
    return celda;
  }

  celda.appendChild(crearEnlaceAccion("Editar", "producto-form.html", producto, ""));

  // Eliminar es un botón porque ejecuta una acción, no lleva a otra página
  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "panel-boton-chico peligro";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.setAttribute("aria-label", "Eliminar " + producto.nombre);
  botonEliminar.addEventListener("click", function () {
    eliminarProducto(producto);
  });
  celda.appendChild(botonEliminar);

  return celda;
}

// Recibe: el producto que se quiere eliminar.
// Hace: pide confirmación y, si el usuario acepta, quita el producto de
//       localStorage y vuelve a dibujar el listado con un aviso.
//       Vuelve a revisar el rol aunque el botón solo se le dibuja al
//       Administrador: una función que borra datos no debe confiar en que
//       nadie la llame desde otro lugar.
// Devuelve: nada.
function eliminarProducto(producto) {
  if (!usuarioEsAdministrador) {
    return;
  }

  const pregunta = "¿Eliminar el producto «" + producto.nombre + "» (" + producto.codigo + ")? " +
    "Esta acción no se puede deshacer.";

  // confirm devuelve true solo si el usuario presiona Aceptar
  if (!confirm(pregunta)) {
    return;
  }

  // Se arma un arreglo nuevo con todos los productos menos el eliminado
  const productosRestantes = [];
  leerDeStorage(CLAVE_PRODUCTOS).forEach(function (otroProducto) {
    if (otroProducto.codigo !== producto.codigo) {
      productosRestantes.push(otroProducto);
    }
  });

  guardarEnStorage(CLAVE_PRODUCTOS, productosRestantes);

  // Se actualiza lo que está en pantalla. mostrarPagina ajusta la página
  // si la última quedó vacía.
  productosDelListado = productosRestantes;
  mostrarResumenProductos(productosDelListado);
  mostrarPagina(paginaActual);
  mostrarAvisoPanel("Se eliminó el producto «" + producto.nombre + "».");
}

// Recibe: nada.
// Hace: si el usuario es Administrador, agrega sobre la tabla el botón
//       "Nuevo producto", que lleva al formulario vacío. Al Vendedor no
//       se le agrega nada.
// Devuelve: nada.
function mostrarBotonNuevoProducto() {
  if (!usuarioEsAdministrador) {
    return;
  }

  const enlace = document.createElement("a");
  enlace.className = "btn boton-principal";
  enlace.href = "producto-form.html";

  const icono = document.createElement("i");
  icono.className = "bi bi-plus-lg";
  icono.setAttribute("aria-hidden", "true");

  enlace.appendChild(icono);
  enlace.appendChild(document.createTextNode(" Nuevo producto"));

  document.getElementById("accionesListado").appendChild(enlace);
}

// Recibe: un arreglo de productos.
// Hace: borra las filas que tuviera la tabla y dibuja una por cada producto.
//       Si el arreglo está vacío, muestra una sola fila con un aviso.
// Devuelve: nada.
function mostrarTablaProductos(productos) {
  const cuerpoTabla = document.getElementById("cuerpoTablaProductos");
  cuerpoTabla.innerHTML = "";

  if (productos.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda("No hay productos registrados.");
    celda.colSpan = 6; // la celda ocupa las 6 columnas de la tabla
    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
    return;
  }

  productos.forEach(function (producto) {
    cuerpoTabla.appendChild(crearFilaProducto(producto));
  });
}

// Recibe: un arreglo de productos.
// Hace: escribe sobre la tabla cuántos productos hay y cuántos de ellos
//       tienen stock crítico.
// Devuelve: nada.
function mostrarResumenProductos(productos) {
  let cantidadCriticos = 0;

  productos.forEach(function (producto) {
    if (tieneStockCritico(producto)) {
      cantidadCriticos = cantidadCriticos + 1;
    }
  });

  const texto = "Productos registrados: " + productos.length + ". Con stock crítico: " + cantidadCriticos + ".";
  document.getElementById("resumenProductos").textContent = texto;
}

// ==========================================================
// Paginación
// ==========================================================

// Recibe: la cantidad total de productos.
// Hace: calcula cuántas páginas se necesitan. Math.ceil redondea hacia
//       arriba: 14 productos de a 5 dan 2,8, es decir, 3 páginas.
// Devuelve: el total de páginas (como mínimo 1, aunque no haya productos).
function calcularTotalPaginas(cantidadProductos) {
  const totalPaginas = Math.ceil(cantidadProductos / PRODUCTOS_POR_PAGINA);

  if (totalPaginas < 1) {
    return 1;
  }

  return totalPaginas;
}

// Recibe: el arreglo completo de productos y un número de página.
// Hace: calcula en qué posición empieza esa página y corta el arreglo.
//       Página 1: posiciones 0 a 4. Página 2: posiciones 5 a 9. Etcétera.
// Devuelve: un arreglo nuevo con los productos de esa página.
function obtenerProductosDePagina(productos, numeroPagina) {
  const posicionInicial = (numeroPagina - 1) * PRODUCTOS_POR_PAGINA;
  const posicionFinal = posicionInicial + PRODUCTOS_POR_PAGINA;

  // slice copia desde posicionInicial hasta antes de posicionFinal
  return productos.slice(posicionInicial, posicionFinal);
}

// Recibe: el texto del botón, la página a la que lleva, si va
//         deshabilitado y si corresponde a la página actual.
// Hace: crea un botón de paginación dentro de un <li>. Al hacer clic,
//       muestra la página indicada.
// Devuelve: el <li> creado.
function crearBotonPagina(texto, paginaDestino, estaDeshabilitado, esPaginaActual) {
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
    mostrarPagina(paginaDestino);
  });

  const item = document.createElement("li");
  item.appendChild(boton);
  return item;
}

// Recibe: el total de páginas.
// Hace: dibuja los botones "Anterior", uno por cada página y "Siguiente".
//       "Anterior" queda deshabilitado en la primera página y "Siguiente"
//       en la última. Si hay una sola página, no dibuja ningún botón.
// Devuelve: nada.
function mostrarBotonesPaginacion(totalPaginas) {
  const lista = document.getElementById("botonesPaginacion");
  lista.innerHTML = "";

  if (totalPaginas <= 1) {
    return;
  }

  lista.appendChild(crearBotonPagina("Anterior", paginaActual - 1, paginaActual === 1, false));

  for (let numero = 1; numero <= totalPaginas; numero++) {
    lista.appendChild(crearBotonPagina(String(numero), numero, false, numero === paginaActual));
  }

  lista.appendChild(crearBotonPagina("Siguiente", paginaActual + 1, paginaActual === totalPaginas, false));
}

// Recibe: el total de productos.
// Hace: escribe bajo la tabla qué productos se están viendo, por ejemplo
//       "Mostrando 6 a 10 de 14 productos".
// Devuelve: nada.
function mostrarTextoPaginacion(cantidadProductos) {
  const texto = document.getElementById("textoPaginacion");

  if (cantidadProductos === 0) {
    texto.textContent = "";
    return;
  }

  const primero = (paginaActual - 1) * PRODUCTOS_POR_PAGINA + 1;
  let ultimo = paginaActual * PRODUCTOS_POR_PAGINA;

  // En la última página puede haber menos de 5 productos
  if (ultimo > cantidadProductos) {
    ultimo = cantidadProductos;
  }

  let palabra = "productos";
  if (cantidadProductos === 1) {
    palabra = "producto";
  }

  texto.textContent = "Mostrando " + primero + " a " + ultimo + " de " + cantidadProductos + " " + palabra;
}

// Recibe: el número de la página que se quiere ver.
// Hace: muestra esa página de productosDelListado: actualiza la tabla, el
//       texto y los botones. Si el número se sale del rango (menor que 1 o
//       mayor que la última página), lo ajusta al límite más cercano.
// Devuelve: nada.
function mostrarPagina(numeroPagina) {
  const totalPaginas = calcularTotalPaginas(productosDelListado.length);

  paginaActual = numeroPagina;
  if (paginaActual < 1) {
    paginaActual = 1;
  }
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  mostrarTablaProductos(obtenerProductosDePagina(productosDelListado, paginaActual));
  mostrarTextoPaginacion(productosDelListado.length);
  mostrarBotonesPaginacion(totalPaginas);
}

// ==========================================================
// Inicio de la página
// ==========================================================

// Recibe: nada.
// Hace: prepara la página. Lo primero es iniciarPanel: si el usuario no
//       puede verla, ya fue redirigido y no se hace nada más. Si puede,
//       lee los productos de localStorage, muestra el resumen (que cuenta
//       todos los productos) y la primera página de la tabla.
// Devuelve: nada.
function iniciarProductosAdmin() {
  const puedeVerLaPagina = iniciarPanel(ROLES_ADMIN_Y_VENDEDOR, "productos");

  if (!puedeVerLaPagina) {
    return;
  }

  // El rol se revisa una vez y se recuerda para dibujar las acciones
  usuarioEsAdministrador = obtenerSesion().tipo === ROL_ADMINISTRADOR;

  productosDelListado = leerDeStorage(CLAVE_PRODUCTOS);
  mostrarBotonNuevoProducto();
  mostrarResumenProductos(productosDelListado);
  mostrarPagina(1);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarProductosAdmin();
