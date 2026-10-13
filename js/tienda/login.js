/*
  Archivo: js/tienda/login.js
  Qué es: script propio de la página de inicio de sesión.
  Quién lo usa: solo login.html.
  Orden de carga: va al final, DESPUÉS de js/core/auth.js y de
          js/tienda/tienda-comun.js.

  Cómo funciona: valida el formato del correo y de la contraseña, y luego
  le pide a auth.js que inicie la sesión. Si los datos no coinciden con
  ningún usuario, muestra un error genérico. Si coinciden, lleva al usuario
  a la página que corresponde a su rol.
*/

// Recibe: nada.
// Hace: valida el campo correo: obligatorio, máximo 100 caracteres y de un
//       dominio permitido.
// Devuelve: true si es válido; false si tiene error.
function validarCorreoLogin() {
  const valor = document.getElementById("correoLogin").value;
  return mostrarResultadoCampo("correoLogin", validarCorreo(valor, true));
}

// Recibe: nada.
// Hace: valida el campo contraseña: obligatoria, de 4 a 10 caracteres.
// Devuelve: true si es válida; false si tiene error.
function validarPasswordLogin() {
  const valor = document.getElementById("passwordLogin").value;
  return mostrarResultadoCampo("passwordLogin", validarPassword(valor, true));
}

// Recibe: la sesión del usuario que acaba de entrar.
// Hace: decide a qué página debe ir según su rol:
//       - Administrador y Vendedor: al panel de administración.
//       - Cliente: al inicio de la tienda; o al carrito, si llegó al login
//         desde el botón Pagar (la URL trae ?volver=carrito).
// Devuelve: la ruta de la página de destino.
function obtenerDestinoDespuesDelLogin(sesion) {
  if (sesion.tipo === ROL_ADMINISTRADOR || sesion.tipo === ROL_VENDEDOR) {
    return "admin/index.html";
  }

  if (obtenerParametroUrl("volver") === "carrito") {
    return "carrito.html";
  }

  return "index.html";
}

// Recibe: el evento "submit" del formulario de login.
// Hace: detiene el envío normal, valida los dos campos e intenta iniciar
//       la sesión. Si falla, muestra el error genérico; si funciona,
//       redirige según el rol.
// Devuelve: nada.
function enviarLogin(evento) {
  evento.preventDefault();

  const cajaError = document.getElementById("errorLogin");
  cajaError.textContent = "";

  const correoEsValido = validarCorreoLogin();
  const passwordEsValida = validarPasswordLogin();

  if (!correoEsValido || !passwordEsValida) {
    enfocarPrimerCampoConError("formularioLogin");
    return;
  }

  const correo = document.getElementById("correoLogin").value;
  const password = document.getElementById("passwordLogin").value;
  const sesion = iniciarSesion(correo, password);

  if (sesion === null) {
    // Mensaje genérico a propósito: no dice si falló el correo o la
    // contraseña, para no revelar qué correos están registrados
    cajaError.textContent = "Correo o contraseña incorrectos.";
    document.getElementById("passwordLogin").focus();
    return;
  }

  irAPagina(obtenerDestinoDespuesDelLogin(sesion));
}

// Recibe: nada.
// Hace: borra el error genérico cuando el usuario vuelve a escribir, porque
//       ese mensaje correspondía al intento anterior.
// Devuelve: nada.
function borrarErrorLogin() {
  document.getElementById("errorLogin").textContent = "";
}

// Recibe: nada.
// Hace: prepara la página. Si ya hay una sesión iniciada no tiene sentido
//       mostrar el login, así que redirige de inmediato. Si no, conecta
//       el formulario y sus campos con las funciones de este archivo.
// Devuelve: nada.
function iniciarLogin() {
  const sesionActiva = obtenerSesion();

  if (sesionActiva !== null) {
    irAPagina(obtenerDestinoDespuesDelLogin(sesionActiva));
    return;
  }

  const campoCorreo = document.getElementById("correoLogin");
  const campoPassword = document.getElementById("passwordLogin");

  document.getElementById("formularioLogin").addEventListener("submit", enviarLogin);

  campoCorreo.addEventListener("input", validarCorreoLogin);
  campoCorreo.addEventListener("blur", validarCorreoLogin);
  campoCorreo.addEventListener("input", borrarErrorLogin);

  campoPassword.addEventListener("input", validarPasswordLogin);
  campoPassword.addEventListener("blur", validarPasswordLogin);
  campoPassword.addEventListener("input", borrarErrorLogin);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarLogin();
