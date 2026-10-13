/*
  Archivo: js/admin/productos.js
  Qué es: script propio del listado de productos del panel de administración.
  Quién lo usa: solo admin/productos.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: Administrador y Vendedor.
*/

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
//       categoría, precio y stock. Si el producto tiene stock crítico,
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

  return fila;
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
    celda.colSpan = 5; // la celda ocupa las 5 columnas de la tabla
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

// Recibe: nada.
// Hace: prepara la página. Lo primero es iniciarPanel: si el usuario no
//       puede verla, ya fue redirigido y no se hace nada más. Si puede,
//       lee los productos de localStorage y los muestra.
// Devuelve: nada.
function iniciarProductosAdmin() {
  const puedeVerLaPagina = iniciarPanel(ROLES_ADMIN_Y_VENDEDOR, "productos");

  if (!puedeVerLaPagina) {
    return;
  }

  const productos = leerDeStorage(CLAVE_PRODUCTOS);
  mostrarResumenProductos(productos);
  mostrarTablaProductos(productos);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarProductosAdmin();
