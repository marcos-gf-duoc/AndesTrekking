/*
  Archivo: js/admin/producto-form.js
  Qué es: script propio del formulario de producto del panel. El mismo
          formulario sirve para crear un producto y para editar uno.
  Quién lo usa: solo admin/producto-form.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: solo el Administrador. Un Vendedor que escriba
          la dirección a mano es redirigido al inicio del panel.

  Tiene cuatro partes:
    1. Selects, vista previa y contador.
    2. Validación de cada campo (una función por campo).
    3. Guardado del producto y envío del formulario.
    4. Inicio de la página (conexión de los eventos).
*/

// Largos máximos de los campos de texto (regla del enunciado)
const LARGO_MAXIMO_NOMBRE_PRODUCTO = 100;
const LARGO_MAXIMO_DESCRIPCION = 500;

// ==========================================================
// 1. Selects, vista previa y contador
// ==========================================================

// Recibe: nada.
// Hace: agrega al select de Categoría una opción por cada categoría de
//       CATEGORIAS (js/data/productos.js).
// Devuelve: nada.
function cargarCategorias() {
  const select = document.getElementById("categoriaProducto");

  CATEGORIAS.forEach(function (categoria) {
    select.appendChild(crearOpcion(categoria, categoria));
  });
}

// Recibe: nada.
// Hace: agrega al select de Imagen una opción por cada archivo de
//       IMAGENES_PRODUCTOS (js/data/productos.js).
// Devuelve: nada.
function cargarImagenes() {
  const select = document.getElementById("imagenProducto");

  IMAGENES_PRODUCTOS.forEach(function (nombreArchivo) {
    select.appendChild(crearOpcion(nombreArchivo, nombreArchivo));
  });
}

// Recibe: nada.
// Hace: muestra en la vista previa la imagen elegida en el select. Con
//       "Sin imagen" muestra la imagen de reemplazo, que es la que verá el
//       cliente en la tienda.
// Devuelve: nada.
function actualizarVistaPrevia() {
  const nombreArchivo = document.getElementById("imagenProducto").value;
  const vistaPrevia = document.getElementById("vistaPreviaImagen");

  if (nombreArchivo === "") {
    vistaPrevia.src = IMAGEN_DE_REEMPLAZO_PANEL;
    vistaPrevia.alt = "Vista previa: el producto no tiene imagen";
    return;
  }

  vistaPrevia.src = CARPETA_IMAGENES_PANEL + nombreArchivo;
  vistaPrevia.alt = "Vista previa de la imagen " + nombreArchivo;
}

// Recibe: nada.
// Hace: actualiza el contador de caracteres de la descripción ("120/500").
// Devuelve: nada.
function actualizarContadorDescripcion() {
  actualizarContador("descripcionProducto", "contadorDescripcionProducto", LARGO_MAXIMO_DESCRIPCION);
}

// ==========================================================
// 2. Validación de cada campo
// Cada función lee su campo, aplica la regla que le corresponde
// (js/core/validaciones.js) y muestra el resultado. Todas devuelven
// true si el campo quedó válido y false si quedó con error.
// ==========================================================

// Recibe: un código de producto.
// Hace: revisa si ya existe un producto con ese código. Compara sin
//       espacios sobrantes y en minúsculas: "moc-001" choca con "MOC-001".
// Devuelve: true si el código ya está en uso; false si está libre.
function existeCodigoProducto(codigo) {
  const codigoBuscado = codigo.trim().toLowerCase();
  const productos = leerDeStorage(CLAVE_PRODUCTOS);

  for (let i = 0; i < productos.length; i++) {
    if (productos[i].codigo.toLowerCase() === codigoBuscado) {
      return true;
    }
  }

  return false;
}

// Código: obligatorio, mínimo 3 caracteres y, además, único.
function validarCodigoFormulario() {
  const valor = document.getElementById("codigoProducto").value;
  let mensajeError = validarCodigoProducto(valor);

  // La unicidad se revisa solo si el código ya pasó las otras reglas
  if (mensajeError === "" && existeCodigoProducto(valor)) {
    mensajeError = "Ya existe un producto con este código.";
  }

  return mostrarResultadoCampo("codigoProducto", mensajeError);
}

// Nombre: obligatorio, máximo 100 caracteres.
function validarNombreFormulario() {
  const valor = document.getElementById("nombreProducto").value;
  const mensajeError = validarTextoRequerido(valor, LARGO_MAXIMO_NOMBRE_PRODUCTO, "el nombre");
  return mostrarResultadoCampo("nombreProducto", mensajeError);
}

