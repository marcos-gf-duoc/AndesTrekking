/*
  Archivo: js/core/validaciones.js
  Qué es: funciones que revisan si un dato escrito por el usuario es válido.
  Quién lo usa: los formularios de la tienda (contacto, newsletter, registro,
          login) y los del panel admin (usuarios y productos).
  Orden de carga: va con los archivos de js/core/, antes del script común.

  Cómo se usan: todas las funciones reciben el valor a revisar y DEVUELVEN
  UN TEXTO:
    - el mensaje de error, si el valor no es válido;
    - un texto vacío "", si el valor es válido.
  Son funciones "puras": no leen ni cambian la página, solo calculan.
  Mostrar el mensaje en pantalla es tarea de otras funciones (utils.js).
*/

// Dominios de correo aceptados en todo el sitio (regla del enunciado)
const DOMINIOS_PERMITIDOS = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];

// Largo máximo de un correo
const LARGO_MAXIMO_CORREO = 100;

// Recibe: el valor de un campo de texto, su largo máximo y el nombre del
//         campo tal como se nombrará en el mensaje (por ejemplo "tu nombre").
// Hace: revisa que el texto no esté vacío y que no supere el largo máximo.
//       Antes quita los espacios del inicio y del final (trim), para que un
//       campo con solo espacios cuente como vacío.
// Devuelve: el mensaje de error, o "" si el texto es válido.
function validarTextoRequerido(valor, largoMaximo, nombreCampo) {
  const texto = valor.trim();

  if (texto === "") {
    return "Ingresa " + nombreCampo + ".";
  }

  if (texto.length > largoMaximo) {
    return "Máximo " + largoMaximo + " caracteres (llevas " + texto.length + ").";
  }

  return "";
}

// Recibe: el valor de un campo de texto que se puede dejar vacío y su largo
//         máximo.
// Hace: si el campo tiene texto, revisa que no supere el largo máximo.
// Devuelve: el mensaje de error, o "" si está vacío o es válido.
function validarTextoOpcional(valor, largoMaximo) {
  const texto = valor.trim();

  if (texto.length > largoMaximo) {
    return "Máximo " + largoMaximo + " caracteres (llevas " + texto.length + ").";
  }

  return "";
}

// Recibe: el valor de un campo de correo y si el campo es obligatorio
//         (true) u opcional (false).
// Hace: revisa, en este orden:
//       1. que no esté vacío (solo si es obligatorio);
//       2. que no supere los 100 caracteres;
//       3. que tenga la forma nombre@dominio, sin espacios;
//       4. que el dominio sea uno de DOMINIOS_PERMITIDOS.
// Devuelve: el mensaje de error, o "" si el correo es válido.
function validarCorreo(valor, esObligatorio) {
  const correo = valor.trim();

  if (correo === "") {
    if (esObligatorio) {
      return "Ingresa tu correo.";
    }
    return ""; // vacío y opcional: es válido
  }

  if (correo.length > LARGO_MAXIMO_CORREO) {
    return "El correo no puede superar los " + LARGO_MAXIMO_CORREO + " caracteres.";
  }

  // split("@") corta el texto en cada arroba. Un correo correcto queda en
  // exactamente 2 partes: lo que va antes de la arroba y lo que va después.
  const partes = correo.split("@");
  const tieneEspacios = correo.indexOf(" ") !== -1;

  if (partes.length !== 2 || partes[0] === "" || partes[1] === "" || tieneEspacios) {
    return "Escribe un correo válido, por ejemplo nombre@gmail.com.";
  }

  // Se compara en minúsculas para aceptar también "@GMAIL.COM"
  const dominio = "@" + partes[1].toLowerCase();

  if (DOMINIOS_PERMITIDOS.indexOf(dominio) === -1) {
    return "El correo debe terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  }

  return "";
}

// Recibe: el valor del campo "confirmar correo" y el valor del campo correo.
// Hace: revisa que la confirmación no esté vacía y que sea igual al correo.
//       Compara sin espacios sobrantes y en minúsculas, igual que se guarda.
// Devuelve: el mensaje de error, o "" si ambos coinciden.
function validarConfirmacionCorreo(valor, correoOriginal) {
  const confirmacion = valor.trim().toLowerCase();
  const correo = correoOriginal.trim().toLowerCase();

  if (confirmacion === "") {
    return "Confirma tu correo.";
  }

  if (confirmacion !== correo) {
    return "Los correos no coinciden.";
  }

  return "";
}
