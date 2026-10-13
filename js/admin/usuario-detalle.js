/*
  Archivo: js/admin/usuario-detalle.js
  Qué es: script propio de la página que muestra un usuario en el panel,
          en solo lectura.
  Quién lo usa: solo admin/usuario-detalle.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: solo el Administrador.

  Cómo funciona: la página se abre con el RUN en la URL, por ejemplo
  usuario-detalle.html?run=19011001K. El script busca ese usuario en
  localStorage y escribe sus datos en los elementos de la página.
  La contraseña nunca se muestra.
*/

// Recibe: el id de un elemento de la página y el valor de un dato.
// Hace: escribe el valor en ese elemento. Si el dato está vacío (pasa con
//       los campos opcionales, como el teléfono), escribe "No informado".
// Devuelve: nada.
function escribirDato(idElemento, valor) {
  let texto = valor;

  if (texto === "") {
    texto = "No informado";
  }

  // textContent escribe texto puro: el dato se muestra tal cual
  document.getElementById(idElemento).textContent = texto;
}

// Recibe: un usuario.
// Hace: escribe sus datos en la página y pone su nombre en el título.
//       No escribe la contraseña en ninguna parte.
// Devuelve: nada.
function mostrarDatosUsuario(usuario) {
  const nombreCompleto = usuario.nombre + " " + usuario.apellidos;

  document.getElementById("tituloDetalle").textContent = nombreCompleto;
  document.title = nombreCompleto + " | Panel AndesTrekking";

  escribirDato("datoRun", usuario.run);
  escribirDato("datoNombre", usuario.nombre);
  escribirDato("datoApellidos", usuario.apellidos);
  escribirDato("datoCorreo", usuario.correo);
  escribirDato("datoTipo", usuario.tipo);
  escribirDato("datoTelefono", usuario.telefono);
  // La fecha se guarda como AAAA-MM-DD y se muestra como DD-MM-AAAA
  escribirDato("datoFechaNacimiento", formatearFecha(usuario.fechaNacimiento));
  escribirDato("datoRegion", usuario.region);
  escribirDato("datoComuna", usuario.comuna);
  escribirDato("datoDireccion", usuario.direccion);
}

// Recibe: un usuario.
// Hace: agrega el botón "Editar", que lleva al formulario con el RUN del
//       usuario en la URL. Si el usuario es el mismo que tiene la sesión
//       iniciada, agrega además la etiqueta "Tu cuenta".
// Devuelve: nada.
function mostrarAccionesUsuario(usuario) {
  const acciones = document.getElementById("accionesDetalle");

  const enlace = document.createElement("a");
  enlace.className = "btn boton-principal";
  enlace.href = "usuario-form.html?run=" + encodeURIComponent(usuario.run);

  const icono = document.createElement("i");
  icono.className = "bi bi-pencil";
  icono.setAttribute("aria-hidden", "true");

  enlace.appendChild(icono);
  enlace.appendChild(document.createTextNode(" Editar"));
  acciones.appendChild(enlace);

  if (usuario.run === obtenerSesion().run) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-cuenta";
    etiqueta.textContent = "Tu cuenta";
    document.getElementById("tituloDetalle").appendChild(document.createTextNode(" "));
    document.getElementById("tituloDetalle").appendChild(etiqueta);
  }
}

// Recibe: nada.
// Hace: reemplaza el detalle por un aviso cuando el RUN de la URL no
//       corresponde a ningún usuario.
// Devuelve: nada.
function mostrarUsuarioNoEncontrado() {
  document.getElementById("detalleUsuario").remove();
  document.getElementById("tituloDetalle").textContent = "Usuario no encontrado";
  document.title = "Usuario no encontrado | Panel AndesTrekking";

  mostrarAvisoPanel("El usuario que buscas no existe o fue eliminado. Vuelve al listado para elegir otro.");
}

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel, con el Administrador como
//       único rol permitido. Después lee el RUN de la URL, busca al usuario
//       y muestra su detalle o el aviso de que no existe.
// Devuelve: nada.
function iniciarDetalleUsuarioAdmin() {
  const puedeVerLaPagina = iniciarPanel([ROL_ADMINISTRADOR], "usuarios");

  if (!puedeVerLaPagina) {
    return;
  }

  const run = obtenerParametroUrl("run");

  let usuario = null;
  if (run !== null) {
    usuario = buscarUsuarioPorRun(run);
  }

  if (usuario === null) {
    mostrarUsuarioNoEncontrado();
    return;
  }

  mostrarDatosUsuario(usuario);
  mostrarAccionesUsuario(usuario);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarDetalleUsuarioAdmin();
