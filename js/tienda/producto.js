/*
  Archivo: js/tienda/producto.js
  Qué es: script propio de la página de detalle de un producto.
  Quién lo usa: solo producto.html.
  Orden de carga: va al final, DESPUÉS de js/tienda/tienda-comun.js.

  Cómo funciona: la página se abre con el código del producto en la URL,
  por ejemplo producto.html?codigo=MOC-001. El script lee ese código, busca
  el producto en localStorage y escribe sus datos en los elementos de
  producto.html. Si el código no existe, muestra un aviso.
*/

// Recibe: un producto.
// Hace: completa la ruta de navegación "Inicio > Categoría > Producto".
//       La categoría enlaza al listado filtrado por esa categoría.
// Devuelve: nada.
function mostrarRutaNavegacion(producto) {
  const enlaceCategoria = document.getElementById("rutaCategoria");
  enlaceCategoria.textContent = producto.categoria;
  enlaceCategoria.href = "productos.html?categoria=" + encodeURIComponent(producto.categoria);

  document.getElementById("rutaProducto").textContent = producto.nombre;
}

// Recibe: un producto.
// Hace: escribe la categoría, el nombre, el precio y la descripción, y pone
//       el nombre en el título de la pestaña del navegador.
//       Usa textContent, que escribe texto puro: aunque el nombre tuviera
//       símbolos de HTML, se mostrarían como texto.
// Devuelve: nada.
function mostrarDatosProducto(producto) {
  document.getElementById("categoriaProducto").textContent = producto.categoria;
  document.getElementById("nombreProducto").textContent = producto.nombre;
  document.getElementById("precioProducto").textContent = formatearPrecio(producto.precio);
  document.getElementById("descripcionProducto").textContent = producto.descripcion;

  document.title = producto.nombre + " | AndesTrekking";
}

// Recibe: la ruta de una foto y el botón de la miniatura que se eligió.
// Hace: pone esa foto como imagen principal y marca su miniatura como activa,
//       quitándole la marca a las demás.
// Devuelve: nada.
function cambiarImagenPrincipal(rutaFoto, botonElegido) {
  document.getElementById("imagenPrincipal").src = rutaFoto;

  const botones = document.querySelectorAll(".detalle-miniatura");
  botones.forEach(function (boton) {
    boton.classList.remove("activa");
  });
  botonElegido.classList.add("activa");
}

// Recibe: un producto.
// Hace: muestra la foto principal. Si el producto tiene más de una foto,
//       crea además una miniatura por cada foto; al hacer clic en una
//       miniatura, esa foto pasa a ser la principal.
// Devuelve: nada.
function mostrarImagenes(producto) {
  const imagenPrincipal = document.getElementById("imagenPrincipal");
  imagenPrincipal.src = obtenerRutaImagen(producto); // primera foto o imagen de reemplazo
  imagenPrincipal.alt = producto.nombre;

  // Con una sola foto (o ninguna) no se muestran miniaturas
  if (producto.imagenes.length <= 1) {
    return;
  }

  const contenedor = document.getElementById("miniaturas");

  producto.imagenes.forEach(function (nombreArchivo, posicion) {
    const rutaFoto = CARPETA_IMAGENES_PRODUCTOS + nombreArchivo;

    // Cada miniatura es un botón con una imagen dentro, para que también
    // se pueda usar con el teclado
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "detalle-miniatura";
    boton.setAttribute("aria-label", "Ver foto " + (posicion + 1) + " de " + producto.imagenes.length);

    const imagen = document.createElement("img");
    imagen.src = rutaFoto;
    imagen.alt = ""; // vacío: el botón ya tiene su texto en aria-label

    boton.appendChild(imagen);

    // La primera miniatura parte marcada, porque es la foto que se está viendo
    if (posicion === 0) {
      boton.classList.add("activa");
    }

    boton.addEventListener("click", function () {
      cambiarImagenPrincipal(rutaFoto, boton);
    });

    contenedor.appendChild(boton);
  });
}

