/*
  Archivo: js/tienda/registro.js
  Qué es: script propio del formulario de registro.
  Quién lo usa: solo registro.html.
  Orden de carga: va al final, DESPUÉS de js/tienda/tienda-comun.js.
          Usa REGIONES (js/data/regiones.js) y las funciones de
          js/core/storage.js, utils.js y validaciones.js.

  Tiene cuatro partes:
    1. Selects de Región y Comuna.
    2. Validación de cada campo (una función por campo).
    3. Guardado del usuario y envío del formulario.
    4. Inicio de la página (conexión de los eventos).
*/

// ==========================================================
// Selects de Región y Comuna
// ==========================================================

// Recibe: el texto que verá el usuario y el valor que guardará la opción.
// Hace: crea un elemento <option> para un select.
// Devuelve: la opción creada (todavía sin agregar a ningún select).
function crearOpcion(texto, valor) {
  const opcion = document.createElement("option");
  opcion.textContent = texto;
  opcion.value = valor;
  return opcion;
}

// Recibe: nada.
// Hace: agrega al select de Región una opción por cada región de REGIONES.
//       La primera opción ("Selecciona una región") ya está en el HTML.
// Devuelve: nada.
function cargarRegiones() {
  const selectRegion = document.getElementById("regionRegistro");

  REGIONES.forEach(function (region) {
    // El texto visible y el valor guardado son el mismo: el nombre
    selectRegion.appendChild(crearOpcion(region.nombre, region.nombre));
  });
}

// Recibe: el nombre de una región.
// Hace: la busca en REGIONES.
// Devuelve: la región encontrada (con su arreglo de comunas), o null si
//           el nombre no corresponde a ninguna.
function buscarRegionPorNombre(nombreRegion) {
  for (let i = 0; i < REGIONES.length; i++) {
    if (REGIONES[i].nombre === nombreRegion) {
      return REGIONES[i];
    }
  }

  return null;
}

// Recibe: nada.
// Hace: vuelve a llenar el select de Comuna según la región elegida.
//       Siempre borra las comunas anteriores, así la selección se reinicia.
//       - Sin región: deja el select deshabilitado, con un aviso.
//       - Con región: lo habilita y agrega las comunas de esa región.
// Devuelve: nada.
function cargarComunas() {
  const selectRegion = document.getElementById("regionRegistro");
  const selectComuna = document.getElementById("comunaRegistro");
  const region = buscarRegionPorNombre(selectRegion.value);

  // Borra todas las opciones que tenía el select
  selectComuna.innerHTML = "";

  // La comuna elegida antes ya no vale: se quita su marca de validación
  limpiarEstadoCampo("comunaRegistro");

  if (region === null) {
    selectComuna.appendChild(crearOpcion("Primero selecciona una región", ""));
    selectComuna.disabled = true;
    return;
  }

  // La primera opción tiene valor vacío: obliga a elegir una comuna
  selectComuna.appendChild(crearOpcion("Selecciona una comuna", ""));

  region.comunas.forEach(function (comuna) {
    selectComuna.appendChild(crearOpcion(comuna, comuna));
  });

  selectComuna.disabled = false;
}

// ==========================================================
// Validación de cada campo
// Cada función lee su campo, aplica la regla que le corresponde
// (js/core/validaciones.js) y muestra el resultado. Todas devuelven
// true si el campo quedó válido y false si quedó con error.
// ==========================================================

// Largos máximos de los campos de texto (regla del enunciado)
const LARGO_MAXIMO_NOMBRE = 50;
const LARGO_MAXIMO_APELLIDOS = 100;
const LARGO_MAXIMO_DIRECCION = 300;

// Recibe: un RUN ya normalizado (sin espacios y con la K en mayúscula).
// Hace: revisa si algún usuario guardado en localStorage tiene ese RUN.
// Devuelve: true si el RUN ya está registrado; false si está libre.
function existeRun(run) {
  const usuarios = leerDeStorage(CLAVE_USUARIOS);

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].run === run) {
      return true;
    }
  }

  return false;
}

