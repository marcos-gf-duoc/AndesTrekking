/*
  Archivo: js/tienda/tienda-comun.js
  Qué es: funciones compartidas por las páginas de la tienda pública.
          Arma las tarjetas de producto y maneja la newsletter del footer;
          más adelante tendrá también el contador del carrito y los
          enlaces de sesión.
  Quién lo usa: todas las páginas de la tienda (todas tienen el footer).
  Orden de carga: va DESPUÉS de los archivos de js/core/ (usa storage.js,
          utils.js y validaciones.js) y ANTES del script propio de cada
          página.
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

// ==========================================================
// Newsletter del footer
// El formulario está escrito en el footer de cada página.
// ==========================================================

// Recibe: nada.
// Hace: valida el correo escrito en la newsletter y muestra el resultado en
//       el campo (rojo con mensaje, o verde).
// Devuelve: true si el correo es válido; false si tiene error.
function validarCampoNewsletter() {
  const campo = document.getElementById("correoNewsletter");
  const mensajeError = validarCorreo(campo.value, true); // true: es obligatorio
  return mostrarResultadoCampo("correoNewsletter", mensajeError);
}

// Recibe: nada.
// Hace: revisa el campo mientras el usuario escribe o cuando sale de él.
//       Si el campo está vacío, solo quita las marcas: así no aparece un
//       error por pasar con la tecla Tab sin querer suscribirse. El aviso
//       de campo obligatorio aparece recién al presionar "Suscribirme".
// Devuelve: nada.
function revisarNewsletterAlEscribir() {
  const campo = document.getElementById("correoNewsletter");

  // Al cambiar el correo, el mensaje de la suscripción anterior ya no aplica
  document.getElementById("mensajeNewsletter").textContent = "";

  if (campo.value.trim() === "") {
    limpiarEstadoCampo("correoNewsletter");
    return;
  }

  validarCampoNewsletter();
}

// Recibe: un correo ya validado.
// Hace: lo agrega a la lista de suscriptores de localStorage, salvo que ya
//       esté en la lista.
// Devuelve: true si lo agregó; false si ya estaba suscrito.
function guardarSuscriptor(correo) {
  const suscriptores = leerDeStorage(CLAVE_SUSCRIPTORES);

  // indexOf devuelve -1 cuando el correo no está en el arreglo
  if (suscriptores.indexOf(correo) !== -1) {
    return false;
  }

  suscriptores.push(correo);
  guardarEnStorage(CLAVE_SUSCRIPTORES, suscriptores);
  return true;
}

// Recibe: el evento "submit" del formulario de la newsletter.
// Hace: detiene el envío normal del formulario (que recargaría la página),
//       valida el correo y, si es válido, lo guarda y muestra un mensaje.
// Devuelve: nada.
function enviarNewsletter(evento) {
  evento.preventDefault();

  const campo = document.getElementById("correoNewsletter");
  const mensaje = document.getElementById("mensajeNewsletter");

  if (!validarCampoNewsletter()) {
    mensaje.textContent = "";
    enfocarPrimerCampoConError("formularioNewsletter");
    return;
  }

  // Se guarda sin espacios y en minúsculas, para que "Ana@gmail.com" y
  // "ana@gmail.com" cuenten como el mismo correo
  const correo = campo.value.trim().toLowerCase();
  const seAgrego = guardarSuscriptor(correo);

  if (seAgrego) {
    mensaje.textContent = "¡Gracias! Te suscribiste con " + correo + ".";
  } else {
    mensaje.textContent = "El correo " + correo + " ya estaba suscrito.";
  }

  // Deja el formulario listo para otro correo
  campo.value = "";
  limpiarEstadoCampo("correoNewsletter");
}

// Recibe: nada.
// Hace: conecta el formulario de la newsletter con sus funciones:
//       "submit" al presionar el botón o Enter, "input" al escribir y
//       "blur" al salir del campo.
// Devuelve: nada.
function iniciarNewsletter() {
  const formulario = document.getElementById("formularioNewsletter");

  // Si una página no tuviera el formulario, no hay nada que conectar
  if (formulario === null) {
    return;
  }

  const campo = document.getElementById("correoNewsletter");

  formulario.addEventListener("submit", enviarNewsletter);
  campo.addEventListener("input", revisarNewsletterAlEscribir);
  campo.addEventListener("blur", revisarNewsletterAlEscribir);
}

// Se ejecuta al cargar el archivo, en todas las páginas de la tienda
iniciarNewsletter();
