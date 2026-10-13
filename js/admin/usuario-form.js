/*
  Archivo: js/admin/usuario-form.js
  Qué es: script propio del formulario de usuario del panel. El mismo
          formulario sirve para crear un usuario y para editar uno.
  Quién lo usa: solo admin/usuario-form.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: solo el Administrador. Un Vendedor que escriba
          la dirección a mano es redirigido al inicio del panel.

  Aplica las mismas reglas que el registro de la tienda (js/core/
  validaciones.js), más el campo "Tipo de usuario".

  Tiene cuatro partes:
    1. Selects de Región y Comuna.
    2. Validación de cada campo (una función por campo).
    3. Guardado del usuario y envío del formulario.
    4. Inicio de la página (conexión de los eventos).
*/

// Largos máximos de los campos de texto (regla del enunciado)
const LARGO_MAXIMO_NOMBRE_USUARIO = 50;
const LARGO_MAXIMO_APELLIDOS_USUARIO = 100;
const LARGO_MAXIMO_DIRECCION_USUARIO = 300;

// ==========================================================
// 1. Selects de Región y Comuna
// ==========================================================

// Recibe: nada.
// Hace: agrega al select de Región una opción por cada región de REGIONES
//       (js/data/regiones.js).
// Devuelve: nada.
function cargarRegionesUsuario() {
  const selectRegion = document.getElementById("regionUsuario");

  REGIONES.forEach(function (region) {
    selectRegion.appendChild(crearOpcion(region.nombre, region.nombre));
  });
}

// Recibe: nada.
// Hace: vuelve a llenar el select de Comuna según la región elegida.
//       Siempre borra las comunas anteriores, así la selección se reinicia.
//       Sin región, deja el select deshabilitado con un aviso.
// Devuelve: nada.
function cargarComunasUsuario() {
  const selectRegion = document.getElementById("regionUsuario");
  const selectComuna = document.getElementById("comunaUsuario");
  const region = buscarRegionPorNombre(selectRegion.value);

  selectComuna.innerHTML = "";

  // La comuna elegida antes ya no vale: se quita su marca de validación
  limpiarEstadoCampo("comunaUsuario");

  if (region === null) {
    selectComuna.appendChild(crearOpcion("Primero selecciona una región", ""));
    selectComuna.disabled = true;
    return;
  }

  selectComuna.appendChild(crearOpcion("Selecciona una comuna", ""));

  region.comunas.forEach(function (comuna) {
    selectComuna.appendChild(crearOpcion(comuna, comuna));
  });

  selectComuna.disabled = false;
}

// ==========================================================
// 2. Validación de cada campo
// Cada función lee su campo, aplica la regla que le corresponde
// (js/core/validaciones.js) y muestra el resultado. Todas devuelven
// true si el campo quedó válido y false si quedó con error.
// ==========================================================

// RUN: formato, largo y dígito verificador (validarRun) y, además, único.
function validarRunUsuario() {
  const valor = document.getElementById("runUsuario").value;
  let mensajeError = validarRun(valor);

  // La unicidad se revisa solo si el RUN ya pasó las otras reglas
  if (mensajeError === "" && buscarUsuarioPorRun(valor) !== null) {
    mensajeError = "Ya existe un usuario con este RUN.";
  }

  return mostrarResultadoCampo("runUsuario", mensajeError);
}

// Nombre: obligatorio, máximo 50 caracteres.
function validarNombreUsuario() {
  const valor = document.getElementById("nombreUsuario").value;
  const mensajeError = validarTextoRequerido(valor, LARGO_MAXIMO_NOMBRE_USUARIO, "el nombre");
  return mostrarResultadoCampo("nombreUsuario", mensajeError);
}

// Apellidos: obligatorio, máximo 100 caracteres.
function validarApellidosUsuario() {
  const valor = document.getElementById("apellidosUsuario").value;
  const mensajeError = validarTextoRequerido(valor, LARGO_MAXIMO_APELLIDOS_USUARIO, "los apellidos");
  return mostrarResultadoCampo("apellidosUsuario", mensajeError);
}

// Teléfono: opcional. Vacío queda sin marcas; con algo escrito se valida.
function validarTelefonoUsuario() {
  const valor = document.getElementById("telefonoUsuario").value;

  if (valor.trim() === "") {
    limpiarEstadoCampo("telefonoUsuario");
    return true;
  }

  return mostrarResultadoCampo("telefonoUsuario", validarTelefono(valor));
}

// Fecha de nacimiento: opcional. Vacía queda sin marcas; si se elige una,
// no puede ser futura.
function validarFechaNacimientoUsuario() {
  const valor = document.getElementById("fechaNacimientoUsuario").value;

  if (valor === "") {
    limpiarEstadoCampo("fechaNacimientoUsuario");
    return true;
  }

  return mostrarResultadoCampo("fechaNacimientoUsuario", validarFechaNacimiento(valor));
}