// Recibe: un correo sin espacios y en minúsculas.
// Hace: revisa si algún usuario guardado tiene ese correo. Compara en
//       minúsculas para que "Ana@gmail.com" y "ana@gmail.com" sean iguales.
// Devuelve: true si el correo ya está registrado; false si está libre.
function existeCorreo(correo) {
  const usuarios = leerDeStorage(CLAVE_USUARIOS);

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo.toLowerCase() === correo) {
      return true;
    }
  }

  return false;
}

// RUN: formato, largo y dígito verificador (validarRun) y, además, único.
function validarRunRegistro() {
  const valor = document.getElementById("runRegistro").value;
  let mensajeError = validarRun(valor);

  // La unicidad se revisa solo si el RUN ya pasó las otras reglas
  if (mensajeError === "" && existeRun(normalizarRun(valor))) {
    mensajeError = "Este RUN ya está registrado.";
  }

  return mostrarResultadoCampo("runRegistro", mensajeError);
}

// Nombre: obligatorio, máximo 50 caracteres.
function validarNombreRegistro() {
  const valor = document.getElementById("nombreRegistro").value;
  const mensajeError = validarTextoRequerido(valor, LARGO_MAXIMO_NOMBRE, "tu nombre");
  return mostrarResultadoCampo("nombreRegistro", mensajeError);
}

// Apellidos: obligatorio, máximo 100 caracteres.
function validarApellidosRegistro() {
  const valor = document.getElementById("apellidosRegistro").value;
  const mensajeError = validarTextoRequerido(valor, LARGO_MAXIMO_APELLIDOS, "tus apellidos");
  return mostrarResultadoCampo("apellidosRegistro", mensajeError);
}

// Teléfono: opcional. Vacío queda sin marcas; con algo escrito se valida.
function validarTelefonoRegistro() {
  const valor = document.getElementById("telefonoRegistro").value;

  if (valor.trim() === "") {
    limpiarEstadoCampo("telefonoRegistro");
    return true;
  }

  return mostrarResultadoCampo("telefonoRegistro", validarTelefono(valor));
}

// Fecha de nacimiento: opcional. Vacía queda sin marcas; si se elige una,
// no puede ser futura.
function validarFechaNacimientoRegistro() {
  const valor = document.getElementById("fechaNacimientoRegistro").value;

  if (valor === "") {
    limpiarEstadoCampo("fechaNacimientoRegistro");
    return true;
  }

  return mostrarResultadoCampo("fechaNacimientoRegistro", validarFechaNacimiento(valor));
}

// Correo: obligatorio, dominio permitido y, además, único.
function validarCorreoRegistro() {
  const valor = document.getElementById("correoRegistro").value;
  let mensajeError = validarCorreo(valor, true);

  if (mensajeError === "" && existeCorreo(valor.trim().toLowerCase())) {
    mensajeError = "Este correo ya está registrado.";
  }

  return mostrarResultadoCampo("correoRegistro", mensajeError);
}

// Confirmar correo: obligatorio e igual al correo.
function validarConfirmarCorreoRegistro() {
  const valor = document.getElementById("confirmarCorreoRegistro").value;
  const correo = document.getElementById("correoRegistro").value;
  const mensajeError = validarConfirmacionCorreo(valor, correo);
  return mostrarResultadoCampo("confirmarCorreoRegistro", mensajeError);
}

// Contraseña: obligatoria en el registro, de 4 a 10 caracteres.
function validarPasswordRegistro() {
  const valor = document.getElementById("passwordRegistro").value;
  const mensajeError = validarPassword(valor, true);
  return mostrarResultadoCampo("passwordRegistro", mensajeError);
}

// Confirmar contraseña: obligatoria en el registro e igual a la contraseña.
function validarConfirmarPasswordRegistro() {
  const valor = document.getElementById("confirmarPasswordRegistro").value;
  const password = document.getElementById("passwordRegistro").value;
  let mensajeError = validarConfirmacionPassword(valor, password);

  // validarConfirmacionPassword acepta que ambas estén vacías (sirve al
  // editar un usuario). En el registro la confirmación siempre se exige.
  if (valor === "") {
    mensajeError = "Confirma la contraseña.";
  }

  return mostrarResultadoCampo("confirmarPasswordRegistro", mensajeError);
}

