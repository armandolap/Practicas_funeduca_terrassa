const fs = require("fs");

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitStatements(sql) {
    const statements = [];
    let normal = "";

    for (let i = 0; i < sql.length; i++) {
        const isLineStart = i === 0 || sql[i - 1] === "\n" || sql[i - 1] === "\r";
        if (isLineStart) {
            const rest = sql.slice(i);
            const m = rest.match(/^\s*delimiter\s+(\S+)\s*;?\s*/i);
            if (m) {
                if (normal.trim()) {
                    normal
                        .split(";")
                        .map(s => s.trim())
                        .filter(s => s)
                        .forEach(s => statements.push(s));
                    normal = "";
                }

                const delim = m[1];
                i += m[0].length;

                if (delim.toLowerCase() !== ";") {
                    const re = new RegExp(
                        escapeRegex(delim) + "\\s*delimiter\\s*;?",
                        "i"
                    );
                    const tail = sql.slice(i);
                    const end = tail.match(re);
                    if (end) {
                        const body = tail.slice(0, end.index).trim();
                        if (body) statements.push(body);
                        i += end.index + end[0].length;
                    } else {
                        const body = tail.trim();
                        if (body) statements.push(body);
                        i = sql.length;
                    }
                }
                continue;
            }
        }
        normal += sql[i];
    }

    if (normal.trim()) {
        normal
            .split(";")
            .map(s => s.trim())
            .filter(s => s)
            .forEach(s => statements.push(s));
    }

    return statements;
}

async function runSQLFile(connection, filePath) {
    const sql = fs.readFileSync(filePath, "utf8");
    const cleaned = sql.replace(/^\s*USE\s+`?\w+`?\s*;/gim, "");
    const statements = splitStatements(cleaned);

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
