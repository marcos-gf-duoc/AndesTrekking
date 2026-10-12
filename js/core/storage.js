/*
  Archivo: js/core/storage.js
  Qué es: funciones para leer y guardar los datos del sitio en localStorage,
          y para crear los datos iniciales la primera vez que se abre.
  Quién lo usa: todas las páginas de la tienda y del panel admin.
  Orden de carga: va DESPUÉS de los archivos de js/data/, porque usa
          PRODUCTOS_INICIALES, USUARIOS_INICIALES y ORDENES_INICIALES.

  Sobre localStorage: es un espacio del navegador que guarda textos con un
  nombre (clave) y no se borra al cerrar la página. Como solo guarda textos,
  los arreglos y objetos se convierten con JSON.stringify al guardar y se
  recuperan con JSON.parse al leer.
*/

// Nombres de las claves de localStorage. Se escriben una sola vez aquí
// para no repetir el texto (y no equivocarse) en el resto del sitio.
const CLAVE_PRODUCTOS = "at_productos";       // arreglo de productos
const CLAVE_USUARIOS = "at_usuarios";         // arreglo de usuarios
const CLAVE_ORDENES = "at_ordenes";           // arreglo de órdenes
const CLAVE_MENSAJES = "at_mensajes";         // arreglo de mensajes de contacto
const CLAVE_CARRITO = "at_carrito";           // arreglo de { codigo, cantidad }
const CLAVE_SUSCRIPTORES = "at_suscriptores"; // arreglo de correos de la newsletter
const CLAVE_CUPON = "at_cupon";               // código del cupón aplicado, o null
const CLAVE_SESION = "at_sesion";             // { run, nombre, correo, tipo }, o null

// Recibe: el nombre de una clave.
// Hace: busca esa clave en localStorage y convierte su texto en un dato.
// Devuelve: el dato guardado (arreglo, objeto o texto), o null si la clave
//           no existe o si su contenido está dañado.
function leerDeStorage(clave) {
  const textoGuardado = localStorage.getItem(clave);

  // getItem devuelve null cuando la clave no existe
  if (textoGuardado === null) {
    return null;
  }

  // JSON.parse falla si el texto no es JSON válido (por ejemplo, si alguien
  // lo editó a mano en DevTools). En ese caso se devuelve null.
  try {
    return JSON.parse(textoGuardado);
  } catch (error) {
    return null;
  }
}

// Recibe: el nombre de una clave y el dato que se quiere guardar.
// Hace: convierte el dato en texto y lo guarda en localStorage.
// Devuelve: nada.
function guardarEnStorage(clave, valor) {
  const textoParaGuardar = JSON.stringify(valor);
  localStorage.setItem(clave, textoParaGuardar);
}

// Recibe: el nombre de una clave y su valor inicial.
// Hace: guarda el valor inicial solo si la clave todavía no tiene un dato
//       válido. Si ya tiene datos, no los toca.
// Devuelve: nada.
function crearClaveSiNoExiste(clave, valorInicial) {
  if (leerDeStorage(clave) === null) {
    guardarEnStorage(clave, valorInicial);
  }
}

// Recibe: nada.
// Hace: revisa las claves que guardan arreglos y crea las que falten.
//       Productos, usuarios y órdenes parten con sus semillas; el resto
//       parte como un arreglo vacío.
//       at_cupon y at_sesion no se crean aquí: si no existen, leerDeStorage
//       devuelve null, que justamente significa "sin cupón" y "sin sesión".
// Devuelve: nada.
function cargarSemillas() {
  crearClaveSiNoExiste(CLAVE_PRODUCTOS, PRODUCTOS_INICIALES);
  crearClaveSiNoExiste(CLAVE_USUARIOS, USUARIOS_INICIALES);
  crearClaveSiNoExiste(CLAVE_ORDENES, ORDENES_INICIALES);
  crearClaveSiNoExiste(CLAVE_MENSAJES, []);
  crearClaveSiNoExiste(CLAVE_CARRITO, []);
  crearClaveSiNoExiste(CLAVE_SUSCRIPTORES, []);
}

// Recibe: nada.
// Hace: borra las ocho claves del sitio y vuelve a cargar las semillas.
//       Deja el sitio como la primera vez que se abrió: se pierden los
//       cambios hechos, el carrito, el cupón y también la sesión iniciada.
// Devuelve: nada.
function restablecerDatosDemo() {
  localStorage.removeItem(CLAVE_PRODUCTOS);
  localStorage.removeItem(CLAVE_USUARIOS);
  localStorage.removeItem(CLAVE_ORDENES);
  localStorage.removeItem(CLAVE_MENSAJES);
  localStorage.removeItem(CLAVE_CARRITO);
  localStorage.removeItem(CLAVE_SUSCRIPTORES);
  localStorage.removeItem(CLAVE_CUPON);
  localStorage.removeItem(CLAVE_SESION);

  cargarSemillas();
}

// Se ejecuta al cargar este archivo, es decir, en cada página del sitio:
// así los datos existen antes de que el script de la página los necesite.
cargarSemillas();