// Región: hay que elegir una (la primera opción tiene valor vacío).
function validarRegionRegistro() {
  const valor = document.getElementById("regionRegistro").value;

  let mensajeError = "";
  if (valor === "") {
    mensajeError = "Selecciona una región.";
  }

  return mostrarResultadoCampo("regionRegistro", mensajeError);
}

// Comuna: hay que elegir una.
function validarComunaRegistro() {
  const valor = document.getElementById("comunaRegistro").value;

  let mensajeError = "";
  if (valor === "") {
    mensajeError = "Selecciona una comuna.";
  }

  return mostrarResultadoCampo("comunaRegistro", mensajeError);
}

// Dirección: obligatoria, máximo 300 caracteres.
function validarDireccionRegistro() {
  const valor = document.getElementById("direccionRegistro").value;
  const mensajeError = validarTextoRequerido(valor, LARGO_MAXIMO_DIRECCION, "tu dirección");
  return mostrarResultadoCampo("direccionRegistro", mensajeError);
}

// Recibe: nada.
// Hace: valida el correo y, si la confirmación ya tiene algo escrito, la
//       vuelve a validar: al cambiar el correo puede dejar de coincidir.
// Devuelve: nada.
function validarCorreoYSuConfirmacion() {
  validarCorreoRegistro();

  if (document.getElementById("confirmarCorreoRegistro").value !== "") {
    validarConfirmarCorreoRegistro();
  }
}

// Recibe: nada.
// Hace: lo mismo que la función anterior, pero con la contraseña.
// Devuelve: nada.
function validarPasswordYSuConfirmacion() {
  validarPasswordRegistro();

  if (document.getElementById("confirmarPasswordRegistro").value !== "") {
    validarConfirmarPasswordRegistro();
  }
}

// ==========================================================
// Guardado del usuario y envío del formulario
// ==========================================================

// Ids de los doce campos del formulario, para recorrerlos al limpiar
const CAMPOS_REGISTRO = [
  "runRegistro", "nombreRegistro", "apellidosRegistro", "telefonoRegistro",
  "fechaNacimientoRegistro", "correoRegistro", "confirmarCorreoRegistro",
  "passwordRegistro", "confirmarPasswordRegistro", "regionRegistro",
  "comunaRegistro", "direccionRegistro"
];

// Recibe: nada (lee los valores directamente del formulario, ya validados).
// Hace: arma el usuario nuevo y lo agrega a la lista de usuarios de
//       localStorage (clave at_usuarios). El tipo siempre es "Cliente":
//       desde la tienda no se pueden crear administradores ni vendedores.
// Devuelve: el usuario creado.
function guardarUsuarioRegistrado() {
  const usuarioNuevo = {
    run: normalizarRun(document.getElementById("runRegistro").value),
    nombre: document.getElementById("nombreRegistro").value.trim(),
    apellidos: document.getElementById("apellidosRegistro").value.trim(),
    correo: document.getElementById("correoRegistro").value.trim().toLowerCase(),
    password: document.getElementById("passwordRegistro").value,
    telefono: document.getElementById("telefonoRegistro").value.trim(),
    fechaNacimiento: document.getElementById("fechaNacimientoRegistro").value,
    tipo: "Cliente",
    region: document.getElementById("regionRegistro").value,
    comuna: document.getElementById("comunaRegistro").value,
    direccion: document.getElementById("direccionRegistro").value.trim()
  };

  const usuarios = leerDeStorage(CLAVE_USUARIOS);
  usuarios.push(usuarioNuevo);
  guardarEnStorage(CLAVE_USUARIOS, usuarios);

  return usuarioNuevo;
}

// Recibe: nada.
// Hace: deja el formulario como recién abierto: campos vacíos, sin marcas
//       de validación y con el select de Comuna deshabilitado otra vez.
// Devuelve: nada.
function limpiarFormularioRegistro() {
  document.getElementById("formularioRegistro").reset();

  CAMPOS_REGISTRO.forEach(function (idCampo) {
    limpiarEstadoCampo(idCampo);
  });

  // Tras el reset la región queda vacía: esto vuelve a bloquear la comuna
  cargarComunas();
}

