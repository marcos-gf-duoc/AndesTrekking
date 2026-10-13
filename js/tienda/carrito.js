/*
  Archivo: js/tienda/carrito.js
  Qué es: script propio de la página "Mi carrito de compras".
  Quién lo usa: solo carrito.html.
  Orden de carga: va al final, DESPUÉS de js/tienda/tienda-comun.js (usa
          sus funciones de carrito: leerCarrito, guardarCarrito, etc.).

  El carrito guardado solo tiene { codigo, cantidad }. Para mostrarlo, este
  script busca cada producto en localStorage y toma de ahí el nombre, la
  foto, el precio y el stock, que así siempre están al día.
*/

// Cantidad de caracteres de la descripción que se muestran en el carrito
const LARGO_DESCRIPCION_CORTA = 80;

// Recibe: un texto y un largo máximo.
// Hace: si el texto es más largo, lo corta y le agrega puntos suspensivos.
// Devuelve: el texto completo si cabe, o su comienzo terminado en "…".
function acortarTexto(texto, largoMaximo) {
  if (texto.length <= largoMaximo) {
    return texto;
  }

  // slice(0, n) toma los primeros n caracteres; trim quita un espacio final
  return texto.slice(0, largoMaximo).trim() + "…";
}

// ==========================================================
// Revisión del carrito al cargar la página
// ==========================================================

// Recibe: nada.
// Hace: compara el carrito guardado con los productos actuales y lo corrige:
//       - quita los productos que ya no existen (por ejemplo, si el
//         administrador los eliminó);
//       - quita los que quedaron sin stock;
//       - baja la cantidad de los que superan el stock actual.
//       Si hubo algún cambio, guarda el carrito corregido.
// Devuelve: un arreglo con los avisos de lo que se cambió (vacío si el
//           carrito estaba bien).
function revisarCarrito() {
  const carritoRevisado = [];
  const avisos = [];
  let cantidadInexistentes = 0;

  leerCarrito().forEach(function (item) {
    const producto = buscarProductoPorCodigo(item.codigo);

    if (producto === null) {
      cantidadInexistentes = cantidadInexistentes + 1;
      return; // dentro de forEach, return pasa al elemento siguiente
    }

    if (producto.stock === 0) {
      avisos.push("Se quitó " + producto.nombre + " porque se agotó.");
      return;
    }

    let cantidad = item.cantidad;
    if (cantidad > producto.stock) {
      cantidad = producto.stock;
      avisos.push("La cantidad de " + producto.nombre + " se ajustó a " + escribirUnidades(cantidad) +
        ", que es el stock disponible.");
    }

    carritoRevisado.push({ codigo: item.codigo, cantidad: cantidad });
  });

  if (cantidadInexistentes === 1) {
    avisos.push("Se quitó 1 producto que ya no está disponible.");
  }
  if (cantidadInexistentes > 1) {
    avisos.push("Se quitaron " + cantidadInexistentes + " productos que ya no están disponibles.");
  }

  // Solo se guarda si la revisión cambió algo
  if (avisos.length > 0) {
    guardarCarrito(carritoRevisado);
  }

  return avisos;
}

// Recibe: un arreglo de avisos (textos).
// Hace: si hay avisos, los escribe juntos en la caja de la página y la
//       muestra. Si no hay ninguno, la caja sigue oculta.
// Devuelve: nada.
function mostrarAvisosDelCarrito(avisos) {
  if (avisos.length === 0) {
    return;
  }

  const caja = document.getElementById("avisoCarrito");
  caja.textContent = avisos.join(" "); // join une los textos, separados por un espacio
  caja.hidden = false;
}

// ==========================================================
// Cambios de cantidad: botones −, + y Eliminar
// ==========================================================

// Recibe: el código de un producto y su cantidad nueva.
// Hace: guarda esa cantidad en el carrito. Si la cantidad nueva es 0, quita
//       el producto del carrito.
// Devuelve: nada.
function cambiarCantidadEnCarrito(codigo, cantidadNueva) {
  const carritoNuevo = [];

  leerCarrito().forEach(function (item) {
    if (item.codigo !== codigo) {
      carritoNuevo.push(item); // los demás productos quedan igual
      return;
    }

    if (cantidadNueva > 0) {
      carritoNuevo.push({ codigo: codigo, cantidad: cantidadNueva });
    }
    // con cantidad 0 el producto simplemente no se copia: queda fuera
  });

  guardarCarrito(carritoNuevo);
}