// Tipo de usuario: hay que elegir uno (la primera opción tiene valor vacío).
function validarTipoUsuario() {
  const valor = document.getElementById("tipoUsuario").value;

  let mensajeError = "";
  if (valor === "") {
    mensajeError = "Selecciona un tipo de usuario.";
  }

  return mostrarResultadoCampo("tipoUsuario", mensajeError);
}

// Correo: obligatorio, dominio permitido y, además, único.
function validarCorreoUsuario() {
  const valor = document.getElementById("correoUsuario").value;
  let mensajeError = validarCorreo(valor, true);

  if (mensajeError === "" && buscarUsuarioPorCorreo(valor) !== null) {
    mensajeError = "Ya existe un usuario con este correo.";
  }

  return mostrarResultadoCampo("correoUsuario", mensajeError);
}

// Confirmar correo: obligatorio e igual al correo.
function validarConfirmarCorreoUsuario() {
  const valor = document.getElementById("confirmarCorreoUsuario").value;
  const correo = document.getElementById("correoUsuario").value;
  const mensajeError = validarConfirmacionCorreo(valor, correo);
  return mostrarResultadoCampo("confirmarCorreoUsuario", mensajeError);
}

// Contraseña: obligatoria al crear un usuario, de 4 a 10 caracteres.
function validarPasswordUsuario() {
  const valor = document.getElementById("passwordUsuario").value;
  const mensajeError = validarPassword(valor, true);
  return mostrarResultadoCampo("passwordUsuario", mensajeError);
}

// Confirmar contraseña: obligatoria al crear un usuario e igual a la
// contraseña.
function validarConfirmarPasswordUsuario() {
  const valor = document.getElementById("confirmarPasswordUsuario").value;
  const password = document.getElementById("passwordUsuario").value;
  let mensajeError = validarConfirmacionPassword(valor, password);

  // validarConfirmacionPassword acepta que ambas estén vacías. Al crear
  // un usuario la confirmación siempre se exige.
  if (valor === "") {
    mensajeError = "Confirma la contraseña.";
  }

  return mostrarResultadoCampo("confirmarPasswordUsuario", mensajeError);
}

// Región: hay que elegir una.
function validarRegionUsuario() {
  const valor = document.getElementById("regionUsuario").value;

  let mensajeError = "";
  if (valor === "") {
    mensajeError = "Selecciona una región.";
  }

  return mostrarResultadoCampo("regionUsuario", mensajeError);
}

// Comuna: hay que elegir una.
function validarComunaUsuario() {
  const valor = document.getElementById("comunaUsuario").value;

  let mensajeError = "";
  if (valor === "") {
    mensajeError = "Selecciona una comuna.";
  }

  return mostrarResultadoCampo("comunaUsuario", mensajeError);
}

// Dirección: obligatoria, máximo 300 caracteres.
function validarDireccionUsuario() {
  const valor = document.getElementById("direccionUsuario").value;
  const mensajeError = validarTextoRequerido(valor, LARGO_MAXIMO_DIRECCION_USUARIO, "la dirección");
  return mostrarResultadoCampo("direccionUsuario", mensajeError);
}

// Recibe: nada.
// Hace: valida el correo y, si la confirmación ya tiene algo escrito, la
//       vuelve a validar: al cambiar el correo puede dejar de coincidir.
// Devuelve: nada.
function revisarCorreoYConfirmacion() {
  validarCorreoUsuario();

  if (document.getElementById("confirmarCorreoUsuario").value !== "") {
    validarConfirmarCorreoUsuario();
  }
}

// Recibe: nada.
// Hace: lo mismo que la función anterior, pero con la contraseña.
// Devuelve: nada.
function revisarPasswordYConfirmacion() {
  validarPasswordUsuario();

  if (document.getElementById("confirmarPasswordUsuario").value !== "") {
    validarConfirmarPasswordUsuario();
  }
}

// ==========================================================
// 3. Guardado del usuario y envío del formulario
// ==========================================================