// Recibe: el nombre del usuario recién registrado.
// Hace: escribe la confirmación bajo el botón, con un enlace para iniciar
//       sesión. El nombre se escribe con textContent, como texto puro.
// Devuelve: nada.
function mostrarConfirmacionRegistro(nombre) {
  const aviso = document.getElementById("mensajeRegistro");
  aviso.textContent = "¡Cuenta creada, " + nombre + "! Ya puedes ";

  const enlace = document.createElement("a");
  enlace.href = "login.html";
  enlace.textContent = "iniciar sesión";
  aviso.appendChild(enlace);

  aviso.appendChild(document.createTextNode("."));
}

// Recibe: el evento "submit" del formulario de registro.
// Hace: detiene el envío normal (que recargaría la página) y valida los
//       doce campos. Si alguno tiene error, pone el cursor en el primero.
//       Si todo está bien, guarda el usuario, limpia el formulario y avisa.
// Devuelve: nada.
function enviarRegistro(evento) {
  evento.preventDefault();

  document.getElementById("mensajeRegistro").textContent = "";

  // Cada campo se valida y su resultado se guarda en una variable.
  // Así se marcan todos los errores de una vez, no solo el primero.
  const runOk = validarRunRegistro();
  const nombreOk = validarNombreRegistro();
  const apellidosOk = validarApellidosRegistro();
  const telefonoOk = validarTelefonoRegistro();
  const fechaOk = validarFechaNacimientoRegistro();
  const correoOk = validarCorreoRegistro();
  const confirmarCorreoOk = validarConfirmarCorreoRegistro();
  const passwordOk = validarPasswordRegistro();
  const confirmarPasswordOk = validarConfirmarPasswordRegistro();
  const regionOk = validarRegionRegistro();
  const comunaOk = validarComunaRegistro();
  const direccionOk = validarDireccionRegistro();

  const todoEsValido = runOk && nombreOk && apellidosOk && telefonoOk && fechaOk &&
    correoOk && confirmarCorreoOk && passwordOk && confirmarPasswordOk &&
    regionOk && comunaOk && direccionOk;

  if (!todoEsValido) {
    enfocarPrimerCampoConError("formularioRegistro");
    return;
  }

  const usuarioNuevo = guardarUsuarioRegistrado();
  limpiarFormularioRegistro();
  mostrarConfirmacionRegistro(usuarioNuevo.nombre);
}

// ==========================================================
// Inicio de la página
// ==========================================================

// Recibe: el id de un campo y la función que lo valida.
// Hace: deja el campo conectado para validarse en tiempo real: mientras el
//       usuario escribe o elige ("input") y cuando sale del campo ("blur").
// Devuelve: nada.
function validarEnTiempoReal(idCampo, funcionValidar) {
  const campo = document.getElementById(idCampo);
  campo.addEventListener("input", funcionValidar);
  campo.addEventListener("blur", funcionValidar);
}

// Recibe: nada.
// Hace: prepara el formulario: llena las regiones y conecta cada campo y
//       el envío con sus funciones.
// Devuelve: nada.
function iniciarRegistro() {
  cargarRegiones();

  // Al cambiar la región, primero se recargan las comunas
  document.getElementById("regionRegistro").addEventListener("change", cargarComunas);

  validarEnTiempoReal("runRegistro", validarRunRegistro);
  validarEnTiempoReal("nombreRegistro", validarNombreRegistro);
  validarEnTiempoReal("apellidosRegistro", validarApellidosRegistro);
  validarEnTiempoReal("telefonoRegistro", validarTelefonoRegistro);
  validarEnTiempoReal("fechaNacimientoRegistro", validarFechaNacimientoRegistro);
  validarEnTiempoReal("correoRegistro", validarCorreoYSuConfirmacion);
  validarEnTiempoReal("confirmarCorreoRegistro", validarConfirmarCorreoRegistro);
  validarEnTiempoReal("passwordRegistro", validarPasswordYSuConfirmacion);
  validarEnTiempoReal("confirmarPasswordRegistro", validarConfirmarPasswordRegistro);
  validarEnTiempoReal("regionRegistro", validarRegionRegistro);
  validarEnTiempoReal("comunaRegistro", validarComunaRegistro);
  validarEnTiempoReal("direccionRegistro", validarDireccionRegistro);

  document.getElementById("formularioRegistro").addEventListener("submit", enviarRegistro);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarRegistro();
