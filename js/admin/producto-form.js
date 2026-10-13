/*
  Archivo: js/admin/producto-form.js
  Qué es: script propio del formulario de producto del panel. El mismo
          formulario sirve para crear un producto y para editar uno.
  Quién lo usa: solo admin/producto-form.html.
  Orden de carga: va al final, DESPUÉS de js/admin/admin-comun.js.
  Quién puede ver la página: solo el Administrador. Un Vendedor que escriba
          la dirección a mano es redirigido al inicio del panel.
*/

// Recibe: nada.
// Hace: prepara la página. Primero iniciarPanel, con el Administrador como
//       único rol permitido. La opción del menú que se marca es "productos",
//       porque el formulario pertenece a esa sección.
// Devuelve: nada.
function iniciarFormularioProducto() {
  const puedeVerLaPagina = iniciarPanel([ROL_ADMINISTRADOR], "productos");

  if (!puedeVerLaPagina) {
    return;
  }
}

// Se ejecuta al cargar el archivo, con la página ya dibujada
iniciarFormularioProducto();
