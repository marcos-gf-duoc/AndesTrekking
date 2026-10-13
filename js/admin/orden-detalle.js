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
*/

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
//       de que no existe.
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

  mostrarDatosOrden(orden);
  mostrarItemsOrden(orden);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarDetalleOrdenAdmin();
