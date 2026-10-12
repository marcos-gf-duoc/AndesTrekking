/*
  Archivo: js/tienda/tienda-comun.js
  Qué es: funciones compartidas por las páginas de la tienda pública.
          Por ahora arma las tarjetas de producto; más adelante tendrá también
          el contador del carrito, los enlaces de sesión y la newsletter.
  Quién lo usa: index.html, productos.html y producto.html.
  Orden de carga: va DESPUÉS de js/core/utils.js, porque usa formatearPrecio
          y escaparHtml, y ANTES del script propio de cada página.
*/

// Carpetas de las imágenes, escritas una sola vez. Las rutas son relativas
// a las páginas de la tienda, que están en la raíz del proyecto.
const CARPETA_IMAGENES_PRODUCTOS = "assets/img/productos/";
const IMAGEN_DE_REEMPLAZO = "assets/img/general/placeholder.webp";

// Recibe: un producto.
// Hace: busca su foto principal, que es la primera del arreglo "imagenes".
// Devuelve: la ruta de la foto, o la ruta de la imagen de reemplazo si el
//           producto no tiene fotos.
function obtenerRutaImagen(producto) {
  if (producto.imagenes.length === 0) {
    return IMAGEN_DE_REEMPLAZO;
  }

  return CARPETA_IMAGENES_PRODUCTOS + producto.imagenes[0];
}

// Recibe: el código de un producto (por ejemplo "MOC-001").
// Hace: lo busca entre los productos guardados en localStorage.
// Devuelve: el producto encontrado, o null si ningún producto tiene ese código.
function buscarProductoPorCodigo(codigo) {
  const productos = leerDeStorage(CLAVE_PRODUCTOS);

  for (let i = 0; i < productos.length; i++) {
    if (productos[i].codigo === codigo) {
      return productos[i];
    }
  }

  return null;
}

// Recibe: un producto.
// Hace: arma el HTML de su tarjeta: foto, nombre, precio y botón.
//       La foto y el nombre son un enlace al detalle del producto.
//       Si el producto no tiene stock, el botón dice "Agotado" y queda
//       deshabilitado.
// Devuelve: un texto con el HTML de la tarjeta.
function crearTarjetaProducto(producto) {
  // Los textos se pasan por escaparHtml porque el administrador puede
  // escribir cualquier cosa en el nombre o el código de un producto
  const nombre = escaparHtml(producto.nombre);
  const codigo = escaparHtml(producto.codigo);
  const rutaImagen = escaparHtml(obtenerRutaImagen(producto));
  const precio = formatearPrecio(producto.precio);

  // encodeURIComponent prepara el código para viajar en una URL
  // (por ejemplo, cambia los espacios por %20)
  const enlaceDetalle = "producto.html?codigo=" + encodeURIComponent(producto.codigo);

  // El botón cambia según el stock
  let textoBoton = "Añadir";
  let atributoDeshabilitado = "";
  if (producto.stock === 0) {
    textoBoton = "Agotado";
    atributoDeshabilitado = " disabled";
  }

  // data-codigo guarda el código en el botón: así, al hacer clic, el carrito
  // sabrá qué producto añadir (se programa en la rama del carrito)
  let html = "";
  html += '<article class="tarjeta-producto">';
  html += '  <a class="tarjeta-producto-enlace" href="' + enlaceDetalle + '">';
  html += '    <img class="tarjeta-producto-imagen" src="' + rutaImagen + '" alt="' + nombre + '" loading="lazy">';
  html += '    <h3 class="tarjeta-producto-nombre">' + nombre + "</h3>";
  html += "  </a>";
  html += '  <p class="tarjeta-producto-precio">' + precio + "</p>";
  html += '  <button type="button" class="btn boton-principal boton-anadir" data-codigo="' + codigo + '"' + atributoDeshabilitado + ">";
  html += textoBoton;
  html += "</button>";
  html += "</article>";

  return html;
}

// Recibe: un arreglo de productos y el id del elemento donde se mostrarán.
//         Ese elemento debe tener la clase "row" de Bootstrap.
// Hace: arma una tarjeta por producto, cada una dentro de una columna, y las
//       pone en el contenedor. Reemplaza lo que el contenedor tuviera antes.
//       Si el arreglo está vacío, muestra un aviso.
// Devuelve: nada.
function mostrarTarjetasProductos(listaProductos, idContenedor) {
  const contenedor = document.getElementById(idContenedor);

  if (listaProductos.length === 0) {
    contenedor.innerHTML = '<p class="col-12">No hay productos para mostrar.</p>';
    return;
  }

  // Columnas: 1 tarjeta por fila en el celular, 2 en pantallas chicas,
  // 3 en medianas y 4 en grandes
  let html = "";
  listaProductos.forEach(function (producto) {
    html += '<div class="col-12 col-sm-6 col-md-4 col-lg-3">';
    html += crearTarjetaProducto(producto);
    html += "</div>";
  });

  contenedor.innerHTML = html;
}
