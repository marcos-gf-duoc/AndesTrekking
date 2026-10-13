/*
  Archivo: js/admin/producto-form.js
  Qué es: script propio del formulario de producto del panel. El mismo
          formulario sirve para crear un producto y para editar uno.
  Quién lo usa: solo admin/producto-form.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: solo el Administrador. Un Vendedor que escriba
          la dirección a mano es redirigido al inicio del panel.

  Dos modos, según la URL:
    - Nuevo:  producto-form.html              (formulario vacío)
    - Editar: producto-form.html?codigo=XXX   (formulario con los datos)

  Tiene cinco partes:
    1. Selects, vista previa y contador.
    2. Validación de cada campo (una función por campo).
    3. Guardado del producto y envío del formulario.
    4. Modo Editar (carga de los datos del producto).
    5. Inicio de la página (conexión de los eventos).
*/

// Largos máximos de los campos de texto (regla del enunciado)
const LARGO_MAXIMO_NOMBRE_PRODUCTO = 100;
const LARGO_MAXIMO_DESCRIPCION = 500;

// Producto que se está editando. Vale null en modo Nuevo. Se declara con
// let porque se define al iniciar la página, según la URL. Varias funciones
// la consultan para saber en qué modo está el formulario.
let productoEnEdicion = null;

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
// En modo Editar no se valida: el campo está bloqueado y el código no cambia.
function validarCodigoFormulario() {
  if (productoEnEdicion !== null) {
    return true;
  }

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
  let codigo = document.getElementById("codigoProducto").value.trim();

  // En modo Editar el código es siempre el del producto original
  if (productoEnEdicion !== null) {
    codigo = productoEnEdicion.codigo;
  }

  return {
    codigo: codigo,
    nombre: document.getElementById("nombreProducto").value.trim(),
    descripcion: document.getElementById("descripcionProducto").value.trim(),
    precio: convertirANumero(document.getElementById("precioProducto").value),
    stock: Number(document.getElementById("stockProducto").value.trim()),
    // Number("") es 0: un stock crítico vacío se guarda como 0
    stockCritico: Number(document.getElementById("stockCriticoProducto").value.trim()),
    categoria: document.getElementById("categoriaProducto").value,
    imagenes: obtenerImagenesDelFormulario()
  };
}

// Recibe: nada.
// Hace: decide qué arreglo de imágenes tendrá el producto. El formulario
//       maneja solo la imagen principal, pero un producto puede tener más:
//       - Si se está editando y la imagen principal no cambió, se conservan
//         todas las imágenes que tenía.
//       - Si se eligió otra imagen, el producto queda solo con esa.
//       - Con "Sin imagen", queda sin imágenes.
// Devuelve: el arreglo de imágenes.
function obtenerImagenesDelFormulario() {
  const nombreImagen = document.getElementById("imagenProducto").value;

  if (productoEnEdicion !== null && productoEnEdicion.imagenes.length > 0 &&
      productoEnEdicion.imagenes[0] === nombreImagen) {
    return productoEnEdicion.imagenes;
  }

  if (nombreImagen === "") {
    return [];
  }

  return [nombreImagen];
}

// Recibe: un producto nuevo, ya validado.
// Hace: lo agrega al final de la lista de productos de localStorage.
// Devuelve: nada.
function guardarProductoNuevo(producto) {
  const productos = leerDeStorage(CLAVE_PRODUCTOS);
  productos.push(producto);
  guardarEnStorage(CLAVE_PRODUCTOS, productos);
}

// Recibe: un producto editado, ya validado.
// Hace: busca en localStorage el producto con el mismo código y lo
//       reemplaza por el nuevo, en la misma posición de la lista.
// Devuelve: true si lo reemplazó; false si el producto ya no existe (por
//           ejemplo, si se eliminó desde otra pestaña mientras se editaba).
function guardarCambiosProducto(productoEditado) {
  const productos = leerDeStorage(CLAVE_PRODUCTOS);

  for (let i = 0; i < productos.length; i++) {
    if (productos[i].codigo === productoEditado.codigo) {
      productos[i] = productoEditado;
      guardarEnStorage(CLAVE_PRODUCTOS, productos);
      return true;
    }
  }

  return false;
}

