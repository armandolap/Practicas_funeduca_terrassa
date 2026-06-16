const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

// Cargar .env
const dotenvPath = path.resolve(__dirname, "..", ".env");

if (!fs.existsSync(dotenvPath)) {
    console.error("ERROR: No s'ha trobat el fitxer .env.");
    process.exit(1);
}

require("dotenv").config({ path: dotenvPath });

// Express

const express = require("express");
const server = express();

const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use(express.static(path.join(__dirname, "public")));

// Consts
const paisos = require("./routes/paisos");
const estFamiliar = require("./routes/estructura_familiar");
const motiuBaixa = require("./routes/motiu_baixa");
const neses = require("./routes/NESES");
const resulAcad = require("./routes/resul_acad");
const risc = require("./routes/risc");
const rol = require("./routes/rol");
const sebas = require("./routes/SEBAS");
const sitEco = require("./routes/situacio_eco");
const tipusDomicili = require("./routes/tipus_domicili")
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


// Rutas
server.use(express.json());
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
server.use(express.static(path.join(__dirname, "public")));

// Ejecutar SQL
async function runSQLFile(connection, filePath) {
    const sql = fs.readFileSync(filePath, "utf8");

    const statements = sql
        .replace(/^USE\s+`?\w+`?\s*;/gim, "")
        .split(";")
        .map(s => s.trim())
        .filter(Boolean);

    for (const stmt of statements) {
        try {
            await connection.query(stmt);
        } catch (err) {
            // Ignorar errores típicos de "ya existe"
            if (![1050, 1060, 1061, 1062].includes(err.errno)) {
                console.warn(`SQL warning: ${err.message}`);
            }
        }
    }
}

// Inicio
async function startServer() {
    try {
        // 1. Conexión inicial SIN database
        const bootstrap = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        console.log("MySQL conectado");
        // 2. Crear BD si no existe
        await bootstrap.query(
            `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
        );
        // 3. Seleccionar BD
        await bootstrap.query(
            `USE \`${process.env.DB_NAME}\``
        );
        // 4. Ejecutar estructura
        console.log("Ejecutando Base_datos.sql...");

        await runSQLFile(
            bootstrap,
            path.join(__dirname, "sql", "Base_datos.sql")
        );
        // 5. Ejecutar datos estáticos
        console.log("Ejecutando inserts_tablas_estaticas.sql...");

        await runSQLFile(
            bootstrap,
            path.join(__dirname, "sql", "inserts_tablas_estaticas.sql")
        );

        await bootstrap.end();

        console.log("Base de datos preparada");

        // 6. Crear pool para el resto de la aplicación
        const { createPool } = require("./config/database");
        createPool();
        // 7. Arrancar servidor
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