// Recibe: el código de un producto y el nombre de una acción ("menos",
//         "mas" o "eliminar").
// Hace: después de volver a dibujar la lista, pone el foco del teclado en
//       el mismo botón que se acababa de usar. Sin esto, quien navega con
//       el teclado perdería su lugar cada vez que cambia una cantidad,
//       porque al redibujar se crean botones nuevos.
// Devuelve: nada.
function devolverFocoAlBoton(codigo, accion) {
  const botones = document.querySelectorAll("#listaCarrito button");

  for (let i = 0; i < botones.length; i++) {
    if (botones[i].dataset.codigo === codigo && botones[i].dataset.accion === accion) {
      botones[i].focus();
      return;
    }
  }
}

// Recibe: un producto del carrito.
// Hace: responde al botón +. Sube la cantidad en 1, salvo que ya esté en
//       el máximo: la cantidad no puede superar el stock. En ese caso
//       muestra un aviso y no cambia nada.
// Devuelve: nada.
function aumentarCantidad(producto) {
  const cantidadActual = obtenerCantidadEnCarrito(producto.codigo);

  if (cantidadActual >= producto.stock) {
    mostrarAvisoFlotante("No hay más stock de " + producto.nombre + ": el máximo es " +
      escribirUnidades(producto.stock) + ".");
    return;
  }

  cambiarCantidadEnCarrito(producto.codigo, cantidadActual + 1);
  mostrarCarrito();
  devolverFocoAlBoton(producto.codigo, "mas");
}

// Recibe: un producto del carrito.
// Hace: responde al botón −. Baja la cantidad en 1. Si con eso llegaría a
//       0, pide confirmación antes de quitar el producto del carrito; si
//       el usuario cancela, la cantidad queda en 1.
// Devuelve: nada.
function disminuirCantidad(producto) {
  const cantidadActual = obtenerCantidadEnCarrito(producto.codigo);

  if (cantidadActual <= 1) {
    quitarProductoConConfirmacion(producto);
    return;
  }

  cambiarCantidadEnCarrito(producto.codigo, cantidadActual - 1);
  mostrarCarrito();
  devolverFocoAlBoton(producto.codigo, "menos");
}

// Recibe: un producto del carrito.
// Hace: pide confirmación y, si el usuario acepta, quita el producto del
//       carrito y vuelve a dibujar la página. La usan el botón "Eliminar"
//       y el botón − cuando la cantidad llegaría a 0.
// Devuelve: nada.
function quitarProductoConConfirmacion(producto) {
  // confirm devuelve true solo si el usuario presiona Aceptar
  if (!confirm("¿Quitar " + producto.nombre + " del carrito?")) {
    return;
  }

  cambiarCantidadEnCarrito(producto.codigo, 0);
  mostrarCarrito();
  mostrarAvisoFlotante("Se quitó " + producto.nombre + " del carrito.");
}

// Recibe: el texto visible del botón, su acción ("menos", "mas" o
//         "eliminar"), el producto, una clase CSS y la etiqueta para
//         lectores de pantalla.
// Hace: crea un botón del carrito. Guarda el código y la acción en
//       atributos data-, que sirven para volver a encontrarlo después de
//       redibujar la lista.
// Devuelve: el botón creado (todavía sin conectar a ninguna función).
function crearBotonCarrito(texto, accion, producto, clase, etiqueta) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = clase;
  boton.textContent = texto;
  boton.dataset.codigo = producto.codigo;
  boton.dataset.accion = accion;
  boton.setAttribute("aria-label", etiqueta);
  return boton;
}

// Recibe: un elemento del carrito { codigo, cantidad } y su producto.
// Hace: crea el control de cantidad: el botón −, el número y el botón +.
// Devuelve: el control creado.
function crearControlCantidad(item, producto) {
  const control = document.createElement("div");
  control.className = "carrito-cantidad";

  const botonMenos = crearBotonCarrito("−", "menos", producto, "carrito-boton-cantidad",
    "Quitar una unidad de " + producto.nombre);
  botonMenos.addEventListener("click", function () {
    disminuirCantidad(producto);
  });

  const numero = crearElementoConTexto("span", "carrito-cantidad-numero", String(item.cantidad));
  // Los lectores de pantalla leen "Cantidad: 2" en vez de solo "2"
  numero.setAttribute("aria-label", "Cantidad: " + item.cantidad);

  const botonMas = crearBotonCarrito("+", "mas", producto, "carrito-boton-cantidad",
    "Agregar una unidad de " + producto.nombre);
  botonMas.addEventListener("click", function () {
    aumentarCantidad(producto);
  });

  control.appendChild(botonMenos);
  control.appendChild(numero);
  control.appendChild(botonMas);
  return control;
}

// ==========================================================
// Dibujo de la lista de productos
// ==========================================================

