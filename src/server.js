
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..",".env") });

const express = require("express");
const pool = require("./config/database");
const paisos = require("./routes/paisos");
const estFamiliar = require("./routes/estructura_familiar");
const motiuBaixa=require("./routes/motiu_baixa");
const neses=require("./routes/NESES");
const resulAcad=require("./routes/resul_acad");
const risc=require("./routes/risc");
const rol=require("./routes/rol");
const sebas= require("./routes/SEBAS");
const sitEco=require("./routes/situacio_eco");
const tipusDomicili=require("./routes/tipus_domicili")
const curso=require("./routes/curso");
const projectes=require("./routes/projectes");
const usuari = require("./routes/usuari");

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use("/paisos", paisos);
server.use("/estFamilia", estFamiliar);
server.use("/motiuBaixa",motiuBaixa);
server.use("/neses",neses);
server.use("/resulAcad",resulAcad);
server.use("/risc",risc);
server.use("/rol",rol);
server.use("/sebas",sebas);
server.use("/sitEco",sitEco);
server.use("/tipusDom",tipusDomicili);
server.use("/curso",curso);
server.use("/projectes",projectes);
server.use("/usuario",usuari);

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log(" MySQL conectado");

    connection.release();
    server.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
      if (process.env.MOTD) console.log(`\x1b[33m ${process.env.MOTD} \x1b[0m`);
    });
  } catch (error) {
    console.error("Error en iniciar:", error.message);
    process.exit(1);
  }
}

startServer();


// server.use(express.urlencoded({ extended: true })); // para leer formularios
// const session = require("express-session");
// const MySQLStore = require("express-mysql-session")(session);
// const { flash }  = require("./middlewares/flash.js");
// const expressLayouts = require("express-ejs-layouts");
//seeders
// const seeder = require("./seeder/seeders.js");

// const { ensureDatabaseExists } = require("./config/database");
// const { sequelize } = require("./models");

// const routes = require("./routes");



// -------------------------------------------------------
// Motor de vistas: EJS + Layout
// -------------------------------------------------------.
// server.set("view engine", "ejs");
// server.set("views", path.join(__dirname, "views"));
// server.use(expressLayouts);
// server.set("layout", "layout");

// -------------------------------------------------------
// Middleware
// -------------------------------------------------------
// server.use(express.static(path.join(__dirname, "public")));



// -------------------------------------------------------
// Sesiones (persistidas en MySQL)
// -------------------------------------------------------
// express-session guarda los datos del usuario en el servidor.
// El navegador solo recibe una cookie con el ID de la sesión.
// MySQLStore persiste las sesiones en la BD, así sobreviven a
// reinicios del proceso Node (sin doble login al reiniciar).

// const sessionStore = new MySQLStore({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   createDatabaseTable: true,
// });

// server.use(session({
//   secret: process.env.SESSION_SECRET,
//   store: sessionStore,
//   resave: false,              // no reguardar si no ha cambiado
//   saveUninitialized: false,   // no crear sesión para visitantes anónimos
//   cookie: {
//     httpOnly: true,           // JS del navegador no puede leer la cookie
//     maxAge: 60 * 60 * 1000,  // 1 hora
//   },
// }));

// -------------------------------------------------------
// Mensajes flash
// -------------------------------------------------------
// server.use(flash);

// -------------------------------------------------------
// Rutas
// -------------------------------------------------------
// server.use("/", routes);

// -------------------------------------------------------
// 404 - Página no encontrada
// -------------------------------------------------------
// server.use((req, res) => {
//   res.status(404).render("404", {
//     titulo: "Pàgina no trobada",
//     usuario: req.session.usuario,
//     css: "404.css",
//     js: "404.js"
//   });
// });

// -------------------------------------------------------
// HANDLER DE ERRORES
// -------------------------------------------------------
// server.use((err, req, res, next) => {
//   console.error(err);
//   if (req.xhr || req.headers.accept?.includes("application/json")) {
//     return res.status(500).json({ error: "Error del servidor" });
//   }
//   res.status(500).render("500", {
//     titulo: "Error del servidor",
//     usuario: req.session?.usuario,
//     css: "500.css",
//     js: "500.js"
//   });
// });

// -------------------------------------------------------
// Arrancar
// -------------------------------------------------------
// async function startServer() {
//   try {
//     await ensureDatabaseExists();
//     await sequelize.authenticate();
//     console.log("Conexió a MySQL OK.");

//     await sequelize.sync();
//     console.log("Models sincronizats.");
//     await seeder.seedAlumnos();
//     await seeder.seedCursos();
//     await seeder.seedProfesores();
//     server.listen(PORT, () => {
//       console.log(`Servidor en http://localhost:${PORT}`);
//       if (process.env.MOTD) console.log(`\x1b[33m ${process.env.MOTD} \x1b[0m`);
//     });
//   } catch (error) {
//     console.error("Error en iniciar:", error.message);
//     process.exit(1);
//   }
// }
