const { createPool } = require("../config/database");
const pool = createPool();

async function projectesGeneresEdats() {
    const [rows] = await pool.query(`
        SELECT p.idProyecto, p.Nom_projecte,
               g.Nom_genere, cl.C_edad,
               cl.Baixa, cl.idClient
        FROM proyectos p
        JOIN proyectos_has_client phc ON p.idProyecto = phc.idProyecto
        JOIN client cl ON phc.idClient = cl.idClient
        JOIN genere g ON cl.idGenere = g.idGenere
        ORDER BY p.Nom_projecte, cl.C_edad
    `);

    const ageSegment = (edad) => {
        if (edad >= 0 && edad <= 3) return '0-3 ANYS';
        if (edad >= 4 && edad <= 6) return '4-6 ANYS';
        if (edad >= 7 && edad <= 9) return '7-9 ANYS';
        if (edad >= 10 && edad <= 12) return '10-12 ANYS';
        if (edad >= 13 && edad <= 15) return '13-15 ANYS';
        if (edad >= 16 && edad <= 18) return '16-18 ANYS';
        if (edad >= 19 && edad <= 30) return '18-30 ANYS';
        if (edad >= 31) return '30-65 ANYS';
        return 'altres';
    };

    const genderMap = { 'Masculí': 'HOMES', 'Femeni': 'DONES', 'Femení': 'DONES', 'Non binari': 'NO BINARIS' };
    const segments = ['0-3 ANYS', '4-6 ANYS', '7-9 ANYS', '10-12 ANYS', '13-15 ANYS', '16-18 ANYS', '18-30 ANYS', '30-65 ANYS'];
    const genders = ['HOMES', 'DONES', 'NO BINARIS'];

    const projectMap = new Map();

    for (const r of rows) {
        if (!projectMap.has(r.idProyecto)) {
            projectMap.set(r.idProyecto, {
                PROJECTE: r.Nom_projecte,
                ...Object.fromEntries(genders.flatMap(g => segments.map(s => [`${g} ${s}`, 0]))),
                ...Object.fromEntries(genders.map(g => [`TOTAL ${g}`, 0])),
                'TOTAL PERSONES': 0,
                'BAIXES': 0,
            });
        }
        const proj = projectMap.get(r.idProyecto);
        const gKey = genderMap[r.Nom_genere] || r.Nom_genere;
        const seg = ageSegment(r.C_edad);
        const col = `${gKey} ${seg}`;
        if (col in proj) {
            proj[col]++;
            proj[`TOTAL ${gKey}`]++;
            proj['TOTAL PERSONES']++;
        }
        if (r.Baixa === 1) {
            proj['BAIXES']++;
        }
    }

    return Array.from(projectMap.values());
}

async function genere() {
    const [rows] = await pool.query(`
        SELECT g.Nom_genere, COUNT(*) AS total
        FROM client cl
        JOIN genere g ON cl.idGenere = g.idGenere
        GROUP BY g.Nom_genere
    `);
    return rows;
}

async function sitEco() {
    const [rows] = await pool.query(`
        SELECT se.Nom AS situacio_economica,
               r.Nom_rol AS rol,
               COUNT(*) AS total
        FROM client cl
        JOIN situacio_economica se ON cl.idSituacio_economica = se.idSituacio_economica
        JOIN rol r ON cl.idRol = r.idRol
        GROUP BY se.Nom, r.Nom_rol
        ORDER BY se.Nom, r.Nom_rol
    `);
    return rows;
}

async function rolFam() {
    const [rows] = await pool.query(`
        SELECT r.Nom_rol, COUNT(*) AS total
        FROM client cl
        JOIN rol r ON cl.idRol = r.idRol
        GROUP BY r.Nom_rol
    `);
    return rows;
}

async function tipHab() {
    const [rows] = await pool.query(`
        SELECT td.Nom_domicili, COUNT(*) AS total
        FROM domicili d
        JOIN tipus_domicili td ON d.Tipus_domicili = td.idTipus_domicili
        GROUP BY td.Nom_domicili
        ORDER BY total DESC
    `);
    return rows;
}

async function cont() {
    const [usuaris] = await pool.query(`SELECT COUNT(DISTINCT idClient) AS total FROM client WHERE Baixa = 0`);
    const [families] = await pool.query(`SELECT COUNT(*) AS total FROM familia`);
    const [baixesTotal] = await pool.query(`SELECT COUNT(*) AS total FROM client WHERE Baixa = 1`);
    const [baixesGenere] = await pool.query(`
        SELECT g.Nom_genere, COUNT(*) AS total
        FROM client cl
        JOIN genere g ON cl.idGenere = g.idGenere
        WHERE cl.Baixa = 1
        GROUP BY g.Nom_genere
    `);
    return {
        usuaris_actius: usuaris[0].total,
        families: families[0].total,
        baixes: {
            total: baixesTotal[0].total,
            per_genere: baixesGenere
        }
    };
}

