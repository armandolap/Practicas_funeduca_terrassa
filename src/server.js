const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");
const dotenvPath = path.resolve(__dirname, "..", ".env");

if (!fs.existsSync(dotenvPath)) {
    console.error("ERROR: No s'ha trobat el fitxer .env.");
    process.exit(1);
}

require("dotenv").config({ path: dotenvPath });

const express = require("express");
const server = express();
const { runSQLFile } = require("./helpers/sqlRunner");
const PORT = process.env.PORT || 3000;

server.use(express.json());

server.use((req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method) && (req.body === undefined || req.body === null)) {
        return res.status(400).json({ message: "El cos de la petició ha de ser JSON" });
    }
    next();
});

server.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ message: "JSON malformat" });
    }
    next();
});

// Root → login page
server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

server.use(express.static(path.join(__dirname, "public")));

// Routes
const paisos = require("./routes/paisos");
const estFamiliar = require("./routes/estructura_familiar");
const motiuBaixa = require("./routes/motiu_baixa");
const neses = require("./routes/NESES");
const resulAcad = require("./routes/resul_acad");
const risc = require("./routes/risc");
const rol = require("./routes/rol");
const sebas = require("./routes/SEBAS");
const sitEco = require("./routes/situacio_eco");
const tipusDomicili = require("./routes/tipus_domicili");
const curso = require("./routes/curso");
const projectes = require("./routes/projectes");
const usuari = require("./routes/usuari");
const domicili = require("./routes/domicili");
const familia = require("./routes/familia");
const client = require("./routes/client");
const tipus_via = require("./routes/tipus_via");
const barri = require("./routes/barri");
const codi_postal = require("./routes/codi_postal");
const callejero = require("./routes/callejero");
const desplegables = require("./routes/desplegables");
const auth = require("./routes/auth");
const centreActivitats = require("./routes/centre_activitats");
const reports = require("./routes/reports");
const genere = require("./routes/genere");
const nivelAcceso = require("./routes/nivel_acceso");

server.use("/paisos", paisos);
server.use("/estFamilia", estFamiliar);
server.use("/motiuBaixa", motiuBaixa);
server.use("/neses", neses);
server.use("/resulAcad", resulAcad);
server.use("/risc", risc);
server.use("/rol", rol);
server.use("/sebas", sebas);
server.use("/sitEco", sitEco);
server.use("/tipusDom", tipusDomicili);
server.use("/curso", curso);
server.use("/projectes", projectes);
server.use("/usuario", usuari);
server.use("/domicili", domicili);
server.use("/familia", familia);
server.use("/client", client);
server.use("/tipusVia", tipus_via);
server.use("/barri", barri);
server.use("/codiPostal", codi_postal);
server.use("/callejero", callejero);
server.use("/desplegables", desplegables);
server.use("/auth", auth);
server.use("/centre-activitats", centreActivitats);
server.use("/reports", reports);
server.use("/genere", genere);
server.use("/nivell-acces", nivelAcceso);

async function ensureDatabase(bootstrap) {
    const dbName = process.env.DB_NAME;
    try {
        await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await bootstrap.query(`USE \`${dbName}\``);
    const [rows] = await bootstrap.query(
        `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ?`,
        [dbName]
    );
    if (rows[0].cnt > 0) {
        console.log(`BD "${dbName}" ja te taules — s'omet esquema i inserts`);
        return;
    }
    console.log("Ejecutando Base_datos.sql...");
    await runSQLFile(bootstrap, path.join(__dirname, "sql", "Base_datos.sql"));
    console.log("Ejecutando inserts_tablas_estaticas.sql...");
    await runSQLFile(bootstrap, path.join(__dirname, "sql", "inserts_tablas_estaticas.sql"));
    console.log("Ejecutando creacion de curso lectiu...");
    await runSQLFile(bootstrap, path.join(__dirname, "sql", "2026-06-22_add_curs_lectiu.sql"));
}catch(err){
    console.log("Error extremo: ",err);
}} 

async function startServer() {
    try {
        const bootstrap = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        console.log("MySQL conectado");
        await ensureDatabase(bootstrap);
        await bootstrap.end();
        console.log("Base de datos preparada");
        const { createPool } = require("./config/database");
        createPool();
        server.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
            if (process.env.MOTD) {
                console.log(`\x1b[33m${process.env.MOTD}\x1b[0m`);
            }
        });
    } catch (err) {
        console.error("Error en iniciar:", err.message);
        process.exit(1);
    }
}

startServer();
