/*
  Archivo: js/admin/productos.js
  Qué es: script propio del listado de productos del panel de administración.
  Quién lo usa: solo admin/productos.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: Administrador y Vendedor. El Vendedor la ve
          en solo lectura: sin Nuevo, Editar ni Eliminar.

  Paginación: la tabla no muestra todos los productos a la vez, sino de a
  ELEMENTOS_POR_PAGINA. Los botones bajo la tabla cambian de página sin
  recargar: solo se vuelven a dibujar las filas. Las funciones generales
  de paginación están en admin-comun.js, porque también las usan los
  listados de usuarios y de órdenes.
*/

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

// Recibe: el número de la página que se quiere ver.
// Hace: muestra esa página de productosDelListado: actualiza la tabla, el
//       texto y los botones, con las funciones de paginación de
//       admin-comun.js. Si el número se sale del rango, se ajusta al
//       límite más cercano.
//       Esta misma función se entrega a los botones, para que la llamen
//       al hacer clic.
// Devuelve: nada.
function mostrarPagina(numeroPagina) {
  const cantidad = productosDelListado.length;

  paginaActual = ajustarNumeroDePagina(numeroPagina, cantidad);

  mostrarTablaProductos(obtenerElementosDePagina(productosDelListado, paginaActual));
  mostrarTextoPaginacion(paginaActual, cantidad, "producto", "productos");
  mostrarBotonesPaginacion(paginaActual, calcularTotalPaginas(cantidad), mostrarPagina);
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