async function neses() {
    const [rows] = await pool.query(`
        SELECT ne.Nom_necessitat, g.Nom_genere, COUNT(*) AS total
        FROM client cl
        JOIN necessitats_especials ne ON cl.idNecessitat_especial = ne.idNecessitat_especial
        JOIN genere g ON cl.idGenere = g.idGenere
        WHERE cl.idNecessitat_especial IS NOT NULL AND cl.idNecessitat_especial != 3
        GROUP BY ne.Nom_necessitat, g.Nom_genere
        ORDER BY ne.Nom_necessitat, g.Nom_genere
    `);
    return rows;
}

async function sebasDev() {
    const [ambSeguiment] = await pool.query(`
        SELECT COUNT(*) AS total FROM client WHERE idSebas != 12
    `);
    const [derivacions] = await pool.query(`
        SELECT COUNT(*) AS total FROM client WHERE derivacio_serveis_socials = 1
    `);
    return {
        amb_seguiment: ambSeguiment[0].total,
        derivacions: derivacions[0].total
    };
}

async function cursAny(any) {
    const [rows] = await pool.query(`
        SELECT ca.Nom AS curs,
               COUNT(*) AS totals,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%promociona%' THEN 1 ELSE 0 END) AS promociona,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%repeteix%' THEN 1 ELSE 0 END) AS repeteix,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%abandona%' THEN 1 ELSE 0 END) AS abandona,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%plaça%' THEN 1 ELSE 0 END) AS sense_placa,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%laboral%' THEN 1 ELSE 0 END) AS mon_laboral
        FROM client cl
        JOIN curs_actual ca ON cl.Curs_actual = ca.idCurs_actual
        LEFT JOIN resultat_academic ra ON cl.Resultat_academic = ra.idResultat_academic
        WHERE YEAR(cl.Data_d_alta) = ?
        GROUP BY ca.Nom
        ORDER BY ca.Nom
    `, [any]);
    return rows.map(r => ({
        ...r,
        percent_promociona: r.totals > 0 ? Math.round((r.promociona / r.totals) * 100) : 0,
        percent_repeteix: r.totals > 0 ? Math.round((r.repeteix / r.totals) * 100) : 0,
        percent_abandona: r.totals > 0 ? Math.round((r.abandona / r.totals) * 100) : 0,
        percent_sense_placa: r.totals > 0 ? Math.round((r.sense_placa / r.totals) * 100) : 0,
        percent_mon_laboral: r.totals > 0 ? Math.round((r.mon_laboral / r.totals) * 100) : 0,
    }));
}

async function resAcad() {
    const [rows] = await pool.query(`
        SELECT ra.Nom_resultat_acad, COUNT(*) AS total
        FROM client cl
        JOIN resultat_academic ra ON cl.Resultat_academic = ra.idResultat_academic
        GROUP BY ra.Nom_resultat_acad
        ORDER BY total DESC
    `);
    return rows;
}

async function motiusBaixa() {
    const [rows] = await pool.query(`
        SELECT mb.Nom_motiu_baixa, COUNT(*) AS total
        FROM client cl
        JOIN motiu_baixa mb ON cl.Motiu_baixa = mb.idMotiu_baixa
        WHERE cl.Baixa = 1
        GROUP BY mb.Nom_motiu_baixa
        ORDER BY total DESC
    `);
    return rows;
}

async function riscos() {
    const [rows] = await pool.query(`
        SELECT r.Nivel, COUNT(*) AS total
        FROM client cl
        JOIN risc r ON cl.Risc = r.idRisc
        GROUP BY r.Nivel
        ORDER BY r.Nivel
    `);
    return rows;
}

async function paisos() {
    const [nacionalitat] = await pool.query(`
        SELECT p.Nom_pais, COUNT(*) AS total
        FROM nacionalitat n
        JOIN pais p ON n.idPais = p.idPais
        GROUP BY p.Nom_pais
        ORDER BY total DESC
    `);
    const [naixement] = await pool.query(`
        SELECT p.Nom_pais, COUNT(*) AS total
        FROM client cl
        JOIN pais p ON cl.Pais_naixement = p.idPais
        GROUP BY p.Nom_pais
        ORDER BY total DESC
    `);
    return { nacionalitat, naixement };
}

module.exports = {
    projectesGeneresEdats, genere, sitEco, rolFam, tipHab, cont,
    neses, sebasDev, cursAny, resAcad, motiusBaixa, riscos, paisos
};
