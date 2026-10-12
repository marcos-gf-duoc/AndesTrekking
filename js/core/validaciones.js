/*
  Archivo: js/core/validaciones.js
  Qué es: funciones que revisan si un dato escrito por el usuario es válido.
  Quién lo usa: los formularios de la tienda (contacto, newsletter, registro,
          login) y los del panel admin (usuarios y productos).
  Orden de carga: va con los archivos de js/core/, DESPUÉS de utils.js
          (validarFechaNacimiento usa obtenerFechaDeHoy) y antes del
          script común.

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

// ==========================================================
// Contraseña, teléfono y fecha de nacimiento
// ==========================================================

// Largo permitido de la contraseña
const LARGO_MINIMO_PASSWORD = 4;
const LARGO_MAXIMO_PASSWORD = 10;

// Recibe: el valor del campo contraseña y si es obligatoria (true) u
//         opcional (false). Es opcional al editar un usuario: si se deja
//         vacía, se conserva la contraseña anterior.
// Hace: revisa que no esté vacía (solo si es obligatoria) y que tenga entre
//       4 y 10 caracteres. No usa trim: en una contraseña los espacios
//       también son caracteres.
// Devuelve: el mensaje de error, o "" si la contraseña es válida.
function validarPassword(valor, esObligatoria) {
  if (valor === "") {
    if (esObligatoria) {
      return "Ingresa una contraseña.";
    }
    return ""; // vacía y opcional: es válida
  }

  if (valor.length < LARGO_MINIMO_PASSWORD || valor.length > LARGO_MAXIMO_PASSWORD) {
    return "La contraseña debe tener entre " + LARGO_MINIMO_PASSWORD + " y " + LARGO_MAXIMO_PASSWORD + " caracteres.";
  }

  return "";
}

// Recibe: el valor del campo "confirmar contraseña" y el valor del campo
//         contraseña.
// Hace: revisa que ambos sean iguales. Si los dos están vacíos no hay nada
//       que confirmar (pasa al editar un usuario sin cambiar su contraseña).
// Devuelve: el mensaje de error, o "" si coinciden.
function validarConfirmacionPassword(valor, passwordOriginal) {
  if (valor === "" && passwordOriginal === "") {
    return "";
  }

  if (valor === "") {
    return "Confirma la contraseña.";
  }

  if (valor !== passwordOriginal) {
    return "Las contraseñas no coinciden.";
  }

  return "";
}

// Recibe: el valor del campo teléfono, que es opcional.
// Hace: si tiene algo escrito, revisa que sean exactamente 9 dígitos y que
//       el primero sea un 9 (formato de un celular chileno).
// Devuelve: el mensaje de error, o "" si está vacío o es válido.
function validarTelefono(valor) {
  const telefono = valor.trim();

  if (telefono === "") {
    return "";
  }

  if (!esSoloDigitos(telefono) || telefono.length !== 9 || telefono[0] !== "9") {
    return "El teléfono debe tener 9 dígitos y empezar con 9.";
  }

  return "";
}

// Recibe: una fecha como texto.
// Hace: revisa que tenga la forma AAAA-MM-DD y que exista en el calendario
//       (por ejemplo, rechaza el 30 de febrero).
// Devuelve: true si es una fecha real con ese formato; false si no.
function esFechaReal(fecha) {
  // Forma: 10 caracteres, con guiones en las posiciones 4 y 7
  if (fecha.length !== 10 || fecha[4] !== "-" || fecha[7] !== "-") {
    return false;
  }

  const textoAnio = fecha.slice(0, 4);
  const textoMes = fecha.slice(5, 7);
  const textoDia = fecha.slice(8, 10);

  if (!esSoloDigitos(textoAnio) || !esSoloDigitos(textoMes) || !esSoloDigitos(textoDia)) {
    return false;
  }

  const anio = Number(textoAnio);
  const mes = Number(textoMes);
  const dia = Number(textoDia);

  // Se crea la fecha y se compara con lo ingresado. Si el día no existe,
  // JavaScript lo "corre" al mes siguiente (30 de febrero pasa a ser 2 de
  // marzo) y entonces el mes o el día ya no coinciden.
  const fechaCreada = new Date(anio, mes - 1, dia);

  return fechaCreada.getFullYear() === anio && fechaCreada.getMonth() === mes - 1 && fechaCreada.getDate() === dia;
}

// Recibe: el valor del campo fecha de nacimiento, que es opcional. El campo
//         type="date" entrega la fecha como AAAA-MM-DD.
// Hace: si tiene una fecha, revisa que sea real y que no sea futura.
//       Usa obtenerFechaDeHoy (js/core/utils.js).
// Devuelve: el mensaje de error, o "" si está vacía o es válida.
function validarFechaNacimiento(valor) {
  const fecha = valor.trim();

  if (fecha === "") {
    return "";
  }

  if (!esFechaReal(fecha)) {
    return "Ingresa una fecha válida.";
  }

  // Con el formato AAAA-MM-DD, comparar los textos equivale a comparar las
  // fechas: "2030-01-01" es mayor que "2026-10-12"
  if (fecha > obtenerFechaDeHoy()) {
    return "La fecha de nacimiento no puede ser futura.";
  }

  return "";
}
