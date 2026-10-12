/*
  Archivo: js/data/usuarios.js
  Qué es: datos iniciales (semilla) de los usuarios del sitio.
  Quién lo usa: storage.js copia USUARIOS_INICIALES a localStorage
          (clave at_usuarios) la primera vez que se abre el sitio.
  Nota: este archivo solo tiene datos, no tiene funciones.
  Advertencia: las contraseñas están en texto plano porque el proyecto
          no tiene backend. Es una simulación, no seguridad real.
*/

// Usuarios iniciales. Cada usuario tiene:
//   run              sin puntos ni guion, con dígito verificador (único)
//   nombre, apellidos
//   correo           único; dominios permitidos: duoc.cl, profesor.duoc.cl, gmail.com
//   password         entre 4 y 10 caracteres
//   telefono         opcional; 9 dígitos que empiezan con 9 ("" = sin teléfono)
//   fechaNacimiento  opcional; formato AAAA-MM-DD ("" = sin fecha)
//   tipo             "Administrador", "Vendedor" o "Cliente"
//   region, comuna   deben existir en REGIONES (js/data/regiones.js)
//   direccion
// Todos los RUN son válidos según el algoritmo de módulo 11.
const USUARIOS_INICIALES = [
  // ---------- Usuarios de prueba para la presentación ----------
  {
    run: "123456785",
    nombre: "Marcos",
    apellidos: "Godoy",
    correo: "admin@duoc.cl",
    password: "admin123",
    telefono: "912345678",
    fechaNacimiento: "1995-04-12",
    tipo: "Administrador",
    region: "Metropolitana de Santiago",
    comuna: "Santiago",
    direccion: "Av. Libertador Bernardo O'Higgins 1234"
  },
  {
    run: "201234565",
    nombre: "Valentina",
    apellidos: "Rojas Muñoz",
    correo: "vendedor@duoc.cl",
    password: "vende123",
    telefono: "923456789",
    fechaNacimiento: "2000-09-03",
    tipo: "Vendedor",
    region: "Metropolitana de Santiago",
    comuna: "Maipú",
    direccion: "Av. Pajaritos 2550"
  },
  {
    run: "19011001K",
    nombre: "Camila",
    apellidos: "Soto Fuentes",
    correo: "cliente@gmail.com",
    password: "cliente1",
    telefono: "934567890",
    fechaNacimiento: "1998-01-25",
    tipo: "Cliente",
    region: "Valparaíso",
    comuna: "Viña del Mar",
    direccion: "Calle Valparaíso 456, depto. 32"
  },

  // ---------- Clientes adicionales (dan variedad a las órdenes) ----------
  {
    run: "152348762",
    nombre: "Felipe",
    apellidos: "Araya Contreras",
    correo: "felipe.araya@gmail.com",
    password: "felipe22",
    telefono: "945678901",
    fechaNacimiento: "1984-07-18",
    tipo: "Cliente",
    region: "Biobío",
    comuna: "Concepción",
    direccion: "Barros Arana 789"
  },
  {
    run: "174563292",
    nombre: "Daniela",
    apellidos: "Pérez Vidal",
    correo: "daniela.perez@gmail.com",
    password: "dani2024",
    telefono: "", // sin teléfono: el campo es opcional
    fechaNacimiento: "1990-11-30",
    tipo: "Cliente",
    region: "Los Lagos",
    comuna: "Puerto Montt",
    direccion: "Av. Diego Portales 1020"
  },
  {
    run: "187654327",
    nombre: "Ignacio",
    apellidos: "Morales Tapia",
    correo: "ignacio.morales@duoc.cl",
    password: "nacho123",
    telefono: "956789012",
    fechaNacimiento: "", // sin fecha: el campo es opcional
    tipo: "Cliente",
    region: "Coquimbo",
    comuna: "La Serena",
    direccion: "Av. Francisco de Aguirre 315"
  },
  {
    run: "169087547",
    nombre: "Francisca",
    apellidos: "Herrera Lagos",
    correo: "fran.herrera@gmail.com",
    password: "fran1987",
    telefono: "967890123",
    fechaNacimiento: "1987-03-08",
    tipo: "Cliente",
    region: "Metropolitana de Santiago",
    comuna: "Providencia",
    direccion: "Av. Providencia 2100, depto. 504"
  }
];
