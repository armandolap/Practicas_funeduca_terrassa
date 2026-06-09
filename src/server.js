const path = require("path");
const fs = require("fs");
const dotenvPath = path.resolve(__dirname, "..", ".env");
if (!fs.existsSync(dotenvPath)) {
    console.error("ERROR: No s'ha trobat el fitxer .env a l'arrel del projecte.");
    console.error("Crea'l a partir de .env.example:");
    console.error("  cp .env.example .env");
    process.exit(1);
}
require("dotenv").config({ path: dotenvPath });

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
const domicili =require("./routes/domicili");
const familia =require("./routes/familia");
const client = require("./routes/client");
const tipus_via = require("./routes/tipus_via");
const barri = require("./routes/barri");
const codi_postal = require("./routes/codi_postal");
const callejero = require("./routes/callejero");

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
server.use("/domicili",domicili);
server.use("/familia",familia);
server.use("/client", client);
server.use("/tipusVia", tipus_via);
server.use("/barri", barri);
server.use("/codiPostal", codi_postal);
server.use("/callejero", callejero);
server.use(express.static(path.join(__dirname, "public")));

async function runSQLFile(filePath) {
    const sql = fs.readFileSync(filePath, "utf8");
    const statements = sql
        .replace(/^use\s+`?\w+`?\s*;/gim, "")
        .replace(/^DROP\s+SCHEMA.+?;/gim, "")
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    for (const stmt of statements) {
        try {
            await pool.query(stmt);
        } catch (err) {
            // Ignore "already exists" errors for CREATE TABLE IF NOT EXISTS / UNIQUE INDEX
            if (err.errno !== 1061 && err.errno !== 1050 && err.errno !== 1060 && err.errno !== 1062) {
                console.warn(`  SQL advertencia: ${err.message.slice(0, 80)}`);
            }
        }
    }
}

async function startServer() {
  try {
    const connection = await pool.getConnection();
    connection.release();

    console.log(" MySQL conectado");
    console.log(" Executant Base_datos.sql...");
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await runSQLFile(path.join(__dirname, "sql", "Base_datos.sql"));
    console.log(" Executant callejero_schema.sql...");
    await runSQLFile(path.join(__dirname, "sql", "callejero_schema.sql"));
    console.log(" Executant inserts_tablas_estaticas.sql...");
    await runSQLFile(path.join(__dirname, "sql", "inserts_tablas_estaticas.sql"));
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log(" Dades carregades");

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
