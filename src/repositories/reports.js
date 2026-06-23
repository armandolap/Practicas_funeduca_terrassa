const { createPool } = require("../config/database");
const pool = createPool();

// Subconsulta reutilitzable: restringeix els clients als inscrits en algun
// projecte amb l'any lectiu (idCurs_lectiu) indicat. `alias` és l'àlies de la
// taula client a la query. Retorna { clause, params } per concatenar al WHERE.
function anyLectiuFilter(alias, anyLectiu) {
    if (!anyLectiu) return { clause: "", params: [] };
    return {
        clause: ` AND ${alias}.idClient IN (
            SELECT phc_f.idClient FROM proyectos_has_client phc_f
            JOIN proyectos pr_f ON phc_f.idProyecto = pr_f.idProyecto
            WHERE pr_f.idCurs_lectiu = ?
        )`,
        params: [anyLectiu]
    };
}

async function projectesGeneresEdats(anyLectiu) {
    const f = anyLectiu ? ` AND p.idCurs_lectiu = ?` : "";
    const fp = anyLectiu ? [anyLectiu] : [];
    const [rows] = await pool.query(`
        SELECT p.idProyecto, p.Nom_projecte,
               g.Nom_genere, cl.C_edad,
               cl.Baixa, cl.idClient
        FROM proyectos p
        JOIN proyectos_has_client phc ON p.idProyecto = phc.idProyecto
        JOIN client cl ON phc.idClient = cl.idClient
        JOIN genere g ON cl.idGenere = g.idGenere
        WHERE 1=1${f}
        ORDER BY p.Nom_projecte, cl.C_edad
    `, fp);

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

async function genere(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT g.Nom_genere, COUNT(*) AS total
        FROM client cl
        JOIN genere g ON cl.idGenere = g.idGenere
        WHERE 1=1${f.clause}
        GROUP BY g.Nom_genere
    `, f.params);
    return rows;
}

async function sitEco(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT se.idSituacio_economica, se.Nom AS situacio_economica,
               SUM(CASE WHEN r.idRol = 3 THEN 1 ELSE 0 END) AS fills,
               SUM(CASE WHEN r.idRol != 3 THEN 1 ELSE 0 END) AS resta,
               COUNT(cl.idClient) AS total
        FROM situacio_economica se
        LEFT JOIN client cl ON cl.idSituacio_economica = se.idSituacio_economica${f.clause}
        LEFT JOIN rol r ON cl.idRol = r.idRol
        GROUP BY se.idSituacio_economica, se.Nom
        ORDER BY se.idSituacio_economica
    `, f.params);
    return rows.map(r => ({
        'SITUACIÓ ECONÒMICA': r.situacio_economica,
        'FILLS/FILLES': Number(r.fills),
        'ADULTS': Number(r.resta),
        'TOTAL': Number(r.total)
    }));
}

