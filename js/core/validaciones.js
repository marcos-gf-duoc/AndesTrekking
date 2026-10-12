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

// ==========================================================
// RUN chileno (módulo 11)
// ==========================================================

// Largo permitido del RUN completo, contando el dígito verificador
const LARGO_MINIMO_RUN = 7;
const LARGO_MAXIMO_RUN = 9;

// Recibe: un texto.
// Hace: revisa, carácter por carácter, que todos sean dígitos del 0 al 9.
// Devuelve: true si el texto tiene solo dígitos; false si tiene cualquier
//           otro carácter o si está vacío.
function esSoloDigitos(texto) {
  if (texto === "") {
    return false;
  }

  for (let i = 0; i < texto.length; i++) {
    const caracter = texto[i];
    if (caracter < "0" || caracter > "9") {
      return false;
    }
  }

  return true;
}

// Recibe: un RUN tal como lo escribió el usuario.
// Hace: quita los espacios del inicio y del final, y pasa las letras a
//       mayúscula (para que "k" y "K" valgan lo mismo).
// Devuelve: el RUN normalizado. Así es como se guarda y se compara.
function normalizarRun(valor) {
  return valor.trim().toUpperCase();
}

// Recibe: el cuerpo de un RUN, es decir, todos sus dígitos menos el último
//         (por ejemplo "12345678").
// Hace: calcula el dígito verificador con el algoritmo de módulo 11:
//       1. Recorre el cuerpo de derecha a izquierda.
//       2. Multiplica cada dígito por la serie 2, 3, 4, 5, 6, 7, que
//          vuelve a 2 después del 7, y suma todos los resultados.
//       3. Calcula 11 menos el resto de dividir la suma por 11.
//       4. Si da 11, el dígito es "0"; si da 10, es "K"; si no, es ese número.
// Devuelve: el dígito verificador esperado, como texto ("0" a "9" o "K").
function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let multiplicador = 2;

  // i parte en la última posición y retrocede hasta la primera
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    const digito = Number(cuerpo[i]);
    suma = suma + digito * multiplicador;

    // Avanza la serie: 2, 3, 4, 5, 6, 7 y de vuelta a 2
    multiplicador = multiplicador + 1;
    if (multiplicador > 7) {
      multiplicador = 2;
    }
  }

  // El operador % entrega el resto de la división
  const resultado = 11 - (suma % 11);

  if (resultado === 11) {
    return "0";
  }
  if (resultado === 10) {
    return "K";
  }
  return String(resultado);
}

// Recibe: el valor del campo RUN.
// Hace: revisa, en este orden:
//       1. que no esté vacío;
//       2. que no tenga puntos, guiones ni espacios;
//       3. que el cuerpo tenga solo dígitos y el último carácter sea un
//          dígito o la letra K;
//       4. que tenga entre 7 y 9 caracteres;
//       5. que el dígito verificador sea el que entrega el módulo 11.
//       No revisa si el RUN ya está registrado: eso depende de los datos
//       guardados y lo hace cada formulario.
// Devuelve: el mensaje de error, o "" si el RUN es válido.
function validarRun(valor) {
  const run = normalizarRun(valor);

  if (run === "") {
    return "Ingresa tu RUN.";
  }

  if (run.indexOf(".") !== -1 || run.indexOf("-") !== -1 || run.indexOf(" ") !== -1) {
    return "Escribe el RUN sin puntos ni guion.";
  }

  // slice(0, -1) entrega todo menos el último carácter; slice(-1), solo el último
  const cuerpo = run.slice(0, -1);
  const digitoIngresado = run.slice(-1);
  const digitoTieneFormaValida = esSoloDigitos(digitoIngresado) || digitoIngresado === "K";

  if (!esSoloDigitos(cuerpo) || !digitoTieneFormaValida) {
    return "El RUN solo lleva números y, al final, un número o la letra K.";
  }

  if (run.length < LARGO_MINIMO_RUN || run.length > LARGO_MAXIMO_RUN) {
    return "El RUN debe tener entre " + LARGO_MINIMO_RUN + " y " + LARGO_MAXIMO_RUN + " caracteres.";
  }

  if (calcularDigitoVerificador(cuerpo) !== digitoIngresado) {
    return "El dígito verificador no es correcto.";
  }

  return "";
}
