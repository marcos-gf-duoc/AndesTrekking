/*
  Archivo: js/core/auth.js
  Qué es: funciones de autenticación: iniciar sesión, saber quién tiene la
          sesión iniciada y cerrarla.
  Quién lo usa: el login, el header de la tienda y todas las páginas del
          panel admin.
  Orden de carga: va con los archivos de js/core/, DESPUÉS de storage.js
          (usa leerDeStorage, guardarEnStorage y las claves) y de utils.js
          (usa irAPagina).

  ADVERTENCIA: esto es una simulación, no seguridad real. No hay servidor:
  los usuarios y sus contraseñas están en localStorage, en texto plano, y
  cualquiera puede verlos o cambiarlos desde las herramientas del navegador.
  Sirve para practicar el flujo de login y roles, no para proteger datos.
*/

// Tipos de usuario (roles). Se escriben una sola vez aquí para no repetir
// el texto, y no equivocarse, en el resto del sitio.
const ROL_ADMINISTRADOR = "Administrador";
const ROL_VENDEDOR = "Vendedor";
const ROL_CLIENTE = "Cliente";

// Recibe: un correo.
// Hace: lo busca entre los usuarios guardados en localStorage. Compara sin
//       espacios sobrantes y en minúsculas, igual que se guardan los correos.
// Devuelve: el usuario encontrado, o null si ningún usuario tiene ese correo.
function buscarUsuarioPorCorreo(correo) {
  const correoBuscado = correo.trim().toLowerCase();
  const usuarios = leerDeStorage(CLAVE_USUARIOS);

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo.toLowerCase() === correoBuscado) {
      return usuarios[i];
    }
  }

  return null;
}

// Recibe: el correo y la contraseña que escribió el usuario en el login.
// Hace: busca al usuario por su correo y compara la contraseña. Si ambos
//       coinciden, guarda la sesión en localStorage (clave at_sesion).
//       La sesión guarda solo los datos necesarios para reconocer al
//       usuario; la contraseña NO se copia a la sesión.
// Devuelve: la sesión creada { run, nombre, correo, tipo }, o null si el
//           correo no existe o la contraseña no coincide. No distingue
//           entre los dos casos: así el login puede mostrar un solo
//           mensaje genérico y no revela qué correos están registrados.
function iniciarSesion(correo, password) {
  const usuario = buscarUsuarioPorCorreo(correo);

  if (usuario === null || usuario.password !== password) {
    return null;
  }

  const sesion = {
    run: usuario.run,
    nombre: usuario.nombre,
    correo: usuario.correo,
    tipo: usuario.tipo
  };

  guardarEnStorage(CLAVE_SESION, sesion);
  return sesion;
}

// Recibe: nada.
// Hace: lee la sesión guardada en localStorage.
// Devuelve: la sesión { run, nombre, correo, tipo } si hay un usuario con
//           la sesión iniciada, o null si no hay nadie.
function obtenerSesion() {
  const sesion = leerDeStorage(CLAVE_SESION);

  // Si la clave no existe, leerDeStorage ya devuelve null. Además se
  // descarta cualquier dato que no tenga la forma de una sesión (por
  // ejemplo, si alguien editó la clave a mano).
  if (sesion === null || typeof sesion !== "object" || typeof sesion.tipo !== "string") {
    return null;
  }

  return sesion;
}

// Recibe: nada.
// Hace: cierra la sesión, borrando la clave at_sesion de localStorage.
//       No toca el carrito ni los demás datos.
// Devuelve: nada.
function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

// ==========================================================
// Protección de las páginas del panel admin
// ==========================================================

// Recibe: un arreglo con los roles que pueden ver la página, por ejemplo
//         [ROL_ADMINISTRADOR] o [ROL_ADMINISTRADOR, ROL_VENDEDOR].
// Hace: revisa la sesión y, si el usuario no puede ver la página, lo
//       redirige:
//       1. Sin sesión: al login de la tienda, con el aviso "sesion".
//       2. Cliente (o un rol desconocido): al inicio de la tienda, con el
//          aviso "permisos". Los clientes no entran al panel.
//       3. Vendedor en una página que no le corresponde: al inicio del
//          panel.
//       Se llama al comienzo de cada página de la carpeta admin/. Por eso
//       las rutas a la tienda llevan "../" (subir una carpeta) y la ruta
//       al inicio del panel es "index.html" (la misma carpeta).
//       El aviso viaja como un código en la URL (?aviso=...); el texto que
//       ve el usuario lo decide la página de destino (tienda-comun.js).
// Devuelve: true si el usuario puede ver la página; false si fue
//           redirigido. Con false, la página no debe mostrar su contenido.
function protegerPagina(rolesPermitidos) {
  const sesion = obtenerSesion();

  if (sesion === null) {
    irAPagina("../login.html?aviso=sesion");
    return false;
  }

  const esAdministrador = sesion.tipo === ROL_ADMINISTRADOR;
  const esVendedor = sesion.tipo === ROL_VENDEDOR;

  if (!esAdministrador && !esVendedor) {
    irAPagina("../index.html?aviso=permisos");
    return false;
  }

  // indexOf devuelve -1 cuando el rol no está en la lista de permitidos
  if (rolesPermitidos.indexOf(sesion.tipo) === -1) {
    irAPagina("index.html");
    return false;
  }

  return true;
}