// Descripción: opcional. Vacía queda sin marcas; con texto, máximo 500.
function validarDescripcionFormulario() {
  const valor = document.getElementById("descripcionProducto").value;

  if (valor.trim() === "") {
    limpiarEstadoCampo("descripcionProducto");
    return true;
  }

  const mensajeError = validarTextoOpcional(valor, LARGO_MAXIMO_DESCRIPCION);
  return mostrarResultadoCampo("descripcionProducto", mensajeError);
}

// Precio: obligatorio, número mayor o igual a 0, con hasta 2 decimales.
function validarPrecioFormulario() {
  const valor = document.getElementById("precioProducto").value;
  return mostrarResultadoCampo("precioProducto", validarPrecio(valor));
}

// Stock: obligatorio, entero mayor o igual a 0.
function validarStockFormulario() {
  const valor = document.getElementById("stockProducto").value;
  const mensajeError = validarEnteroNoNegativo(valor, true, "el stock");
  return mostrarResultadoCampo("stockProducto", mensajeError);
}

// Stock crítico: opcional. Vacío queda sin marcas; con algo escrito debe
// ser un entero mayor o igual a 0.
function validarStockCriticoFormulario() {
  const valor = document.getElementById("stockCriticoProducto").value;

  if (valor.trim() === "") {
    limpiarEstadoCampo("stockCriticoProducto");
    return true;
  }

  const mensajeError = validarEnteroNoNegativo(valor, false, "el stock crítico");
  return mostrarResultadoCampo("stockCriticoProducto", mensajeError);
}

// Categoría: hay que elegir una (la primera opción tiene valor vacío).
function validarCategoriaFormulario() {
  const valor = document.getElementById("categoriaProducto").value;

  let mensajeError = "";
  if (valor === "") {
    mensajeError = "Selecciona una categoría.";
  }

  return mostrarResultadoCampo("categoriaProducto", mensajeError);
}

// Recibe: nada.
// Hace: muestra u oculta la alerta de stock crítico del formulario. La
//       muestra cuando los dos números son válidos y el stock es menor o
//       igual al stock crítico. Un stock crítico vacío cuenta como 0.
//       Es solo un aviso: no impide guardar el producto.
// Devuelve: nada.
function actualizarAlertaStock() {
  const textoStock = document.getElementById("stockProducto").value;
  const textoCritico = document.getElementById("stockCriticoProducto").value;
  const alerta = document.getElementById("alertaStockFormulario");

  const stockEsValido = validarEnteroNoNegativo(textoStock, true, "el stock") === "";
  const criticoEsValido = validarEnteroNoNegativo(textoCritico, false, "el stock crítico") === "";

  // Number("") es 0, así que un stock crítico vacío se compara como 0
  const stock = Number(textoStock.trim());
  const stockCritico = Number(textoCritico.trim());

  if (stockEsValido && criticoEsValido && stock <= stockCritico) {
    alerta.textContent = "Atención: el stock (" + stock + ") es menor o igual al stock crítico (" + stockCritico + ").";
    alerta.hidden = false;
    return;
  }

  alerta.hidden = true;
  alerta.textContent = "";
}

// Recibe: nada.
// Hace: valida el stock y actualiza la alerta. Se usa como respuesta a los
//       eventos del campo stock.
// Devuelve: nada.
function revisarStock() {
  validarStockFormulario();
  actualizarAlertaStock();
}

// Recibe: nada.
// Hace: lo mismo que la función anterior, para el campo stock crítico.
// Devuelve: nada.
function revisarStockCritico() {
  validarStockCriticoFormulario();
  actualizarAlertaStock();
}

// Recibe: nada.
// Hace: valida la descripción y actualiza su contador.
// Devuelve: nada.
function revisarDescripcion() {
  validarDescripcionFormulario();
  actualizarContadorDescripcion();
}

// ==========================================================
// 3. Guardado del producto y envío del formulario
// ==========================================================

