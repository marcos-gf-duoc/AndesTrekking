/*
  Archivo: js/tienda/tienda-comun.js
  Qué es: funciones compartidas por las páginas de la tienda pública.
          Arma las tarjetas de producto, maneja la newsletter del footer,
          muestra la sesión en el header y los avisos que llegan por la
          URL, y tiene la lógica del carrito de compras.
  Quién lo usa: todas las páginas de la tienda (todas tienen el header
          y el footer).
  Orden de carga: va DESPUÉS de los archivos de js/core/ (usa storage.js,
          utils.js, validaciones.js y auth.js) y ANTES del script propio
          de cada página.
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

// ==========================================================
// Sesión en el header
// El header de cada página trae escritos "Iniciar sesión" y "Registrarse".
// Si hay una sesión iniciada, se reemplazan por el saludo, el acceso al
// panel (solo Administrador y Vendedor) y "Cerrar sesión".
// Usa obtenerSesion y cerrarSesion, de js/core/auth.js.
// ==========================================================

// Recibe: un elemento ya creado (un texto, un enlace o un botón).
// Hace: lo envuelve en un <li class="nav-item"> y lo agrega al final del
//       menú de sesión del header.
// Devuelve: nada.
function agregarItemAlMenuSesion(elemento) {
  const item = document.createElement("li");
  item.className = "nav-item";
  item.appendChild(elemento);

  document.getElementById("menuSesion").appendChild(item);
}

// Recibe: nada.
// Hace: cierra la sesión y vuelve al inicio de la tienda. El carrito se
//       conserva, porque no depende del usuario.
// Devuelve: nada.
function cerrarSesionDesdeTienda() {
  cerrarSesion();
  irAPagina("index.html");
}

// Recibe: nada.
// Hace: adapta el header según la sesión. Sin sesión no cambia nada.
//       Con sesión:
//       1. quita "Iniciar sesión" y "Registrarse";
//       2. agrega "Hola, {nombre}";
//       3. agrega "Panel" si el usuario es Administrador o Vendedor;
//       4. agrega el botón "Cerrar sesión".
// Devuelve: nada.
function mostrarSesionEnHeader() {
  const sesion = obtenerSesion();

  if (sesion === null) {
    return;
  }

  document.getElementById("itemIniciarSesion").remove();
  document.getElementById("itemRegistrarse").remove();

  // Saludo. Se escribe con textContent: el nombre se muestra como texto
  const saludo = document.createElement("span");
  saludo.className = "navbar-text encabezado-saludo";
  saludo.textContent = "Hola, " + sesion.nombre;
  agregarItemAlMenuSesion(saludo);

  // Acceso al panel de administración, solo para quienes pueden entrar
  if (sesion.tipo === ROL_ADMINISTRADOR || sesion.tipo === ROL_VENDEDOR) {
    const enlacePanel = document.createElement("a");
    enlacePanel.className = "nav-link";
    enlacePanel.href = "admin/index.html";
    enlacePanel.textContent = "Panel";
    agregarItemAlMenuSesion(enlacePanel);
  }

  // "Cerrar sesión" es un botón y no un enlace, porque no lleva a otra
  // página: ejecuta una acción. La clase nav-link le da el mismo aspecto
  // que los enlaces del menú.
  const botonCerrar = document.createElement("button");
  botonCerrar.type = "button";
  botonCerrar.className = "nav-link";
  botonCerrar.textContent = "Cerrar sesión";
  botonCerrar.addEventListener("click", cerrarSesionDesdeTienda);
  agregarItemAlMenuSesion(botonCerrar);
}

// Se ejecuta al cargar el archivo, en todas las páginas de la tienda
mostrarSesionEnHeader();

// ==========================================================
// Avisos que llegan por la URL
// Cuando una página redirige a otra, puede dejarle un aviso con un código
// en la URL, por ejemplo index.html?aviso=permisos. La URL lleva solo el
// código; el texto que se muestra está escrito aquí. Así nadie puede hacer
// aparecer un texto cualquiera en el sitio cambiando la dirección.
// ==========================================================

// Texto de cada aviso, según su código
const TEXTOS_DE_AVISOS = {
  sesion: "Debes iniciar sesión para continuar.",
  permisos: "No tienes permisos para entrar a esa página.",
  restablecido: "Los datos de demostración se restablecieron. Inicia sesión de nuevo."
};

// Recibe: nada.
// Hace: lee el parámetro "aviso" de la URL. Si es un código conocido,
//       crea una caja con su texto y la pone al comienzo del <main>.
//       Si no hay parámetro, o el código no existe, no hace nada.
// Devuelve: nada.
function mostrarAvisoDeUrl() {
  const codigo = obtenerParametroUrl("aviso");

  if (codigo === null) {
    return;
  }

  const texto = TEXTOS_DE_AVISOS[codigo];

  // Con un código desconocido, texto no es un string: se ignora
  if (typeof texto !== "string") {
    return;
  }

  const caja = document.createElement("p");
  caja.className = "mensaje-aviso";
  caja.setAttribute("role", "status"); // los lectores de pantalla lo anuncian
  caja.textContent = texto;

  // prepend agrega la caja como primer elemento del <main>
  document.querySelector("main").prepend(caja);
}

// Se ejecuta al cargar el archivo, en todas las páginas de la tienda
mostrarAvisoDeUrl();

// ==========================================================
// Carrito de compras
// El carrito se guarda en localStorage (clave at_carrito) como un arreglo
// de objetos { codigo, cantidad }. Solo guarda el código: el nombre, el
// precio y el stock se leen siempre del producto, para que estén al día.
// ==========================================================

// Recibe: nada.
// Hace: lee el carrito guardado en localStorage.
// Devuelve: un arreglo de { codigo, cantidad } (vacío si no hay productos).
function leerCarrito() {
  return leerDeStorage(CLAVE_CARRITO);
}

// Recibe: un arreglo de { codigo, cantidad }.
// Hace: lo guarda en localStorage, reemplazando el carrito anterior.
// Devuelve: nada.
function guardarCarrito(carrito) {
  guardarEnStorage(CLAVE_CARRITO, carrito);
}

// Recibe: nada.
// Hace: suma las cantidades de todos los productos del carrito. Es el
//       número que muestra el contador del header: unidades, no productos
//       distintos (2 mochilas y 1 linterna son 3).
// Devuelve: el total de unidades.
function contarUnidadesCarrito() {
  let totalUnidades = 0;

  leerCarrito().forEach(function (item) {
    totalUnidades = totalUnidades + item.cantidad;
  });

  return totalUnidades;
}

// Recibe: el código de un producto.
// Hace: busca ese producto dentro del carrito.
// Devuelve: cuántas unidades de ese producto hay en el carrito (0 si no está).
function obtenerCantidadEnCarrito(codigo) {
  const carrito = leerCarrito();

  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].codigo === codigo) {
      return carrito[i].cantidad;
    }
  }

  return 0;
}

// Recibe: una cantidad.
// Hace: elige entre singular y plural.
// Devuelve: un texto como "1 unidad" o "3 unidades".
function escribirUnidades(cantidad) {
  if (cantidad === 1) {
    return "1 unidad";
  }

  return cantidad + " unidades";
}

// Recibe: el código de un producto y la cantidad que se quiere añadir.
// Hace: añade el producto al carrito respetando el stock:
//       - La cantidad debe ser un número entero mayor que 0.
//       - Lo que ya está en el carrito cuenta: con stock 12 y 10 unidades
//         en el carrito, solo se pueden añadir 2 más.
//       - Si se pide más de lo disponible, añade solo lo que queda y lo
//         avisa en el mensaje.
//       Si el producto ya estaba en el carrito, aumenta su cantidad; si no,
//       lo agrega al final.
// Devuelve: un objeto con dos datos:
//       cantidadAgregada  unidades que realmente se añadieron (0 si ninguna)
//       mensaje           texto para mostrarle al usuario
function agregarAlCarrito(codigo, cantidadPedida) {
  const producto = buscarProductoPorCodigo(codigo);

  if (producto === null) {
    return { cantidadAgregada: 0, mensaje: "Este producto ya no está disponible." };
  }

  if (!Number.isInteger(cantidadPedida) || cantidadPedida < 1) {
    return { cantidadAgregada: 0, mensaje: "La cantidad debe ser un número entero mayor que 0." };
  }

  if (producto.stock === 0) {
    return { cantidadAgregada: 0, mensaje: producto.nombre + " está agotado." };
  }

  const carrito = leerCarrito();
  const cantidadEnCarrito = obtenerCantidadEnCarrito(codigo);
  const unidadesDisponibles = producto.stock - cantidadEnCarrito;

  if (unidadesDisponibles <= 0) {
    return {
      cantidadAgregada: 0,
      mensaje: "Ya tienes en el carrito todo el stock de " + producto.nombre + " (" + escribirUnidades(producto.stock) + ")."
    };
  }

  // Si se pide más de lo que queda, se añade solo lo disponible
  let cantidadAAgregar = cantidadPedida;
  let seLimito = false;
  if (cantidadAAgregar > unidadesDisponibles) {
    cantidadAAgregar = unidadesDisponibles;
    seLimito = true;
  }

  // Si el producto ya está en el carrito se suma a su cantidad;
  // si no está, se agrega como un elemento nuevo
  let yaEstaba = false;
  carrito.forEach(function (item) {
    if (item.codigo === codigo) {
      item.cantidad = item.cantidad + cantidadAAgregar;
      yaEstaba = true;
    }
  });

  if (!yaEstaba) {
    carrito.push({ codigo: codigo, cantidad: cantidadAAgregar });
  }

  guardarCarrito(carrito);

  let mensaje = "Se añadió " + producto.nombre + " al carrito (" + escribirUnidades(cantidadAAgregar) + ").";
  if (seLimito) {
    mensaje = "Solo se añadieron " + escribirUnidades(cantidadAAgregar) + " de " + producto.nombre +
      ": es todo el stock disponible.";
  }

  return { cantidadAgregada: cantidadAAgregar, mensaje: mensaje };
}

// Recibe: nada.
// Hace: escribe en el círculo del header el total de unidades del carrito.
//       También ajusta el texto oculto que sigue al número ("producto" o
//       "productos"), que es lo que leen los lectores de pantalla:
//       "Carrito 1 producto".
//       Se llama al cargar cada página y cada vez que cambia el carrito.
// Devuelve: nada.
function actualizarContadorCarrito() {
  const contador = document.getElementById("contadorCarrito");

  // Si una página no tuviera el contador, no hay nada que actualizar
  if (contador === null) {
    return;
  }

  const totalUnidades = contarUnidadesCarrito();
  contador.textContent = totalUnidades;

  // nextElementSibling es el elemento que viene justo después del contador
  // en el HTML: el <span class="visually-hidden">
  const textoOculto = contador.nextElementSibling;

  if (textoOculto !== null) {
    if (totalUnidades === 1) {
      textoOculto.textContent = "producto";
    } else {
      textoOculto.textContent = "productos";
    }
  }
}

// Se ejecuta al cargar el archivo, en todas las páginas de la tienda
actualizarContadorCarrito();