async function rolFam(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT r.Nom_rol, COUNT(*) AS total
        FROM client cl
        JOIN rol r ON cl.idRol = r.idRol
        WHERE 1=1${f.clause}
        GROUP BY r.Nom_rol
    `, f.params);
    return rows;
}

async function tipHab(anyLectiu) {
    const f = anyLectiu ? ` AND d.idDomicili IN (
            SELECT cl_f.idDomicili FROM client cl_f
            WHERE cl_f.idClient IN (
                SELECT phc_f.idClient FROM proyectos_has_client phc_f
                JOIN proyectos pr_f ON phc_f.idProyecto = pr_f.idProyecto
                WHERE pr_f.idCurs_lectiu = ?
            )
        )` : "";
    const fp = anyLectiu ? [anyLectiu] : [];
    const [rows] = await pool.query(`
        SELECT td.Nom_domicili, COUNT(*) AS total
        FROM domicili d
        JOIN tipus_domicili td ON d.Tipus_domicili = td.idTipus_domicili
        WHERE 1=1${f}
        GROUP BY td.Nom_domicili
        ORDER BY total DESC
    `, fp);
    return rows;
}

async function cont(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [genderRows] = await pool.query(`
        SELECT g.idGenere, COUNT(cl.idClient) AS total
        FROM genere g
        LEFT JOIN client cl ON cl.idGenere = g.idGenere${f.clause}
        GROUP BY g.idGenere
        ORDER BY g.idGenere
    `, f.params);
    const [baixesRows] = await pool.query(`
        SELECT g.idGenere, COUNT(cl.idClient) AS total
        FROM genere g
        LEFT JOIN client cl ON cl.idGenere = g.idGenere AND cl.Baixa = 1${f.clause}
        GROUP BY g.idGenere
        ORDER BY g.idGenere
    `, f.params);
    const famFilter = anyLectiu ? ` WHERE f.idFamilia IN (
            SELECT cl_f.idFamilia FROM client cl_f
            WHERE cl_f.idClient IN (
                SELECT phc_f.idClient FROM proyectos_has_client phc_f
                JOIN proyectos pr_f ON phc_f.idProyecto = pr_f.idProyecto
                WHERE pr_f.idCurs_lectiu = ?
            )
        )` : "";
    const [[famTotal]] = await pool.query(`SELECT COUNT(*) AS total FROM familia f${famFilter}`, anyLectiu ? [anyLectiu] : []);

    const toCounts = (rows) => {
        const home = Number(rows.find(r => r.idGenere === 1)?.total || 0);
        const dona = Number(rows.find(r => r.idGenere === 2)?.total || 0);
        const nb   = Number(rows.find(r => r.idGenere === 3)?.total || 0);
        return { home, dona, nb, total: home + dona + nb };
    };

    const u = toCounts(genderRows);
    const b = toCounts(baixesRows);

    return [
        { 'Tipus': 'Usuaris únics',  'Home': u.home, 'Dona': u.dona, 'NB': u.nb, 'Total': u.total },
        { 'Tipus': 'Families úniques','Home': 0,      'Dona': 0,      'NB': 0,   'Total': Number(famTotal.total) },
        { 'Tipus': 'Baixes',          'Home': b.home, 'Dona': b.dona, 'NB': b.nb, 'Total': b.total },
    ];
}

async function neses(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT ne.idNecessitat_especial, ne.Nom_necessitat,
               SUM(CASE WHEN g.Nom_genere = 'Masculí' THEN 1 ELSE 0 END) AS homes,
               SUM(CASE WHEN g.Nom_genere = 'Femení' THEN 1 ELSE 0 END) AS dones,
               SUM(CASE WHEN g.Nom_genere = 'Non binari' THEN 1 ELSE 0 END) AS nb,
               COUNT(cl.idClient) AS total
        FROM necessitats_especials ne
        LEFT JOIN client cl ON cl.idNecessitat_especial = ne.idNecessitat_especial${f.clause}
        LEFT JOIN genere g ON cl.idGenere = g.idGenere
        GROUP BY ne.idNecessitat_especial, ne.Nom_necessitat
        ORDER BY ne.idNecessitat_especial
    `, f.params);

    const result = rows.map(r => ({
        'NESE': r.Nom_necessitat,
        'Total': Number(r.total),
        'Dones': Number(r.dones),
        'Homes': Number(r.homes),
        'NB': Number(r.nb),
    }));

    const totals = { 'NESE': 'TOTAL', 'Total': 0, 'Dones': 0, 'Homes': 0, 'NB': 0 };
    for (const r of result) {
        totals.Total += r.Total;
        totals.Dones += r.Dones;
        totals.Homes += r.Homes;
        totals.NB += r.NB;
    }
    result.push(totals);
    return result;
}

