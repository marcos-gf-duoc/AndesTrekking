/*
  Archivo: js/tienda/productos.js
  Qué es: script propio del listado de productos de la tienda.
  Quién lo usa: solo productos.html.
  Orden de carga: va al final, DESPUÉS de js/tienda/tienda-comun.js.

  Cómo funciona el filtro: cada botón de categoría es un enlace a esta misma
  página con un parámetro en la URL, por ejemplo productos.html?categoria=Calzado.
  Al cargar, el script lee ese parámetro y muestra solo esa categoría.
  Sin parámetro, muestra todos los productos.
*/

// Recibe: nada.
// Hace: lee el parámetro "categoria" de la URL y revisa que sea una de las
//       categorías de la tienda (CATEGORIAS, de js/data/productos.js).
// Devuelve: el nombre de la categoría, o null si no hay parámetro o si su
//           valor no es una categoría válida (en ese caso se muestran todas).
function obtenerCategoriaSeleccionada() {
  const categoriaUrl = obtenerParametroUrl("categoria");

  // indexOf devuelve -1 cuando el texto no está en el arreglo
  if (categoriaUrl === null || CATEGORIAS.indexOf(categoriaUrl) === -1) {
    return null;
  }

  return categoriaUrl;
}

// Recibe: un arreglo de productos y el nombre de una categoría (o null).
// Hace: deja solo los productos de esa categoría.
// Devuelve: un arreglo nuevo con los productos que coinciden. Si la categoría
//           es null, devuelve todos los productos.
function filtrarPorCategoria(productos, categoria) {
  if (categoria === null) {
    return productos;
  }

  const productosFiltrados = [];
  productos.forEach(function (producto) {
    if (producto.categoria === categoria) {
      productosFiltrados.push(producto);
    }
  });

  return productosFiltrados;
}

// Recibe: el texto del botón, la dirección a la que lleva y si es el activo.
// Hace: arma el HTML de un botón del filtro. El botón activo lleva la clase
//       "activo" (para el color) y aria-current (para los lectores de pantalla).
// Devuelve: un texto con el HTML del enlace.
function crearBotonFiltro(texto, direccion, estaActivo) {
  let clases = "filtro-categoria";
  let atributoActual = "";
  if (estaActivo) {
    clases += " activo";
    atributoActual = ' aria-current="true"';
  }

  return '<a class="' + clases + '" href="' + direccion + '"' + atributoActual + ">" + escaparHtml(texto) + "</a>";
}

// Recibe: la categoría seleccionada (o null si se muestran todas).
// Hace: dibuja la fila de botones del filtro: "Todas" y uno por categoría.
// Devuelve: nada.
function mostrarFiltroCategorias(categoriaSeleccionada) {
  let html = crearBotonFiltro("Todas", "productos.html", categoriaSeleccionada === null);

  CATEGORIAS.forEach(function (categoria) {
    // encodeURIComponent prepara el nombre para la URL: los espacios y las
    // tildes de "Ropa Técnica" se convierten en códigos seguros
    const direccion = "productos.html?categoria=" + encodeURIComponent(categoria);
    html += crearBotonFiltro(categoria, direccion, categoria === categoriaSeleccionada);
  });

  document.getElementById("filtroCategorias").innerHTML = html;
}

// Recibe: la categoría seleccionada (o null) y la cantidad de productos.
// Hace: escribe el subtítulo sobre la grilla, por ejemplo
//       "Calzado (3 productos)" o "Todas las categorías (14 productos)".
// Devuelve: nada.
function mostrarResumen(categoriaSeleccionada, cantidad) {
  let nombre = "Todas las categorías";
  if (categoriaSeleccionada !== null) {
    nombre = categoriaSeleccionada;
  }

  let palabra = "productos";
  if (cantidad === 1) {
    palabra = "producto";
  }

  // textContent escribe texto puro, así que no hace falta escaparHtml
  document.getElementById("resumenProductos").textContent = nombre + " (" + cantidad + " " + palabra + ")";
}

// Recibe: nada.
// Hace: coordina la página: averigua la categoría, dibuja el filtro, filtra
//       los productos guardados en localStorage y muestra sus tarjetas.
// Devuelve: nada.
function iniciarProductos() {
  const categoriaSeleccionada = obtenerCategoriaSeleccionada();
  const todosLosProductos = leerDeStorage(CLAVE_PRODUCTOS);
  const productosAMostrar = filtrarPorCategoria(todosLosProductos, categoriaSeleccionada);

  mostrarFiltroCategorias(categoriaSeleccionada);
  mostrarResumen(categoriaSeleccionada, productosAMostrar.length);
  mostrarTarjetasProductos(productosAMostrar, "grillaProductos");
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarProductos();