// Recibe: nada (lee los valores directamente del formulario, ya validados).
// Hace: arma un producto con los ocho campos del modelo de datos. Convierte
//       los textos de precio y cantidades en números, porque el resto del
//       sitio los necesita como número (por ejemplo, formatearPrecio).
// Devuelve: el producto armado (todavía sin guardar).
function leerProductoDelFormulario() {
  const nombreImagen = document.getElementById("imagenProducto").value;

  // El modelo guarda un arreglo de imágenes: vacío si no se eligió ninguna
  let imagenes = [];
  if (nombreImagen !== "") {
    imagenes = [nombreImagen];
  }

  return {
    codigo: document.getElementById("codigoProducto").value.trim(),
    nombre: document.getElementById("nombreProducto").value.trim(),
    descripcion: document.getElementById("descripcionProducto").value.trim(),
    precio: convertirANumero(document.getElementById("precioProducto").value),
    stock: Number(document.getElementById("stockProducto").value.trim()),
    // Number("") es 0: un stock crítico vacío se guarda como 0
    stockCritico: Number(document.getElementById("stockCriticoProducto").value.trim()),
    categoria: document.getElementById("categoriaProducto").value,
    imagenes: imagenes
  };
}

// Recibe: un producto nuevo, ya validado.
// Hace: lo agrega al final de la lista de productos de localStorage.
// Devuelve: nada.
function guardarProductoNuevo(producto) {
  const productos = leerDeStorage(CLAVE_PRODUCTOS);
  productos.push(producto);
  guardarEnStorage(CLAVE_PRODUCTOS, productos);
}

// Recibe: el evento "submit" del formulario.
// Hace: detiene el envío normal (que recargaría la página) y valida todos
//       los campos. Si alguno tiene error, pone el cursor en el primero.
//       Si todo está bien, guarda el producto y vuelve al listado con un
//       aviso (el código del aviso viaja en la URL).
// Devuelve: nada.
function enviarFormularioProducto(evento) {
  evento.preventDefault();

  // Cada campo se valida y su resultado se guarda en una variable, para
  // marcar todos los errores de una vez y no solo el primero
  const codigoOk = validarCodigoFormulario();
  const nombreOk = validarNombreFormulario();
  const descripcionOk = validarDescripcionFormulario();
  const precioOk = validarPrecioFormulario();
  const stockOk = validarStockFormulario();
  const stockCriticoOk = validarStockCriticoFormulario();
  const categoriaOk = validarCategoriaFormulario();

  const todoEsValido = codigoOk && nombreOk && descripcionOk && precioOk &&
    stockOk && stockCriticoOk && categoriaOk;

  if (!todoEsValido) {
    enfocarPrimerCampoConError("formularioProducto");
    return;
  }

  guardarProductoNuevo(leerProductoDelFormulario());
  irAPagina("productos.html?aviso=producto-creado");
}

// ==========================================================
// 4. Inicio de la página
// ==========================================================

// Recibe: el id de un campo y la función que lo revisa.
// Hace: deja el campo conectado para revisarse en tiempo real: mientras el
//       usuario escribe o elige ("input") y cuando sale del campo ("blur").
// Devuelve: nada.
function revisarEnTiempoReal(idCampo, funcionRevisar) {
  const campo = document.getElementById(idCampo);
  campo.addEventListener("input", funcionRevisar);
  campo.addEventListener("blur", funcionRevisar);
}

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel, con el Administrador como
//       único rol permitido. La opción del menú que se marca es "productos",
//       porque el formulario pertenece a esa sección. Después llena los
//       selects y conecta cada campo y el envío con sus funciones.
// Devuelve: nada.
function iniciarFormularioProducto() {
  const puedeVerLaPagina = iniciarPanel([ROL_ADMINISTRADOR], "productos");

  if (!puedeVerLaPagina) {
    return;
  }

  cargarCategorias();
  cargarImagenes();
  actualizarContadorDescripcion();

  revisarEnTiempoReal("codigoProducto", validarCodigoFormulario);
  revisarEnTiempoReal("nombreProducto", validarNombreFormulario);
  revisarEnTiempoReal("descripcionProducto", revisarDescripcion);
  revisarEnTiempoReal("precioProducto", validarPrecioFormulario);
  revisarEnTiempoReal("stockProducto", revisarStock);
  revisarEnTiempoReal("stockCriticoProducto", revisarStockCritico);
  revisarEnTiempoReal("categoriaProducto", validarCategoriaFormulario);

  // La imagen no se valida (es opcional): solo actualiza la vista previa
  document.getElementById("imagenProducto").addEventListener("change", actualizarVistaPrevia);

  document.getElementById("formularioProducto").addEventListener("submit", enviarFormularioProducto);
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarFormularioProducto();
