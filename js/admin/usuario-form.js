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

  Dos modos, según la URL:
    - Nuevo:  usuario-form.html            (formulario vacío)
    - Editar: usuario-form.html?run=XXX    (formulario con los datos)

  Tiene cinco partes:
    1. Selects de Región y Comuna.
    2. Validación de cada campo (una función por campo).
    3. Guardado del usuario y envío del formulario.
    4. Modo Editar (carga de los datos del usuario).
    5. Inicio de la página (conexión de los eventos).
*/

// Largos máximos de los campos de texto (regla del enunciado)
const LARGO_MAXIMO_NOMBRE_USUARIO = 50;
const LARGO_MAXIMO_APELLIDOS_USUARIO = 100;
const LARGO_MAXIMO_DIRECCION_USUARIO = 300;

// Usuario que se está editando. Vale null en modo Nuevo. Se declara con let
// porque se define al iniciar la página, según la URL. Varias funciones la
// consultan para saber en qué modo está el formulario.
let usuarioEnEdicion = null;

// Recibe: nada.
// Hace: revisa si el usuario que se está editando es el mismo que tiene la
//       sesión iniciada, es decir, si el Administrador edita su propia cuenta.
// Devuelve: true si es su propia cuenta; false en modo Nuevo o si edita a otro.
function estaEditandoSuPropiaCuenta() {
  return usuarioEnEdicion !== null && usuarioEnEdicion.run === obtenerSesion().run;
}

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
// En modo Editar no se valida: el campo está bloqueado y el RUN no cambia.
function validarRunUsuario() {
  if (usuarioEnEdicion !== null) {
    return true;
  }

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
// Si el Administrador edita su propia cuenta no se valida: el campo está
// bloqueado y el tipo no cambia.
function validarTipoUsuario() {
  if (estaEditandoSuPropiaCuenta()) {
    return true;
  }

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

  if (mensajeError === "") {
    const usuarioConEseCorreo = buscarUsuarioPorCorreo(valor);

    // Hay choque si el correo es de otro usuario. En modo Editar, que el
    // correo sea del mismo usuario que se edita no es un error.
    const esDeOtroUsuario = usuarioConEseCorreo !== null &&
      (usuarioEnEdicion === null || usuarioConEseCorreo.run !== usuarioEnEdicion.run);

    if (esDeOtroUsuario) {
      mensajeError = "Ya existe un usuario con este correo.";
    }
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

// Contraseña: de 4 a 10 caracteres. Al crear un usuario es obligatoria.
// Al editar es opcional: si queda vacía, se conserva la anterior.
function validarPasswordUsuario() {
  const valor = document.getElementById("passwordUsuario").value;
  const esObligatoria = usuarioEnEdicion === null;

  if (valor === "" && !esObligatoria) {
    limpiarEstadoCampo("passwordUsuario");
    return true;
  }

  const mensajeError = validarPassword(valor, esObligatoria);
  return mostrarResultadoCampo("passwordUsuario", mensajeError);
}

// Confirmar contraseña: debe ser igual a la contraseña. Al crear un usuario
// siempre se exige. Al editar, si ambas quedan vacías no hay nada que
// confirmar, porque la contraseña no cambia.
function validarConfirmarPasswordUsuario() {
  const valor = document.getElementById("confirmarPasswordUsuario").value;
  const password = document.getElementById("passwordUsuario").value;

  if (usuarioEnEdicion !== null && valor === "" && password === "") {
    limpiarEstadoCampo("confirmarPasswordUsuario");
    return true;
  }

  let mensajeError = validarConfirmacionPassword(valor, password);

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

  // También se revisa cuando la contraseña quedó vacía: en modo Editar eso
  // quita el error que pudiera tener la confirmación
  const confirmacion = document.getElementById("confirmarPasswordUsuario").value;
  const password = document.getElementById("passwordUsuario").value;

  if (confirmacion !== "" || password === "") {
    if (usuarioEnEdicion !== null || confirmacion !== "") {
      validarConfirmarPasswordUsuario();
    }
  }
}

// ==========================================================
// 3. Guardado del usuario y envío del formulario
// ==========================================================

// Recibe: nada (lee los valores directamente del formulario, ya validados).
// Hace: arma un usuario con los once campos del modelo de datos. Guarda el
//       RUN normalizado (K en mayúscula), el correo en minúsculas y los
//       textos sin espacios sobrantes. En modo Editar conserva el RUN y,
//       si no se escribió una contraseña nueva, también la contraseña.
// Devuelve: el usuario armado (todavía sin guardar).
function leerUsuarioDelFormulario() {
  let run = normalizarRun(document.getElementById("runUsuario").value);
  let password = document.getElementById("passwordUsuario").value;
  let tipo = document.getElementById("tipoUsuario").value;

  if (usuarioEnEdicion !== null) {
    // El RUN es el identificador: siempre se conserva el original
    run = usuarioEnEdicion.run;

    // Contraseña vacía al editar: se conserva la que tenía
    if (password === "") {
      password = usuarioEnEdicion.password;
    }
  }

  // Un Administrador no puede cambiar el tipo de su propia cuenta
  if (estaEditandoSuPropiaCuenta()) {
    tipo = usuarioEnEdicion.tipo;
  }

  return {
    run: run,
    nombre: document.getElementById("nombreUsuario").value.trim(),
    apellidos: document.getElementById("apellidosUsuario").value.trim(),
    correo: document.getElementById("correoUsuario").value.trim().toLowerCase(),
    password: password,
    telefono: document.getElementById("telefonoUsuario").value.trim(),
    fechaNacimiento: document.getElementById("fechaNacimientoUsuario").value,
    tipo: tipo,
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

// Recibe: un usuario editado, ya validado.
// Hace: busca en localStorage al usuario con el mismo RUN y lo reemplaza por
//       el nuevo, en la misma posición de la lista.
// Devuelve: true si lo reemplazó; false si el usuario ya no existe (por
//           ejemplo, si se eliminó desde otra pestaña mientras se editaba).
function guardarCambiosUsuario(usuarioEditado) {
  const usuarios = leerDeStorage(CLAVE_USUARIOS);

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].run === usuarioEditado.run) {
      usuarios[i] = usuarioEditado;
      guardarEnStorage(CLAVE_USUARIOS, usuarios);
      return true;
    }
  }

  return false;
}

// Recibe: el usuario recién guardado.
// Hace: si es el mismo que tiene la sesión iniciada, vuelve a escribir la
//       sesión con sus datos nuevos. Así el saludo ("Hola, ...") y el
//       correo de la sesión coinciden con lo que se acaba de guardar.
// Devuelve: nada.
function actualizarSesionSiEsLaPropia(usuario) {
  if (usuario.run !== obtenerSesion().run) {
    return;
  }

  guardarEnStorage(CLAVE_SESION, {
    run: usuario.run,
    nombre: usuario.nombre,
    correo: usuario.correo,
    tipo: usuario.tipo
  });
}

// Recibe: el evento "submit" del formulario.
// Hace: detiene el envío normal (que recargaría la página) y valida todos
//       los campos. Si alguno tiene error, pone el cursor en el primero.
//       Si todo está bien, guarda (agrega en modo Nuevo, reemplaza en modo
//       Editar) y vuelve al listado con un aviso, cuyo código viaja en
//       la URL.
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

  const usuario = leerUsuarioDelFormulario();

  if (usuarioEnEdicion === null) {
    guardarUsuarioNuevo(usuario);
    irAPagina("usuarios.html?aviso=usuario-creado");
    return;
  }

  if (!guardarCambiosUsuario(usuario)) {
    mostrarAvisoPanel("No se pudo guardar: el usuario ya no existe. Vuelve al listado.");
    return;
  }

  // Se recuerda la versión recién guardada. Así, si el formulario se
  // enviara otra vez antes de cambiar de página, usaría los datos nuevos
  // (por ejemplo, la contraseña que se acaba de cambiar) y no los antiguos.
  usuarioEnEdicion = usuario;

  actualizarSesionSiEsLaPropia(usuario);
  irAPagina("usuarios.html?aviso=usuario-actualizado");
}

// ==========================================================
// 4. Modo Editar
// ==========================================================

// Recibe: el usuario que se va a editar.
// Hace: deja el formulario en modo Editar: cambia los títulos, escribe los
//       datos actuales en los campos y bloquea el RUN, que es el
//       identificador del usuario. Las contraseñas parten vacías: la
//       contraseña guardada nunca se escribe en la página.
//       Si el Administrador edita su propia cuenta, bloquea también el
//       tipo, para que no pueda quitarse a sí mismo el acceso al panel.
// Devuelve: nada.
function prepararModoEditarUsuario(usuario) {
  document.getElementById("tituloFormulario").textContent = "Editar usuario";
  document.title = "Editar a " + usuario.nombre + " " + usuario.apellidos + " | Panel AndesTrekking";

  const campoRun = document.getElementById("runUsuario");
  campoRun.value = usuario.run;
  campoRun.disabled = true; // un campo deshabilitado no se puede modificar
  document.getElementById("ayudaRunUsuario").textContent = "El RUN no se puede cambiar.";

  document.getElementById("nombreUsuario").value = usuario.nombre;
  document.getElementById("apellidosUsuario").value = usuario.apellidos;
  document.getElementById("telefonoUsuario").value = usuario.telefono;
  document.getElementById("fechaNacimientoUsuario").value = usuario.fechaNacimiento;
  document.getElementById("tipoUsuario").value = usuario.tipo;
  document.getElementById("direccionUsuario").value = usuario.direccion;

  // El correo y su confirmación parten iguales: solo hay que volver a
  // escribirlos si se quiere cambiar el correo
  document.getElementById("correoUsuario").value = usuario.correo;
  document.getElementById("confirmarCorreoUsuario").value = usuario.correo;

  document.getElementById("ayudaPasswordUsuario").textContent =
    "Déjala vacía para conservar la contraseña actual. Si la cambias, entre 4 y 10 caracteres.";

  // Primero la región; con ella se cargan sus comunas y recién entonces
  // se puede elegir la comuna del usuario
  document.getElementById("regionUsuario").value = usuario.region;
  cargarComunasUsuario();
  document.getElementById("comunaUsuario").value = usuario.comuna;

  if (estaEditandoSuPropiaCuenta()) {
    document.getElementById("tipoUsuario").disabled = true;
    document.getElementById("ayudaTipoUsuario").textContent = "No puedes cambiar el tipo de tu propia cuenta.";
  }
}

// Recibe: nada.
// Hace: reemplaza el formulario por un aviso cuando el RUN de la URL no
//       corresponde a ningún usuario.
// Devuelve: nada.
function mostrarUsuarioAEditarNoEncontrado() {
  document.getElementById("formularioUsuario").remove();
  document.getElementById("tituloFormulario").textContent = "Usuario no encontrado";
  document.title = "Usuario no encontrado | Panel AndesTrekking";

  mostrarAvisoPanel("El usuario que quieres editar no existe o fue eliminado. Vuelve al listado para elegir otro.");
}

// ==========================================================
// 5. Inicio de la página
// ==========================================================

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel, con el Administrador como
//       único rol permitido. La opción del menú que se marca es "usuarios",
//       porque el formulario pertenece a esa sección. Después llena las
//       regiones, revisa si la URL trae un RUN (modo Editar) y conecta
//       cada campo y el envío con sus funciones.
// Devuelve: nada.
function iniciarFormularioUsuario() {
  const puedeVerLaPagina = iniciarPanel([ROL_ADMINISTRADOR], "usuarios");

  if (!puedeVerLaPagina) {
    return;
  }

  cargarRegionesUsuario();

  // Si la URL trae ?run=..., el formulario pasa a modo Editar
  const run = obtenerParametroUrl("run");

  if (run !== null) {
    const usuario = buscarUsuarioPorRun(run);

    if (usuario === null) {
      mostrarUsuarioAEditarNoEncontrado();
      return;
    }

    usuarioEnEdicion = usuario;
    prepararModoEditarUsuario(usuario);
  }

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
