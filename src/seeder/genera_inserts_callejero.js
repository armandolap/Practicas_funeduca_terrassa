const fs = require("fs");
const path = require("path");

const rawSql = fs.readFileSync(
    path.join(__dirname, "..", "sql", "inserts_calles.sql"),
    "utf8"
);

// Parse INSERT statements — extract VALUES tuples
const insertRegex = /INSERT INTO\s+tu_nombre_de_tabla\s*\([^)]+\)\s*VALUES\s*((?:\([^;]+\)\s*,?\s*)+)/gi;
let match;
const rows = [];

while ((match = insertRegex.exec(rawSql)) !== null) {
    const valuesBlock = match[1];
    // Extract individual parenthesized tuples
    const tupleRegex = /\(([^)]+)\)/g;
    let tmatch;
    while ((tmatch = tupleRegex.exec(valuesBlock)) !== null) {
        // Parse CSV inside parens, handling escaped quotes
        const parts = parseCSVLine(tmatch[1]);
        if (parts.length >= 6) {
            rows.push({
                codi_carrer: unquote(parts[0]),
                des_sigla: unquote(parts[1]),
                nom_carrer: unquote(parts[2]),
                nom_complert: unquote(parts[3]),
                nom_barri: unquote(parts[4]),
                codi_postal: unquote(parts[5]),
            });
        }
    }
}

function parseCSVLine(str) {
    const result = [];
    let current = "";
    let inQuote = false;
    let i = 0;
    while (i < str.length) {
        const ch = str[i];
        if (ch === "'") {
            if (i + 1 < str.length && str[i + 1] === "'") {
                current += "'";
                i += 2;
                continue;
            }
            inQuote = !inQuote;
            i++;
            continue;
        }
        if (ch === "," && !inQuote) {
            result.push(current.trim());
            current = "";
            i++;
            continue;
        }
        current += ch;
        i++;
    }
    if (current.trim()) result.push(current.trim());
    return result;
}

function unquote(s) {
    s = s.trim();
    if (s.startsWith("'") && s.endsWith("'")) {
        s = s.slice(1, -1).replace(/''/g, "'");
    }
    return s;
}

// Extract distinct values
const tipusViaSet = new Map(); // Nom -> id (sequential)
const barriSet = new Map();
const cpSet = new Map();

for (const r of rows) {
    if (r.des_sigla && !tipusViaSet.has(r.des_sigla)) {
        tipusViaSet.set(r.des_sigla, tipusViaSet.size + 1);
    }
    if (r.nom_barri && !barriSet.has(r.nom_barri)) {
        barriSet.set(r.nom_barri, barriSet.size + 1);
    }
    if (r.codi_postal && !cpSet.has(r.codi_postal)) {
        cpSet.set(r.codi_postal, cpSet.size + 1);
    }
}

// Extract distinct direccio combinations
const direccioSet = new Set();
const direccioRows = [];
for (const r of rows) {
    const key = `${r.des_sigla}|${r.nom_carrer}|${r.nom_barri || ""}|${r.codi_postal || ""}`;
    if (!direccioSet.has(key)) {
        direccioSet.add(key);
        direccioRows.push(r);
    }
}

// Generate INSERT statements
const output = [];

output.push("-- ============================================================");
output.push("-- tipus_via");
output.push("-- ============================================================");
for (const [nom, id] of tipusViaSet) {
    output.push(`INSERT INTO tipus_via (Nom) VALUES ('${escapeSQL(nom)}');`);
}

output.push("");
output.push("-- ============================================================");
output.push("-- barri");
output.push("-- ============================================================");
for (const [nom, id] of barriSet) {
    output.push(`INSERT INTO barri (Nom) VALUES ('${escapeSQL(nom)}');`);
}

output.push("");
output.push("-- ============================================================");
output.push("-- codi_postal");
output.push("-- ============================================================");
for (const [codi, id] of cpSet) {
    output.push(`INSERT INTO codi_postal (Codi) VALUES ('${escapeSQL(codi)}');`);
}

output.push("");
output.push("-- ============================================================");
output.push("-- direccio (combinacions úniques de via + carrer + barri + CP)");
output.push("-- ============================================================");
for (const r of direccioRows) {
    const idTipus = tipusViaSet.get(r.des_sigla);
    const idBarri = r.nom_barri ? barriSet.get(r.nom_barri) : "NULL";
    const idCp = r.codi_postal ? cpSet.get(r.codi_postal) : "NULL";
    output.push(
        `INSERT INTO direccio (idTipus_via, Nom_calle, idBarri, idCodi_postal) VALUES (${idTipus}, '${escapeSQL(r.nom_carrer)}', ${idBarri}, ${idCp});`
    );
}

function escapeSQL(s) {
    return (s || "").replace(/'/g, "''");
}

const outPath = path.join(__dirname, "..", "sql", "inserts_calles_generades.sql");
fs.writeFileSync(outPath, output.join("\n") + "\n", "utf8");
console.log(`Generades ${tipusViaSet.size} tipus_via`);
console.log(`Generades ${barriSet.size} barris`);
console.log(`Generats ${cpSet.size} codis postals`);
console.log(`Generades ${direccioRows.length} direccions (combinacions úniques)`);
console.log(`Fitxer: ${outPath}`);