async function sebasDev(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT s.idSebas, s.Nom,
               COUNT(cl.idClient) AS ambSeguiment,
               SUM(CASE WHEN cl.derivacio_serveis_socials = 1 THEN 1 ELSE 0 END) AS derivacions
        FROM sebas s
        LEFT JOIN client cl ON cl.idSebas = s.idSebas${f.clause}
        GROUP BY s.idSebas, s.Nom
        ORDER BY s.idSebas
    `, f.params);

    const result = rows.map(r => ({
        'SEBAS': r.Nom,
        'Total amb seguiment': Number(r.ambSeguiment),
        'Total derivacions': Number(r.derivacions),
    }));

    const totals = { 'SEBAS': 'TOTAL', 'Total amb seguiment': 0, 'Total derivacions': 0 };
    for (const r of result) {
        totals['Total amb seguiment'] += r['Total amb seguiment'];
        totals['Total derivacions'] += r['Total derivacions'];
    }
    result.push(totals);
    return result;
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

async function cursAcademic(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT ca.idCurs_actual, ca.Nom AS curs,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%promociona%'
                          OR ra.Nom_resultat_acad LIKE '%repeteix%'
                          OR ra.Nom_resultat_acad LIKE '%abandona%'
                          OR ra.Nom_resultat_acad LIKE '%plaça%'
                          OR ra.Nom_resultat_acad LIKE '%laboral%' THEN 1 ELSE 0 END) AS totals,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%promociona%' THEN 1 ELSE 0 END) AS promociona,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%repeteix%' THEN 1 ELSE 0 END) AS repeteix,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%abandona%' THEN 1 ELSE 0 END) AS abandona,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%plaça%' THEN 1 ELSE 0 END) AS sense_placa,
               SUM(CASE WHEN ra.Nom_resultat_acad LIKE '%laboral%' THEN 1 ELSE 0 END) AS mon_laboral
        FROM curs_actual ca
        LEFT JOIN client cl ON cl.Curs_actual = ca.idCurs_actual${f.clause}
        LEFT JOIN resultat_academic ra ON cl.Resultat_academic = ra.idResultat_academic
        WHERE ca.Nom <> 'No aplica'
        GROUP BY ca.idCurs_actual, ca.Nom
        ORDER BY ca.idCurs_actual
    `, f.params);
    const pct = (part, total) => total > 0 ? String(Math.round((part / total) * 100)) + '%' : '0%';
    const result = rows.map(r => ({
        'CURS ACTUAL': r.curs,
        'TOTALS ANY ACTUAL': Number(r.totals),
        'PROMOCIONA': Number(r.promociona),
        'PERCENTATGE PROMOCIONA': pct(r.promociona, r.totals),
        'REPETEIX': Number(r.repeteix),
        'PERCENTATGE REPETEIX': pct(r.repeteix, r.totals),
        'ABANDONA ESTUDIS': Number(r.abandona),
        'PERCENTATGE ABANDONA': pct(r.abandona, r.totals),
        'NO OPTÉ PLAÇA': Number(r.sense_placa),
        'PERCENTATGE SENSE PLAÇA': pct(r.sense_placa, r.totals),
        'ACCEDEIX MÓN LABORAL': Number(r.mon_laboral),
        'PERCENTATGE ACCÉS MÓN LABORAL': pct(r.mon_laboral, r.totals),
    }));
    const tot = { 'CURS ACTUAL': 'TOTAL', 'TOTALS ANY ACTUAL': 0, 'PROMOCIONA': 0, 'PERCENTATGE PROMOCIONA': '0%', 'REPETEIX': 0, 'PERCENTATGE REPETEIX': '0%', 'ABANDONA ESTUDIS': 0, 'PERCENTATGE ABANDONA': '0%', 'NO OPTÉ PLAÇA': 0, 'PERCENTATGE SENSE PLAÇA': '0%', 'ACCEDEIX MÓN LABORAL': 0, 'PERCENTATGE ACCÉS MÓN LABORAL': '0%' };
    for (const r of result) {
        tot['TOTALS ANY ACTUAL'] += r['TOTALS ANY ACTUAL'];
        tot['PROMOCIONA'] += r['PROMOCIONA'];
        tot['REPETEIX'] += r['REPETEIX'];
        tot['ABANDONA ESTUDIS'] += r['ABANDONA ESTUDIS'];
        tot['NO OPTÉ PLAÇA'] += r['NO OPTÉ PLAÇA'];
        tot['ACCEDEIX MÓN LABORAL'] += r['ACCEDEIX MÓN LABORAL'];
    }
    const t = tot['TOTALS ANY ACTUAL'];
    tot['PERCENTATGE PROMOCIONA'] = pct(tot['PROMOCIONA'], t);
    tot['PERCENTATGE REPETEIX'] = pct(tot['REPETEIX'], t);
    tot['PERCENTATGE ABANDONA'] = pct(tot['ABANDONA ESTUDIS'], t);
    tot['PERCENTATGE SENSE PLAÇA'] = pct(tot['NO OPTÉ PLAÇA'], t);
    tot['PERCENTATGE ACCÉS MÓN LABORAL'] = pct(tot['ACCEDEIX MÓN LABORAL'], t);
    result.push(tot);
    return result;
}

async function resAcad(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT ra.Nom_resultat_acad, COUNT(*) AS total
        FROM client cl
        JOIN resultat_academic ra ON cl.Resultat_academic = ra.idResultat_academic
        WHERE 1=1${f.clause}
        GROUP BY ra.Nom_resultat_acad
        ORDER BY total DESC
    `, f.params);
    return rows;
}

async function motiusBaixa(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT mb.Nom_motiu_baixa, COUNT(*) AS total
        FROM client cl
        JOIN motiu_baixa mb ON cl.Motiu_baixa = mb.idMotiu_baixa
        WHERE cl.Baixa = 1${f.clause}
        GROUP BY mb.Nom_motiu_baixa
        ORDER BY total DESC
    `, f.params);
    return rows;
}

async function riscos(anyLectiu) {
    const f = anyLectiuFilter("cl", anyLectiu);
    const [rows] = await pool.query(`
        SELECT r.Nivel, COUNT(*) AS total
        FROM client cl
        JOIN risc r ON cl.Risc = r.idRisc
        WHERE 1=1${f.clause}
        GROUP BY r.Nivel
        ORDER BY r.Nivel
    `, f.params);
    return rows;
}

async function paisos(anyLectiu) {
    // Filtre opcional per any lectiu: només clients inscrits en projectes
    // amb aquest idCurs_lectiu (s'aplica tant a naixement com a nacionalitat).
    const sub = anyLectiu ? `
        AND %ALIAS%.idClient IN (
            SELECT phc_f.idClient FROM proyectos_has_client phc_f
            JOIN proyectos pr_f ON phc_f.idProyecto = pr_f.idProyecto
            WHERE pr_f.idCurs_lectiu = ?
        )` : "";
    const nascutsSub = sub.replace("%ALIAS%", "cl");
    const nacSub = sub.replace("%ALIAS%", "n");
    const params = anyLectiu ? [anyLectiu, anyLectiu] : [];

    const [rows] = await pool.query(`
        SELECT p.Nom_pais AS pais,
               (SELECT COUNT(*) FROM client cl
                WHERE cl.Pais_naixement = p.idPais${nascutsSub}) AS nascuts,
               (SELECT COUNT(*) FROM nacionalitat n
                WHERE n.idPais = p.idPais${nacSub}) AS nacionalitat
        FROM pais p
        HAVING nascuts > 0 OR nacionalitat > 0
        ORDER BY nascuts DESC, nacionalitat DESC
    `, params);
    return rows.map(r => ({
        'PAÍS': r.pais,
        'NASCUTS': Number(r.nascuts),
        'NACIONALITAT': Number(r.nacionalitat)
    }));
}

module.exports = {
    projectesGeneresEdats, genere, sitEco, rolFam, tipHab, cont,
    neses, sebasDev, cursAny, cursAcademic, resAcad, motiusBaixa, riscos, paisos
};
