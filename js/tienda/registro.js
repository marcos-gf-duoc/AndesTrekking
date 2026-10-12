/*
  Archivo: js/tienda/registro.js
  Qué es: script propio del formulario de registro.
  Quién lo usa: solo registro.html.
  Orden de carga: va al final, DESPUÉS de js/tienda/tienda-comun.js.
          Usa REGIONES (js/data/regiones.js) y las funciones de
          js/core/utils.js.

  Parte 1 (este bloque): selects de Región y Comuna.
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
// Inicio de la página
// ==========================================================

// Recibe: nada.
// Hace: prepara el formulario: llena las regiones y deja conectado el
//       select de Región para que, al cambiar ("change"), se recarguen
//       las comunas.
// Devuelve: nada.
function iniciarRegistro() {
  cargarRegiones();

  const selectRegion = document.getElementById("regionRegistro");
  selectRegion.addEventListener("change", cargarComunas);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarRegistro();