// Recibe: el nombre de la etiqueta HTML, una clase CSS y un texto.
// Hace: crea un elemento con esa clase y ese texto. El texto se escribe con
//       textContent, así que se muestra tal cual aunque tenga símbolos HTML.
// Devuelve: el elemento creado.
function crearElementoConTexto(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

// Recibe: un elemento del carrito { codigo, cantidad } y su producto.
// Hace: crea el <li> que muestra ese producto en el carrito: foto, nombre
//       (ambos enlazan al detalle), descripción corta, precio unitario,
//       botones − y + con la cantidad, subtotal (precio por cantidad) y
//       botón "Eliminar".
// Devuelve: el <li> creado.
function crearItemCarrito(item, producto) {
  const enlaceDetalle = "producto.html?codigo=" + encodeURIComponent(producto.codigo);
  const fila = document.createElement("li");
  fila.className = "carrito-item";

  // Foto, con enlace al detalle. alt vacío: el nombre ya está escrito al lado
  const enlaceImagen = document.createElement("a");
  enlaceImagen.href = enlaceDetalle;
  enlaceImagen.setAttribute("aria-hidden", "true");
  enlaceImagen.tabIndex = -1; // el enlace del nombre ya permite llegar con el teclado
  const imagen = document.createElement("img");
  imagen.className = "carrito-item-imagen";
  imagen.src = obtenerRutaImagen(producto);
  imagen.alt = "";
  enlaceImagen.appendChild(imagen);
  fila.appendChild(enlaceImagen);

  // Nombre, descripción corta y precio unitario
  const info = document.createElement("div");
  info.className = "carrito-item-info";

  const titulo = document.createElement("h2");
  titulo.className = "carrito-item-nombre";
  const enlaceNombre = document.createElement("a");
  enlaceNombre.href = enlaceDetalle;
  enlaceNombre.textContent = producto.nombre;
  titulo.appendChild(enlaceNombre);
  info.appendChild(titulo);

  const descripcionCorta = acortarTexto(producto.descripcion, LARGO_DESCRIPCION_CORTA);
  info.appendChild(crearElementoConTexto("p", "carrito-item-descripcion", descripcionCorta));
  info.appendChild(crearElementoConTexto("p", "carrito-item-precio", "Precio unitario: " + formatearPrecio(producto.precio)));
  fila.appendChild(info);

  // Cantidad con sus botones, subtotal y botón Eliminar
  const totales = document.createElement("div");
  totales.className = "carrito-item-totales";
  totales.appendChild(crearControlCantidad(item, producto));

  const subtotal = producto.precio * item.cantidad;
  totales.appendChild(crearElementoConTexto("p", "carrito-item-subtotal", "Subtotal: " + formatearPrecio(subtotal)));

  const botonEliminar = crearBotonCarrito("Eliminar", "eliminar", producto, "carrito-boton-eliminar",
    "Eliminar " + producto.nombre + " del carrito");
  botonEliminar.addEventListener("click", function () {
    quitarProductoConConfirmacion(producto);
  });
  totales.appendChild(botonEliminar);

  fila.appendChild(totales);

  return fila;
}

// Recibe: nada.
// Hace: dibuja la página según el carrito guardado. Si está vacío, muestra
//       el mensaje de carrito vacío y oculta la lista. Si tiene productos,
//       dibuja uno por uno. También actualiza el contador del header.
// Devuelve: nada.
function mostrarCarrito() {
  const carrito = leerCarrito();
  const lista = document.getElementById("listaCarrito");
  const bloqueVacio = document.getElementById("carritoVacio");

  lista.innerHTML = "";
  actualizarContadorCarrito();

  if (carrito.length === 0) {
    lista.hidden = true;
    bloqueVacio.hidden = false;
    return;
  }

  lista.hidden = false;
  bloqueVacio.hidden = true;

  carrito.forEach(function (item) {
    // revisarCarrito ya quitó los productos que no existen, pero se
    // comprueba igual por si el carrito cambió desde otra pestaña
    const producto = buscarProductoPorCodigo(item.codigo);

    if (producto !== null) {
      lista.appendChild(crearItemCarrito(item, producto));
    }
  });
}

// ==========================================================
// Inicio de la página
// ==========================================================

// Recibe: nada.
// Hace: prepara la página: primero revisa y corrige el carrito, muestra los
//       avisos de lo que cambió y después dibuja los productos.
// Devuelve: nada.
function iniciarCarrito() {
  const avisos = revisarCarrito();
  mostrarAvisosDelCarrito(avisos);
  mostrarCarrito();
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarCarrito();
