const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");

const ENV_PATH = path.resolve(__dirname, ".env");
const EXAMPLE_PATH = path.resolve(__dirname, ".env.example");

const HARDCODED_DEFAULTS = {
    PORT: "3000",
    DB_HOST: "localhost",
    DB_PORT: "3306",
    DB_USER: "root",
    DB_PASSWORD: "",
    DB_NAME: "mydb",
    NODE_ENV: "development",
    SESSION_SECRET: "cambiar_esto_por_un_secreto",
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "465",
    MOTD: "sin nada reseñable",
};

const FIELD_ORDER = [
    "PORT", "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD",
    "DB_NAME", "NODE_ENV", "SESSION_SECRET", "SMTP_HOST",
    "SMTP_PORT", "MOTD",
];

const COMMENT_ABOVE = {
    SESSION_SECRET: "# canvia-ho per un secret real en producció",
};

function parseEnvFile(filePath) {
    const map = {};
    if (!fs.existsSync(filePath)) return map;
    const lines = fs.readFileSync(filePath, "utf8").split("\n");
    for (const line of lines) {
        const m = line.match(/^(#\s*)?\s*([A-Z_][A-Z_0-9]*)\s*=\s*(.*)$/);
        if (m && !m[1]) {
            let val = m[3].trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            map[m[2]] = val;
        }
    }
    return map;
}

function formatEnvValue(val) {
    if (!val) return "";
    if (val.includes("#") || val.includes(" ") || val.includes('"') || val.includes("'")) {
        return `"${val}"`;
    }
    return val;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function ask(prompt, defaultValue) {
    const full = defaultValue !== undefined
        ? `${prompt} [${defaultValue}]: `
        : `${prompt}: `;
    const answer = await rl.question(full);
    return answer.trim() || defaultValue || "";
}

async function main() {
    console.log("\n=== Configuració de l'entorn (.env) ===\n");

    const exampleValues = parseEnvFile(EXAMPLE_PATH);
    const existingValues = parseEnvFile(ENV_PATH);
    const current = { ...HARDCODED_DEFAULTS };

    for (const k of FIELD_ORDER) {
        if (existingValues[k] !== undefined) current[k] = existingValues[k];
    }

    const isNew = !fs.existsSync(ENV_PATH);
    if (isNew) {
        console.log("No s'ha trobat .env — creem-lo interactivament.\n");
    } else {
        console.log("Trobat .env existent. Pots modificar les dades.\n");
    }

    let done = false;
    while (!done) {
        console.log("\nConfiguració actual:");
        console.log("─────────────────────");
        for (let i = 0; i < FIELD_ORDER.length; i++) {
            const k = FIELD_ORDER[i];
            const val = current[k];
            const exampleVal = exampleValues[k];
            let display = `${i + 1}) ${k}=${formatEnvValue(val)}`;
            if (val === "" || val === undefined) display += "  \x1b[33m(buit)\x1b[0m";
            if (exampleVal !== undefined && val !== exampleVal) {
                display += `  \x1b[90m(.env.example: ${exampleVal})\x1b[0m`;
            }
            console.log(display);
        }
        console.log("─────────────────────");
        const choice = await rl.question(
            "\nNúmero per editar, \x1b[32mw\x1b[0m per guardar, \x1b[31mq\x1b[0m per sortir: "
        );
        const trimmed = choice.trim().toLowerCase();

        if (trimmed === "w") {
            let out = `# Fitxer .env generat per setup.js — ${new Date().toISOString().slice(0, 10)}\n\n`;
            for (const k of FIELD_ORDER) {
                const comment = COMMENT_ABOVE[k];
                if (comment) out += `${comment}\n`;
                out += `${k}=${formatEnvValue(current[k])}\n`;
                if (k === "DB_NAME") out += "\n";
                if (k === "SESSION_SECRET") out += "\n";
                if (k === "MOTD") out += "\n";
            }
            fs.writeFileSync(ENV_PATH, out, "utf8");
            console.log(`\n\x1b[32m✓ .env guardat a ${ENV_PATH}\x1b[0m\n`);
            done = true;
        } else if (trimmed === "q") {
            console.log("\nSortint sense guardar.\n");
            process.exit(0);
        } else {
            const idx = parseInt(trimmed, 10);
            if (idx >= 1 && idx <= FIELD_ORDER.length) {
                const k = FIELD_ORDER[idx - 1];
                const exampleVal = exampleValues[k];
                let hint = `Valor actual: ${current[k] || "(buit)"}`;
                if (exampleVal !== undefined && exampleVal !== current[k]) {
                    hint += ` | .env.example: ${exampleVal}`;
                }
                console.log(`\n  ${k}: ${hint}`);
                const newVal = await ask(`  Nou valor`, current[k]);
                current[k] = newVal;
            } else {
                console.log("  \x1b[31mOpció no vàlida.\x1b[0m");
            }
        }
    }

    rl.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