// Recibe: nada (lee los valores directamente del formulario, ya validados).
// Hace: arma un usuario con los once campos del modelo de datos. Guarda el
//       RUN normalizado (K en mayúscula), el correo en minúsculas y los
//       textos sin espacios sobrantes.
// Devuelve: el usuario armado (todavía sin guardar).
function leerUsuarioDelFormulario() {
  return {
    run: normalizarRun(document.getElementById("runUsuario").value),
    nombre: document.getElementById("nombreUsuario").value.trim(),
    apellidos: document.getElementById("apellidosUsuario").value.trim(),
    correo: document.getElementById("correoUsuario").value.trim().toLowerCase(),
    password: document.getElementById("passwordUsuario").value,
    telefono: document.getElementById("telefonoUsuario").value.trim(),
    fechaNacimiento: document.getElementById("fechaNacimientoUsuario").value,
    tipo: document.getElementById("tipoUsuario").value,
    region: document.getElementById("regionUsuario").value,
    comuna: document.getElementById("comunaUsuario").value,
    direccion: document.getElementById("direccionUsuario").value.trim()
  };
}

// Recibe: un usuario nuevo, ya validado.
// Hace: lo agrega al final de la lista de usuarios de localStorage.
// Devuelve: nada.
function guardarUsuarioNuevo(usuario) {
  const usuarios = leerDeStorage(CLAVE_USUARIOS);
  usuarios.push(usuario);
  guardarEnStorage(CLAVE_USUARIOS, usuarios);
}

// Recibe: el evento "submit" del formulario.
// Hace: detiene el envío normal (que recargaría la página) y valida todos
//       los campos. Si alguno tiene error, pone el cursor en el primero.
//       Si todo está bien, guarda el usuario y vuelve al listado con un
//       aviso, cuyo código viaja en la URL.
// Devuelve: nada.
function enviarFormularioUsuario(evento) {
  evento.preventDefault();

  // Cada campo se valida y su resultado se guarda en una variable, para
  // marcar todos los errores de una vez y no solo el primero
  const runOk = validarRunUsuario();
  const nombreOk = validarNombreUsuario();
  const apellidosOk = validarApellidosUsuario();
  const telefonoOk = validarTelefonoUsuario();
  const fechaOk = validarFechaNacimientoUsuario();
  const tipoOk = validarTipoUsuario();
  const correoOk = validarCorreoUsuario();
  const confirmarCorreoOk = validarConfirmarCorreoUsuario();
  const passwordOk = validarPasswordUsuario();
  const confirmarPasswordOk = validarConfirmarPasswordUsuario();
  const regionOk = validarRegionUsuario();
  const comunaOk = validarComunaUsuario();
  const direccionOk = validarDireccionUsuario();

  const todoEsValido = runOk && nombreOk && apellidosOk && telefonoOk && fechaOk &&
    tipoOk && correoOk && confirmarCorreoOk && passwordOk && confirmarPasswordOk &&
    regionOk && comunaOk && direccionOk;

  if (!todoEsValido) {
    enfocarPrimerCampoConError("formularioUsuario");
    return;
  }

  guardarUsuarioNuevo(leerUsuarioDelFormulario());
  irAPagina("usuarios.html?aviso=usuario-creado");
}

// ==========================================================
// 4. Inicio de la página
// ==========================================================

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel, con el Administrador como
//       único rol permitido. La opción del menú que se marca es "usuarios",
//       porque el formulario pertenece a esa sección. Después llena las
//       regiones y conecta cada campo y el envío con sus funciones.
// Devuelve: nada.
function iniciarFormularioUsuario() {
  const puedeVerLaPagina = iniciarPanel([ROL_ADMINISTRADOR], "usuarios");

  if (!puedeVerLaPagina) {
    return;
  }

  cargarRegionesUsuario();

  // Al cambiar la región, primero se recargan las comunas
  document.getElementById("regionUsuario").addEventListener("change", cargarComunasUsuario);

  revisarEnTiempoReal("runUsuario", validarRunUsuario);
  revisarEnTiempoReal("nombreUsuario", validarNombreUsuario);
  revisarEnTiempoReal("apellidosUsuario", validarApellidosUsuario);
  revisarEnTiempoReal("telefonoUsuario", validarTelefonoUsuario);
  revisarEnTiempoReal("fechaNacimientoUsuario", validarFechaNacimientoUsuario);
  revisarEnTiempoReal("tipoUsuario", validarTipoUsuario);
  revisarEnTiempoReal("correoUsuario", revisarCorreoYConfirmacion);
  revisarEnTiempoReal("confirmarCorreoUsuario", validarConfirmarCorreoUsuario);
  revisarEnTiempoReal("passwordUsuario", revisarPasswordYConfirmacion);
  revisarEnTiempoReal("confirmarPasswordUsuario", validarConfirmarPasswordUsuario);
  revisarEnTiempoReal("regionUsuario", validarRegionUsuario);
  revisarEnTiempoReal("comunaUsuario", validarComunaUsuario);
  revisarEnTiempoReal("direccionUsuario", validarDireccionUsuario);

  document.getElementById("formularioUsuario").addEventListener("submit", enviarFormularioUsuario);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarFormularioUsuario();
