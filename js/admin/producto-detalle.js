/*
  Archivo: js/admin/producto-detalle.js
  Qué es: script propio de la página que muestra un producto en el panel,
          en solo lectura.
  Quién lo usa: solo admin/producto-detalle.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: Administrador y Vendedor. Solo el
          Administrador ve el botón "Editar".

  Cómo funciona: la página se abre con el código en la URL, por ejemplo
  producto-detalle.html?codigo=MOC-001. El script busca ese producto en
  localStorage y escribe sus datos en los elementos de la página.
*/

// Recibe: un producto.
// Hace: escribe sus datos en la lista de la página. Usa textContent, que
//       escribe texto puro. Si la descripción está vacía, lo indica.
// Devuelve: nada.
function mostrarDatosDetalle(producto) {
  document.getElementById("tituloDetalle").textContent = producto.nombre;
  document.title = producto.nombre + " | Panel AndesTrekking";

  document.getElementById("datoCodigo").textContent = producto.codigo;
  document.getElementById("datoNombre").textContent = producto.nombre;
  document.getElementById("datoCategoria").textContent = producto.categoria;
  document.getElementById("datoPrecio").textContent = formatearPrecio(producto.precio);
  document.getElementById("datoStock").textContent = producto.stock;
  document.getElementById("datoStockCritico").textContent = producto.stockCritico;

  let descripcion = producto.descripcion;
  if (descripcion === "") {
    descripcion = "Sin descripción.";
  }
  document.getElementById("datoDescripcion").textContent = descripcion;
}

// Recibe: la ruta de una foto y su texto alternativo.
// Hace: crea la imagen y la agrega al bloque de fotos de la página.
// Devuelve: nada.
function agregarFotoDetalle(ruta, textoAlternativo) {
  const imagen = document.createElement("img");
  imagen.className = "panel-detalle-foto";
  imagen.src = ruta;
  imagen.alt = textoAlternativo;

  document.getElementById("fotosDetalle").appendChild(imagen);
}

// Recibe: un producto.
// Hace: muestra todas sus fotos, una bajo otra. Si no tiene ninguna,
//       muestra la imagen de reemplazo.
// Devuelve: nada.
function mostrarFotosDetalle(producto) {
  if (producto.imagenes.length === 0) {
    agregarFotoDetalle(IMAGEN_DE_REEMPLAZO_PANEL, "Producto sin imagen");
    return;
  }

  producto.imagenes.forEach(function (nombreArchivo, posicion) {
    const textoAlternativo = producto.nombre + ", foto " + (posicion + 1);
    agregarFotoDetalle(CARPETA_IMAGENES_PANEL + nombreArchivo, textoAlternativo);
  });
}

// Recibe: un producto.
// Hace: si su stock es menor o igual al stock crítico, muestra una alerta
//       sobre los datos. Si no, la alerta sigue oculta.
// Devuelve: nada.
function mostrarAlertaStockDetalle(producto) {
  if (producto.stock > producto.stockCritico) {
    return;
  }

  const alerta = document.getElementById("alertaStock");
  alerta.textContent = "Stock crítico: quedan " + producto.stock +
    " unidades y el nivel crítico es " + producto.stockCritico + ".";
  alerta.hidden = false;
}

// Recibe: un producto.
// Hace: si el usuario es Administrador, agrega el botón "Editar", que lleva
//       al formulario con el código del producto. Al Vendedor no se le
//       agrega nada: para él la página es solo de lectura.
// Devuelve: nada.
function mostrarAccionesDetalle(producto) {
  if (obtenerSesion().tipo !== ROL_ADMINISTRADOR) {
    return;
  }

  const enlace = document.createElement("a");
  enlace.className = "btn boton-principal";
  enlace.href = "producto-form.html?codigo=" + encodeURIComponent(producto.codigo);

  const icono = document.createElement("i");
  icono.className = "bi bi-pencil";
  icono.setAttribute("aria-hidden", "true");

  enlace.appendChild(icono);
  enlace.appendChild(document.createTextNode(" Editar"));

  document.getElementById("accionesDetalle").appendChild(enlace);
}

// Recibe: nada.
// Hace: reemplaza el detalle por un aviso cuando el código de la URL no
//       corresponde a ningún producto.
// Devuelve: nada.
function mostrarProductoNoEncontrado() {
  document.getElementById("detalleProducto").remove();
  document.getElementById("tituloDetalle").textContent = "Producto no encontrado";
  document.title = "Producto no encontrado | Panel AndesTrekking";

  mostrarAvisoPanel("El producto que buscas no existe o fue eliminado. Vuelve al listado para elegir otro.");
}

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel; si el usuario puede verla,
//       lee el código de la URL, busca el producto y muestra su detalle o
//       el aviso de que no existe.
// Devuelve: nada.
function iniciarDetalleProductoAdmin() {
  const puedeVerLaPagina = iniciarPanel(ROLES_ADMIN_Y_VENDEDOR, "productos");

  if (!puedeVerLaPagina) {
    return;
  }

  const codigo = obtenerParametroUrl("codigo");

  let producto = null;
  if (codigo !== null) {
    producto = buscarProductoPorCodigo(codigo);
  }

  if (producto === null) {
    mostrarProductoNoEncontrado();
    return;
  }

  mostrarDatosDetalle(producto);
  mostrarFotosDetalle(producto);
  mostrarAlertaStockDetalle(producto);
  mostrarAccionesDetalle(producto);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarDetalleProductoAdmin();