// Recibe: un producto.
// Hace: ajusta el selector de cantidad y el botón según el stock.
//       Sin stock: el botón dice "Agotado" y ambos quedan deshabilitados.
//       Con stock: la cantidad máxima que acepta el selector es el stock.
//       El botón todavía no añade al carrito: eso se programa en la rama
//       del carrito, que usará el código guardado en data-codigo.
// Devuelve: nada.
function prepararCompra(producto) {
  const campoCantidad = document.getElementById("cantidadProducto");
  const boton = document.getElementById("botonAnadir");

  boton.dataset.codigo = producto.codigo;

  if (producto.stock === 0) {
    boton.textContent = "Agotado";
    boton.disabled = true;
    campoCantidad.disabled = true;
    return;
  }

  campoCantidad.max = producto.stock;
}

// Cantidad máxima de productos relacionados que se muestran
const MAXIMO_RELACIONADOS = 4;

// Recibe: el producto que se está viendo.
// Hace: recorre todos los productos y junta los que son de la misma
//       categoría, sin incluir el producto que se está viendo. Se detiene
//       al completar MAXIMO_RELACIONADOS.
// Devuelve: un arreglo con los productos relacionados (puede estar vacío).
function obtenerProductosRelacionados(producto) {
  const todosLosProductos = leerDeStorage(CLAVE_PRODUCTOS);
  const relacionados = [];

  for (let i = 0; i < todosLosProductos.length; i++) {
    const candidato = todosLosProductos[i];
    const esMismaCategoria = candidato.categoria === producto.categoria;
    const esOtroProducto = candidato.codigo !== producto.codigo;

    if (esMismaCategoria && esOtroProducto) {
      relacionados.push(candidato);
    }

    // Con el máximo completo no hace falta seguir recorriendo
    if (relacionados.length === MAXIMO_RELACIONADOS) {
      break;
    }
  }

  return relacionados;
}

// Recibe: el producto que se está viendo.
// Hace: dibuja las tarjetas de sus productos relacionados. Si no hay
//       ninguno, quita la sección completa para no dejar un título solo.
// Devuelve: nada.
function mostrarRelacionados(producto) {
  const relacionados = obtenerProductosRelacionados(producto);

  if (relacionados.length === 0) {
    document.getElementById("seccionRelacionados").remove();
    return;
  }

  mostrarTarjetasProductos(relacionados, "grillaRelacionados");
}

// Recibe: nada.
// Hace: reemplaza el detalle por un aviso de "producto no encontrado", con
//       un enlace para volver al listado. Quita la ruta de navegación, el
//       bloque del detalle y la sección de relacionados, que quedarían vacíos.
// Devuelve: nada.
function mostrarAvisoNoEncontrado() {
  document.getElementById("rutaNavegacion").remove();
  document.getElementById("detalleProducto").remove();
  document.getElementById("seccionRelacionados").remove();

  // Este HTML es fijo (no incluye datos escritos por usuarios)
  let html = "";
  html += "<h1>Producto no encontrado</h1>";
  html += "<p>El producto que buscas no existe o ya no está disponible.</p>";
  html += '<a class="btn boton-principal" href="productos.html">Ver todos los productos</a>';

  document.getElementById("avisoNoEncontrado").innerHTML = html;
  document.title = "Producto no encontrado | AndesTrekking";
}

// Recibe: nada.
// Hace: coordina la página: lee el código de la URL, busca el producto y
//       muestra su detalle, o el aviso si no existe.
// Devuelve: nada.
function iniciarProducto() {
  const codigo = obtenerParametroUrl("codigo");

  // Si la URL no trae código, no hay nada que buscar
  let producto = null;
  if (codigo !== null) {
    producto = buscarProductoPorCodigo(codigo);
  }

  if (producto === null) {
    mostrarAvisoNoEncontrado();
    return;
  }

  mostrarRutaNavegacion(producto);
  mostrarDatosProducto(producto);
  mostrarImagenes(producto);
  prepararCompra(producto);
  mostrarRelacionados(producto);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarProducto();