// Recibe: el evento "submit" del formulario.
// Hace: detiene el envío normal (que recargaría la página) y valida todos
//       los campos. Si alguno tiene error, pone el cursor en el primero.
//       Si todo está bien, guarda (agrega en modo Nuevo, reemplaza en modo
//       Editar) y vuelve al listado con un aviso, cuyo código viaja en
//       la URL.
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

  const producto = leerProductoDelFormulario();

  if (productoEnEdicion === null) {
    guardarProductoNuevo(producto);
    irAPagina("productos.html?aviso=producto-creado");
    return;
  }

  if (!guardarCambiosProducto(producto)) {
    mostrarAvisoPanel("No se pudo guardar: el producto ya no existe. Vuelve al listado.");
    return;
  }

  irAPagina("productos.html?aviso=producto-actualizado");
}

// ==========================================================
// 4. Modo Editar
// ==========================================================

// Recibe: el producto que se va a editar.
// Hace: deja el formulario en modo Editar: cambia los títulos, escribe los
//       datos actuales en los campos y bloquea el código, que es el
//       identificador del producto y no se puede cambiar.
// Devuelve: nada.
function prepararModoEditar(producto) {
  document.getElementById("tituloFormulario").textContent = "Editar producto";
  document.title = "Editar " + producto.nombre + " | Panel AndesTrekking";

  const campoCodigo = document.getElementById("codigoProducto");
  campoCodigo.value = producto.codigo;
  campoCodigo.disabled = true; // un campo deshabilitado no se puede modificar
  document.getElementById("ayudaCodigoProducto").textContent = "El código no se puede cambiar.";

  document.getElementById("nombreProducto").value = producto.nombre;
  document.getElementById("descripcionProducto").value = producto.descripcion;
  // El precio se muestra con coma decimal, como se escribe en Chile
  document.getElementById("precioProducto").value = String(producto.precio).replace(".", ",");
  document.getElementById("stockProducto").value = producto.stock;
  document.getElementById("stockCriticoProducto").value = producto.stockCritico;
  document.getElementById("categoriaProducto").value = producto.categoria;

  if (producto.imagenes.length > 0) {
    const imagenPrincipal = producto.imagenes[0];
    const selectImagen = document.getElementById("imagenProducto");

    // Si la imagen del producto no está en la lista de disponibles, se
    // agrega como opción: así no se pierde al guardar
    if (IMAGENES_PRODUCTOS.indexOf(imagenPrincipal) === -1) {
      selectImagen.appendChild(crearOpcion(imagenPrincipal, imagenPrincipal));
    }

    selectImagen.value = imagenPrincipal;
  }

  // Con los datos ya escritos, se actualizan los apoyos visuales
  actualizarVistaPrevia();
  actualizarContadorDescripcion();
  actualizarAlertaStock();
}

// Recibe: nada.
// Hace: reemplaza el formulario por un aviso cuando el código de la URL no
//       corresponde a ningún producto.
// Devuelve: nada.
function mostrarProductoAEditarNoEncontrado() {
  document.getElementById("formularioProducto").remove();
  document.getElementById("tituloFormulario").textContent = "Producto no encontrado";
  document.title = "Producto no encontrado | Panel AndesTrekking";

  mostrarAvisoPanel("El producto que quieres editar no existe o fue eliminado. Vuelve al listado para elegir otro.");
}

// ==========================================================
// 5. Inicio de la página
// ==========================================================

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel, con el Administrador como
//       único rol permitido. La opción del menú que se marca es "productos",
//       porque el formulario pertenece a esa sección. Después llena los
//       selects, revisa si la URL trae un código (modo Editar) y conecta
//       cada campo y el envío con sus funciones.
// Devuelve: nada.
function iniciarFormularioProducto() {
  const puedeVerLaPagina = iniciarPanel([ROL_ADMINISTRADOR], "productos");

  if (!puedeVerLaPagina) {
    return;
  }

  cargarCategorias();
  cargarImagenes();
  actualizarContadorDescripcion();

  // Si la URL trae ?codigo=..., el formulario pasa a modo Editar
  const codigo = obtenerParametroUrl("codigo");

  if (codigo !== null) {
    const producto = buscarProductoPorCodigo(codigo);

    if (producto === null) {
      mostrarProductoAEditarNoEncontrado();
      return;
    }

    productoEnEdicion = producto;
    prepararModoEditar(producto);
  }

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
