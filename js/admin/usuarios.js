/*
  Archivo: js/admin/usuarios.js
  Qué es: script propio del listado de usuarios del panel de administración.
  Quién lo usa: solo admin/usuarios.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: solo el Administrador. Un Vendedor que escriba
          la dirección a mano es redirigido al inicio del panel.

  La tabla usa las funciones generales de tablas y paginación de
  admin-comun.js. Por seguridad, el listado nunca muestra las contraseñas.
*/

// Usuarios que se están listando y página que se está viendo. Se guardan
// en variables fuera de las funciones para que los botones de paginación
// puedan usarlas al hacer clic. Se declaran con let porque cambian.
let usuariosDelListado = [];
let paginaActual = 1;

// Recibe: un usuario.
// Hace: une su nombre y sus apellidos.
// Devuelve: el nombre completo, por ejemplo "Camila Soto Fuentes".
function obtenerNombreCompleto(usuario) {
  return usuario.nombre + " " + usuario.apellidos;
}

// Recibe: el texto del enlace, la página a la que lleva (sin el RUN) y el
//         usuario.
// Hace: crea un enlace de acción de la tabla, con el RUN del usuario en la
//       URL. aria-label agrega el nombre: sin eso, un lector de pantalla
//       leería varios enlaces iguales que dicen "Ver".
// Devuelve: el enlace creado.
function crearEnlaceAccionUsuario(texto, pagina, usuario) {
  const enlace = document.createElement("a");
  enlace.className = "panel-boton-chico";
  enlace.href = pagina + "?run=" + encodeURIComponent(usuario.run);
  enlace.textContent = texto;
  enlace.setAttribute("aria-label", texto + " a " + obtenerNombreCompleto(usuario));
  return enlace;
}

// Recibe: un usuario.
// Hace: crea la celda de acciones de su fila, con "Ver" y "Editar".
// Devuelve: la celda creada.
function crearCeldaAccionesUsuario(usuario) {
  const celda = document.createElement("td");
  celda.className = "celda-acciones";

  celda.appendChild(crearEnlaceAccionUsuario("Ver", "usuario-detalle.html", usuario));
  celda.appendChild(crearEnlaceAccionUsuario("Editar", "usuario-form.html", usuario));

  return celda;
}

// Recibe: un usuario.
// Hace: crea la fila de la tabla (<tr>) con sus celdas: RUN, nombre
//       completo, correo, tipo y acciones. La contraseña no se muestra.
// Devuelve: la fila creada.
function crearFilaUsuario(usuario) {
  const fila = document.createElement("tr");

  fila.appendChild(crearCelda(usuario.run));
  fila.appendChild(crearCelda(obtenerNombreCompleto(usuario)));
  fila.appendChild(crearCelda(usuario.correo));
  fila.appendChild(crearCelda(usuario.tipo));
  fila.appendChild(crearCeldaAccionesUsuario(usuario));

  return fila;
}

// Recibe: un arreglo de usuarios.
// Hace: borra las filas que tuviera la tabla y dibuja una por cada usuario.
//       Si el arreglo está vacío, muestra una sola fila con un aviso.
// Devuelve: nada.
function mostrarTablaUsuarios(usuarios) {
  const cuerpoTabla = document.getElementById("cuerpoTablaUsuarios");
  cuerpoTabla.innerHTML = "";

  if (usuarios.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda("No hay usuarios registrados.");
    celda.colSpan = 5; // la celda ocupa las 5 columnas de la tabla
    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
    return;
  }

  usuarios.forEach(function (usuario) {
    cuerpoTabla.appendChild(crearFilaUsuario(usuario));
  });
}

// Recibe: un arreglo de usuarios.
// Hace: escribe sobre la tabla cuántos usuarios hay en total y cuántos de
//       cada tipo.
// Devuelve: nada.
function mostrarResumenUsuarios(usuarios) {
  let administradores = 0;
  let vendedores = 0;
  let clientes = 0;

  usuarios.forEach(function (usuario) {
    if (usuario.tipo === ROL_ADMINISTRADOR) {
      administradores = administradores + 1;
    } else if (usuario.tipo === ROL_VENDEDOR) {
      vendedores = vendedores + 1;
    } else {
      clientes = clientes + 1;
    }
  });

  const texto = "Usuarios registrados: " + usuarios.length + ". Administradores: " + administradores +
    ". Vendedores: " + vendedores + ". Clientes: " + clientes + ".";
  document.getElementById("resumenUsuarios").textContent = texto;
}

// Recibe: nada.
// Hace: agrega sobre la tabla el botón "Nuevo usuario", que lleva al
//       formulario vacío.
// Devuelve: nada.
function mostrarBotonNuevoUsuario() {
  const enlace = document.createElement("a");
  enlace.className = "btn boton-principal";
  enlace.href = "usuario-form.html";

  const icono = document.createElement("i");
  icono.className = "bi bi-plus-lg";
  icono.setAttribute("aria-hidden", "true");

  enlace.appendChild(icono);
  enlace.appendChild(document.createTextNode(" Nuevo usuario"));

  document.getElementById("accionesListado").appendChild(enlace);
}

// Recibe: el número de la página que se quiere ver.
// Hace: muestra esa página de usuariosDelListado: actualiza la tabla, el
//       texto y los botones, con las funciones de paginación de
//       admin-comun.js. Esta misma función se entrega a los botones, para
//       que la llamen al hacer clic.
// Devuelve: nada.
function mostrarPagina(numeroPagina) {
  const cantidad = usuariosDelListado.length;

  paginaActual = ajustarNumeroDePagina(numeroPagina, cantidad);

  mostrarTablaUsuarios(obtenerElementosDePagina(usuariosDelListado, paginaActual));
  mostrarTextoPaginacion(paginaActual, cantidad, "usuario", "usuarios");
  mostrarBotonesPaginacion(paginaActual, calcularTotalPaginas(cantidad), mostrarPagina);
}

// Recibe: nada.
// Hace: prepara la página. Lo primero es iniciarPanel, con el Administrador
//       como único rol permitido. Si puede seguir, lee los usuarios de
//       localStorage y muestra el botón, el resumen y la primera página.
// Devuelve: nada.
function iniciarUsuariosAdmin() {
  const puedeVerLaPagina = iniciarPanel([ROL_ADMINISTRADOR], "usuarios");

  if (!puedeVerLaPagina) {
    return;
  }

  usuariosDelListado = leerDeStorage(CLAVE_USUARIOS);
  mostrarBotonNuevoUsuario();
  mostrarResumenUsuarios(usuariosDelListado);
  mostrarPagina(1);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarUsuariosAdmin();
