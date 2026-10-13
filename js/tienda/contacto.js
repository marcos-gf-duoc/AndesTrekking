/*
  Archivo: js/tienda/contacto.js
  Qué es: script propio del formulario de contacto.
  Quién lo usa: solo contacto.html.
  Orden de carga: va al final, DESPUÉS de js/tienda/tienda-comun.js.

  Cómo funciona: cada campo se valida mientras el usuario escribe ("input"),
  cuando sale del campo ("blur") y otra vez al enviar ("submit"). Las reglas
  están en js/core/validaciones.js; aquí solo se decide qué regla aplica a
  cada campo y qué hacer cuando todo está correcto.
*/

// Largos máximos de los campos (regla del enunciado)
const LARGO_MAXIMO_NOMBRE_CONTACTO = 100;
const LARGO_MAXIMO_COMENTARIO = 500;

// Recibe: nada.
// Hace: valida el campo nombre: obligatorio y de máximo 100 caracteres.
// Devuelve: true si es válido; false si tiene error.
function validarNombreContacto() {
  const campo = document.getElementById("nombreContacto");
  const mensajeError = validarTextoRequerido(campo.value, LARGO_MAXIMO_NOMBRE_CONTACTO, "tu nombre");
  return mostrarResultadoCampo("nombreContacto", mensajeError);
}

// Recibe: nada.
// Hace: valida el campo correo, que es opcional. Si está vacío, le quita
//       las marcas (no se muestra en verde un campo que no se llenó).
//       Si tiene algo, revisa el formato y el dominio.
// Devuelve: true si está vacío o es válido; false si tiene error.
function validarCorreoContacto() {
  const campo = document.getElementById("correoContacto");

  if (campo.value.trim() === "") {
    limpiarEstadoCampo("correoContacto");
    return true;
  }

  const mensajeError = validarCorreo(campo.value, false); // false: no es obligatorio
  return mostrarResultadoCampo("correoContacto", mensajeError);
}

// Recibe: nada.
// Hace: valida el campo comentario: obligatorio y de máximo 500 caracteres.
// Devuelve: true si es válido; false si tiene error.
function validarComentarioContacto() {
  const campo = document.getElementById("comentarioContacto");
  const mensajeError = validarTextoRequerido(campo.value, LARGO_MAXIMO_COMENTARIO, "tu comentario");
  return mostrarResultadoCampo("comentarioContacto", mensajeError);
}

// Recibe: nada.
// Hace: actualiza el contador de caracteres del comentario ("120/500").
// Devuelve: nada.
function actualizarContadorComentario() {
  actualizarContador("comentarioContacto", "contadorComentarioContacto", LARGO_MAXIMO_COMENTARIO);
}

// Recibe: el arreglo de mensajes ya guardados.
// Hace: busca el id más alto y le suma 1. Así los ids son correlativos
//       (1, 2, 3...) y no se repiten.
// Devuelve: el id para el próximo mensaje (1 si todavía no hay mensajes).
function obtenerSiguienteIdMensaje(mensajes) {
  let idMasAlto = 0;

  mensajes.forEach(function (mensaje) {
    if (mensaje.id > idMasAlto) {
      idMasAlto = mensaje.id;
    }
  });

  return idMasAlto + 1;
}

// Recibe: el nombre, el correo y el comentario, ya validados.
// Hace: arma el mensaje con su id y la fecha de hoy, y lo agrega a la lista
//       de mensajes de localStorage (clave at_mensajes).
// Devuelve: nada.
function guardarMensaje(nombre, correo, comentario) {
  const mensajes = leerDeStorage(CLAVE_MENSAJES);

  const mensajeNuevo = {
    id: obtenerSiguienteIdMensaje(mensajes),
    fecha: obtenerFechaDeHoy(),
    nombre: nombre,
    correo: correo, // queda "" si el usuario no escribió un correo
    comentario: comentario
  };

  mensajes.push(mensajeNuevo);
  guardarEnStorage(CLAVE_MENSAJES, mensajes);
}

// Recibe: nada.
// Hace: deja el formulario como recién abierto: campos vacíos, sin marcas
//       de validación y con el contador en cero.
// Devuelve: nada.
function limpiarFormularioContacto() {
  // reset() vacía todos los campos del formulario
  document.getElementById("formularioContacto").reset();

  limpiarEstadoCampo("nombreContacto");
  limpiarEstadoCampo("correoContacto");
  limpiarEstadoCampo("comentarioContacto");
  actualizarContadorComentario();
}

// Recibe: el evento "submit" del formulario de contacto.
// Hace: detiene el envío normal (que recargaría la página) y valida los
//       tres campos. Si alguno tiene error, pone el cursor en el primero.
//       Si todo está bien, guarda el mensaje, avisa y limpia el formulario.
// Devuelve: nada.
function enviarContacto(evento) {
  evento.preventDefault();

  const avisoExito = document.getElementById("mensajeContacto");
  avisoExito.textContent = "";

  // Se validan los tres campos siempre, para mostrar todos los errores
  // de una vez y no de a uno
  const nombreEsValido = validarNombreContacto();
  const correoEsValido = validarCorreoContacto();
  const comentarioEsValido = validarComentarioContacto();

  if (!nombreEsValido || !correoEsValido || !comentarioEsValido) {
    enfocarPrimerCampoConError("formularioContacto");
    return;
  }

  // Se guardan los textos sin espacios sobrantes; el correo, en minúsculas
  const nombre = document.getElementById("nombreContacto").value.trim();
  const correo = document.getElementById("correoContacto").value.trim().toLowerCase();
  const comentario = document.getElementById("comentarioContacto").value.trim();

  guardarMensaje(nombre, correo, comentario);
  limpiarFormularioContacto();

  avisoExito.textContent = "¡Gracias, " + nombre + "! Recibimos tu mensaje.";
}

// Recibe: nada.
// Hace: conecta el formulario y sus campos con las funciones de este
//       archivo, y deja el contador en "0/500".
// Devuelve: nada.
function iniciarContacto() {
  const formulario = document.getElementById("formularioContacto");
  const campoNombre = document.getElementById("nombreContacto");
  const campoCorreo = document.getElementById("correoContacto");
  const campoComentario = document.getElementById("comentarioContacto");

  formulario.addEventListener("submit", enviarContacto);

  campoNombre.addEventListener("input", validarNombreContacto);
  campoNombre.addEventListener("blur", validarNombreContacto);

  campoCorreo.addEventListener("input", validarCorreoContacto);
  campoCorreo.addEventListener("blur", validarCorreoContacto);

  campoComentario.addEventListener("input", validarComentarioContacto);
  campoComentario.addEventListener("blur", validarComentarioContacto);
  campoComentario.addEventListener("input", actualizarContadorComentario);

  actualizarContadorComentario();
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarContacto();
