/*
  Archivo: js/admin/orden-detalle.js
  Qué es: script propio de la página que muestra una orden de compra en el
          panel.
  Quién lo usa: solo admin/orden-detalle.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: Administrador y Vendedor.

  Cómo funciona: la página se abre con el número de la orden en la URL, por
  ejemplo orden-detalle.html?id=ORD-1001. El script busca esa orden en
  localStorage y escribe sus datos, sus productos y sus totales.
  Además permite cambiar el estado de la orden con un selector y el
  botón "Guardar".
*/

// Orden que se está mostrando. Se guarda en una variable fuera de las
// funciones para que "Guardar" sepa qué orden debe cambiar. Se declara
// con let porque parte en null y se asigna al cargar la página.
let ordenEnPantalla = null;

// Recibe: el número de una orden (por ejemplo "ORD-1001").
// Hace: recorre las órdenes guardadas en localStorage hasta encontrar la
//       que tiene ese número.
// Devuelve: la orden encontrada, o null si no existe.
function buscarOrdenPorId(id) {
  const ordenes = leerDeStorage(CLAVE_ORDENES);

  for (let i = 0; i < ordenes.length; i++) {
    if (ordenes[i].id === id) {
      return ordenes[i];
    }
  }

  return null;
}

// Recibe: una orden.
// Hace: escribe sus datos generales en la página: el número en el título,
//       la fecha (como DD-MM-AAAA), el estado (como etiqueta de color), los
//       datos del cliente y el cupón usado.
// Devuelve: nada.
function mostrarDatosOrden(orden) {
  document.getElementById("tituloDetalle").textContent = "Orden " + orden.id;
  document.title = "Orden " + orden.id + " | Panel AndesTrekking";

  document.getElementById("datoFecha").textContent = formatearFecha(orden.fecha);
  document.getElementById("datoCliente").textContent = orden.nombreCliente;
  document.getElementById("datoRun").textContent = orden.runCliente;
  document.getElementById("datoCorreo").textContent = orden.correoCliente;

  // Se borra el estado anterior antes de agregar la etiqueta
  const datoEstado = document.getElementById("datoEstado");
  datoEstado.innerHTML = "";
  datoEstado.appendChild(crearEtiquetaEstado(orden.estado));

  // cupon vale null cuando la compra se hizo sin cupón
  let textoCupon = "Sin cupón";
  if (orden.cupon !== null) {
    textoCupon = orden.cupon;
  }
  document.getElementById("datoCupon").textContent = textoCupon;
}

// Recibe: un item de la orden ({codigo, nombre, precio, cantidad}).
// Hace: crea su fila de la tabla: código, nombre, precio unitario, cantidad
//       y subtotal (precio x cantidad). El nombre y el precio son los del
//       momento de la compra, guardados en la orden.
// Devuelve: la fila creada.
function crearFilaItem(item) {
  const fila = document.createElement("tr");
  const subtotalItem = item.precio * item.cantidad;

  fila.appendChild(crearCelda(item.codigo));
  fila.appendChild(crearCelda(item.nombre));
  // formatearPrecio escribe "Gratis" si el producto costaba 0
  fila.appendChild(crearCelda(formatearPrecio(item.precio), "celda-numero"));
  fila.appendChild(crearCelda(item.cantidad, "celda-numero"));
  fila.appendChild(crearCelda(formatearMonto(subtotalItem), "celda-numero"));

  return fila;
}

// Recibe: una orden.
// Hace: dibuja una fila por cada producto comprado y escribe los totales
//       al pie de la tabla: subtotal, descuento y total.
// Devuelve: nada.
function mostrarItemsOrden(orden) {
  const cuerpoTabla = document.getElementById("cuerpoTablaItems");
  cuerpoTabla.innerHTML = "";

  orden.items.forEach(function (item) {
    cuerpoTabla.appendChild(crearFilaItem(item));
  });

  // El descuento se muestra con un signo menos, porque se resta del subtotal
  let textoDescuento = formatearMonto(0);
  if (orden.descuento > 0) {
    textoDescuento = "-" + formatearMonto(orden.descuento);
  }

  document.getElementById("subtotalOrden").textContent = formatearMonto(orden.subtotal);
  document.getElementById("descuentoOrden").textContent = textoDescuento;
  document.getElementById("totalOrden").textContent = formatearMonto(orden.total);
}

// Recibe: el estado actual de la orden.
// Hace: llena el selector con los estados posibles (ESTADOS_DE_ORDEN, de
//       admin-comun.js) y deja elegido el estado actual.
// Devuelve: nada.
function llenarSelectorEstado(estadoActual) {
  const selector = document.getElementById("estadoOrden");
  selector.innerHTML = "";

  ESTADOS_DE_ORDEN.forEach(function (estado) {
    selector.appendChild(crearOpcion(estado, estado));
  });

  selector.value = estadoActual;
}

// Recibe: el estado elegido en el selector.
// Hace: revisa que sea uno de los estados permitidos. El selector solo
//       ofrece estados válidos, pero su contenido se puede alterar desde
//       las herramientas del navegador, así que igual se valida.
// Devuelve: el mensaje de error, o "" si el estado es válido.
function validarEstadoOrden(estado) {
  // indexOf devuelve -1 cuando el valor no está en el arreglo
  if (ESTADOS_DE_ORDEN.indexOf(estado) === -1) {
    return "Selecciona un estado válido.";
  }

  return "";
}

// Recibe: el número de una orden y su nuevo estado.
// Hace: busca la orden en localStorage, le cambia el estado y guarda el
//       arreglo completo de vuelta.
// Devuelve: true si la orden se guardó, o false si ya no existe.
function guardarEstadoEnStorage(id, nuevoEstado) {
  const ordenes = leerDeStorage(CLAVE_ORDENES);

  for (let i = 0; i < ordenes.length; i++) {
    if (ordenes[i].id === id) {
      ordenes[i].estado = nuevoEstado;
      guardarEnStorage(CLAVE_ORDENES, ordenes);
      return true;
    }
  }

  return false;
}

// Recibe: el evento "submit" del formulario de estado.
// Hace: valida el estado elegido. Si es válido y distinto del actual, lo
//       guarda, actualiza la etiqueta de estado de la página y muestra un
//       aviso de confirmación.
// Devuelve: nada.
function cambiarEstadoOrden(evento) {
  // Evita que el navegador envíe el formulario y recargue la página
  evento.preventDefault();

  const nuevoEstado = document.getElementById("estadoOrden").value;
  const mensajeError = validarEstadoOrden(nuevoEstado);

  if (mensajeError !== "") {
    mostrarResultadoCampo("estadoOrden", mensajeError);
    document.getElementById("estadoOrden").focus();
    return;
  }

  limpiarEstadoCampo("estadoOrden");

  if (nuevoEstado === ordenEnPantalla.estado) {
    mostrarAvisoPanel("La orden ya está en estado \"" + nuevoEstado + "\". No se hicieron cambios.");
    return;
  }

  const seGuardo = guardarEstadoEnStorage(ordenEnPantalla.id, nuevoEstado);

  if (!seGuardo) {
    mostrarAvisoPanel("No se pudo guardar: la orden ya no existe. Vuelve al listado.");
    return;
  }

  // La página se actualiza sin recargar: se cambia el dato en memoria y
  // se vuelven a escribir los datos, con la etiqueta del estado nuevo
  ordenEnPantalla.estado = nuevoEstado;
  mostrarDatosOrden(ordenEnPantalla);
  mostrarAvisoPanel("El estado de la orden " + ordenEnPantalla.id + " se cambió a \"" + nuevoEstado + "\".");
}

// Recibe: nada.
// Hace: reemplaza el detalle por un aviso cuando el número de la URL no
//       corresponde a ninguna orden.
// Devuelve: nada.
function mostrarOrdenNoEncontrada() {
  document.getElementById("detalleOrden").remove();
  document.getElementById("tituloDetalle").textContent = "Orden no encontrada";
  document.title = "Orden no encontrada | Panel AndesTrekking";

  mostrarAvisoPanel("La orden que buscas no existe. Vuelve al listado para elegir otra.");
}

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel: si el usuario no puede
//       verla, ya fue redirigido y no se hace nada más. Después lee el
//       número de la URL, busca la orden y muestra su detalle o el aviso
//       de que no existe. Al final prepara el formulario de estado.
// Devuelve: nada.
function iniciarDetalleOrdenAdmin() {
  const puedeVerLaPagina = iniciarPanel(ROLES_ADMIN_Y_VENDEDOR, "ordenes");

  if (!puedeVerLaPagina) {
    return;
  }

  const id = obtenerParametroUrl("id");

  let orden = null;
  if (id !== null) {
    orden = buscarOrdenPorId(id);
  }

  if (orden === null) {
    mostrarOrdenNoEncontrada();
    return;
  }

  ordenEnPantalla = orden;

  mostrarDatosOrden(orden);
  mostrarItemsOrden(orden);

  llenarSelectorEstado(orden.estado);
  document.getElementById("formularioEstado").addEventListener("submit", cambiarEstadoOrden);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarDetalleOrdenAdmin();
