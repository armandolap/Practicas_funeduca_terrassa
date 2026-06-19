const fs = require("fs");

async function runSQLFile(connection, filePath) {
    const sql = fs.readFileSync(filePath, "utf8");
    const statements = sql
        .replace(/^USE\s+`?\w+`?\s*;/gim, "")
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    for (const stmt of statements) {
        try {
            await connection.query(stmt);
        } catch (err) {
            if (![1050, 1060, 1061, 1062].includes(err.errno)) {
                console.warn(`SQL warning: ${err.message.slice(0, 80)}`);
            }
        }
    }
}

module.exports = { runSQLFile };
