const repo = require("../repositories/client");
const { isValidDate, isFutureDate, parseDate } = require("../helpers/validators");

function sanitizeLimit(val) {
    const n = parseInt(val);
    return Number.isFinite(n) && n >= 0 ? n : 15;
}

async function getAllClients(req, res) {
    try {
        const { q, familia, genere, barri, edatMin, edatMax, offset, limit } = req.query;
        const parsedOffset = offset !== undefined ? Math.max(0, parseInt(offset) || 0) : undefined;
        const parsedLimit = limit !== undefined ? sanitizeLimit(limit) : undefined;
        const parsedFamilia = Array.isArray(familia) ? familia[0] : familia;
        const parsedGenere = Array.isArray(genere) ? genere[0] : genere;
        const parsedBarri = Array.isArray(barri) ? barri[0] : barri;
        if (q || parsedFamilia || parsedGenere || parsedBarri || edatMin !== undefined || edatMax !== undefined || parsedOffset !== undefined || parsedLimit !== undefined) {
            const result = await repo.getFiltered({ q, familia: parsedFamilia, genere: parsedGenere, barri: parsedBarri, edatMin, edatMax, offset: parsedOffset, limit: parsedLimit });
            return res.json(result);
        }
        const clients = await repo.getAll();
        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint clients" });
    }
}

async function getClientById(req, res) {
    try {
        const { filter } = req.query;
        const client = await repo.getDetailById(req.params.id);
        if (!client) return res.status(404).json({ message: "Client no trobat" });
        const projectes = await repo.getProjectsByClient(req.params.id, filter || "tots");
        const nacionalitats = await repo.getNacionalitats(req.params.id);
        res.json({ ...client, projectes, nacionalitats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint client" });
    }
}

async function createClient(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Dades de client obligatòries" });
        }
        const { Nom, Cognoms } = req.body;
        if (!Nom?.trim() || !Cognoms?.trim()) {
            return res.status(400).json({ message: "Nom i Cognoms obligatoris" });
        }
        if (Nom && Nom.length > 100) return res.status(400).json({ message: "Nom no pot superar 100 caràcters" });
        if (Cognoms && Cognoms.length > 100) return res.status(400).json({ message: "Cognoms no pot superar 100 caràcters" });
        const id = await repo.create(req.body);
        res.status(201).json({ message: "Client creat", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant client" });
    }
}

async function updateClient(req, res) {
    try {
        const existing = await repo.getDetailById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Client no trobat" });
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Dades d'actualització obligatòries" });
        }
        if (req.body.Fecha_nacimiento) {
            const nac = new Date(req.body.Fecha_nacimiento);
            const avui = new Date();
            let edad = avui.getFullYear() - nac.getFullYear();
            const m = avui.getMonth() - nac.getMonth();
            if (m < 0 || (m === 0 && avui.getDate() < nac.getDate())) edad--;
            req.body.C_edad = edad;
        }
        await repo.update(req.params.id, req.body);
        res.json({ message: "Client actualitzat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant client" });
    }
}

async function deleteClient(req, res) {
    try {
        const affected = await repo.remove(req.params.id);
        if (affected === 0) return res.status(404).json({ message: "Client no trobat" });
        res.json({ message: "Client eliminat" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant client" });
    }
}

function calcTempsEntitat(altaDateStr) {
    const alta = new Date(altaDateStr);
    const avui = new Date();
    let anys = avui.getFullYear() - alta.getFullYear();
    let mesos = avui.getMonth() - alta.getMonth();
    if (mesos < 0) { anys--; mesos += 12; }
    if (anys > 0) return anys === 1 ? "1 any" : `${anys} anys`;
    if (mesos > 0) return mesos === 1 ? "1 mes" : `${mesos} mesos`;
    return "0";
}

async function createFullClient(req, res) {
    try {
        const { client: clientData, familia, domicili } = req.body;
        if (!clientData) return res.status(400).json({ message: "Dades de client obligatòries" });
        const { Nom, Cognoms, Fecha_nacimiento, Data_d_alta, idGenere, Telefon, Correu_electronic,
                idRol, idSituacio_economica, Pais_naixement, derivacio_serveis_socials,
                Risc, Resultat_academic, Curs_actual, idSebas, idNecessitat_especial } = clientData;
        if (!Nom?.trim()) return res.status(400).json({ message: "Nom obligatori" });
        if (!Cognoms?.trim()) return res.status(400).json({ message: "Cognoms obligatoris" });
        if (Nom && Nom.length > 100) return res.status(400).json({ message: "Nom no pot superar 100 caràcters" });
        if (Cognoms && Cognoms.length > 100) return res.status(400).json({ message: "Cognoms no pot superar 100 caràcters" });
        if (!Fecha_nacimiento) return res.status(400).json({ message: "Fecha naixement obligatòria" });
        if (typeof idGenere !== "number" || !Number.isFinite(idGenere)) return res.status(400).json({ message: "idGenere ha de ser un número" });
        if (typeof idRol !== "number" || !Number.isFinite(idRol)) return res.status(400).json({ message: "idRol ha de ser un número" });
        if (typeof idSituacio_economica !== "number" || !Number.isFinite(idSituacio_economica)) return res.status(400).json({ message: "idSituacio_economica ha de ser un número" });
        if (typeof Pais_naixement !== "number" || !Number.isFinite(Pais_naixement)) return res.status(400).json({ message: "Pais_naixement ha de ser un número" });
        if (!isValidDate(Fecha_nacimiento)) return res.status(400).json({ message: "Fecha naixement no és una data vàlida" });
        if (isFutureDate(Fecha_nacimiento)) return res.status(400).json({ message: "Fecha naixement no pot ser futura" });
        if (Data_d_alta) {
            if (!isValidDate(Data_d_alta)) return res.status(400).json({ message: "Data d'alta no és una data vàlida" });
            if (isFutureDate(Data_d_alta)) return res.status(400).json({ message: "Data d'alta no pot ser futura" });
        }
        if (!familia?.idFamilia && !familia?.Estructura_familiar) {
            return res.status(400).json({ message: "Estructura familiar obligatòria si no s'assigna una família existent" });
        }
        if (!domicili?.idDomicili && !domicili?.idcallejero) {
            return res.status(400).json({ message: "Dades de domicili obligatòries si no s'assigna un d'existent" });
        }
        const nac = parseDate(Fecha_nacimiento);
        const avui = new Date();
        let C_edad = avui.getFullYear() - nac.getFullYear();
        const m = avui.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && avui.getDate() < nac.getDate())) C_edad--;
        const RISK_SENSE_RISC = 1, SEBAS_NO_SEBAS = 12, CURS_NO_APLICA = 26;
        const altaDate = Data_d_alta || new Date().toISOString().split("T")[0];
        const temps = calcTempsEntitat(altaDate);
        const payload = {
            domicili: domicili || {},
            familia: { idFamilia: familia?.idFamilia || null, Cognom_familiar: familia?.Cognom_familiar || Cognoms, Estructura_familiar: familia?.Estructura_familiar || null },
            client: { Nom, Cognoms, Telefon: Telefon || null, Correu_electronic: Correu_electronic || null, Data_d_alta: altaDate, C_temps_a_lentitat: temps, Fecha_nacimiento, C_edad, idGenere, idRol, idSituacio_economica, Pais_naixement, derivacio_serveis_socials: derivacio_serveis_socials ?? 0, Risc: Risc ?? RISK_SENSE_RISC, Resultat_academic: Resultat_academic ?? null, Curs_actual: Curs_actual ?? CURS_NO_APLICA, idSebas: idSebas ?? SEBAS_NO_SEBAS, idNecessitat_especial: idNecessitat_especial ?? null },
            nacionalitat: Pais_naixement
        };
        const id = await repo.createFull(payload);
        res.status(201).json({ message: "Client creat correctament", id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creant client complet" });
    }
}

async function updateFullClient(req, res) {
    try {
        const existing = await repo.getDetailById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Client no trobat" });

        const { client: clientData, familia, domicili } = req.body;
        if (!clientData) return res.status(400).json({ message: "Dades de client obligatòries" });

        const { Nom, Cognoms, Fecha_nacimiento, idGenere } = clientData;
        if (!Nom?.trim()) return res.status(400).json({ message: "Nom obligatori" });
        if (!Cognoms?.trim()) return res.status(400).json({ message: "Cognoms obligatoris" });
        if (Nom && Nom.length > 100) return res.status(400).json({ message: "Nom no pot superar 100 caràcters" });
        if (Cognoms && Cognoms.length > 100) return res.status(400).json({ message: "Cognoms no pot superar 100 caràcters" });
        if (!Fecha_nacimiento) return res.status(400).json({ message: "Fecha naixement obligatòria" });
        if (typeof idGenere !== "number" || !Number.isFinite(idGenere)) return res.status(400).json({ message: "idGenere ha de ser un número" });
        if (!isValidDate(Fecha_nacimiento)) return res.status(400).json({ message: "Fecha naixement no és una data vàlida" });
        if (isFutureDate(Fecha_nacimiento)) return res.status(400).json({ message: "Fecha naixement no pot ser futura" });

        const nac = parseDate(Fecha_nacimiento);
        const avui = new Date();
        let C_edad = avui.getFullYear() - nac.getFullYear();
        const m = avui.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && avui.getDate() < nac.getDate())) C_edad--;

        const RISK_SENSE_RISC = 1, SEBAS_NO_SEBAS = 12, CURS_NO_APLICA = 26;
        const altaDate = clientData.Data_d_alta || existing.Data_d_alta || new Date().toISOString().split("T")[0];
        const temps = calcTempsEntitat(altaDate);

        const payload = {
            domicili: domicili || {},
            familia: {
                idFamilia: familia?.idFamilia || null,
                Cognom_familiar: familia?.Cognom_familiar || Cognoms,
                Estructura_familiar: familia?.Estructura_familiar || null
            },
            client: {
                idRol: clientData.idRol, idGenere, Nom, Cognoms,
                Telefon: clientData.Telefon || null,
                Correu_electronic: clientData.Correu_electronic || null,
                Data_d_alta: altaDate, C_temps_a_lentitat: temps,
                Fecha_nacimiento, C_edad,
                Pais_naixement: clientData.Pais_naixement,
                Risc: clientData.Risc ?? RISK_SENSE_RISC,
                Resultat_academic: clientData.Resultat_academic ?? null,
                idSituacio_economica: clientData.idSituacio_economica,
                idSebas: clientData.idSebas ?? SEBAS_NO_SEBAS,
                idNecessitat_especial: clientData.idNecessitat_especial ?? null,
                derivacio_serveis_socials: clientData.derivacio_serveis_socials ?? 0,
                Curs_actual: clientData.Curs_actual ?? CURS_NO_APLICA,
                Baixa: clientData.Baixa ?? existing.Baixa ?? 0
            }
        };

        await repo.updateFull(req.params.id, payload);
        res.json({ message: "Client actualitzat correctament" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualitzant client complet" });
    }
}

async function baixaClient(req, res) {
    try {
        const existing = await repo.getDetailById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Client no trobat" });
        const { Motiu_baixa, Data_baixa } = req.body || {};
        const motiu = parseInt(Motiu_baixa);
        if (!Number.isFinite(motiu)) return res.status(400).json({ message: "Motiu de baixa obligatori" });
        const data = Data_baixa || new Date().toISOString().split("T")[0];
        if (!isValidDate(data)) return res.status(400).json({ message: "Data de baixa no és una data vàlida" });
        if (isFutureDate(data)) return res.status(400).json({ message: "Data de baixa no pot ser futura" });
        await repo.setBaixa(req.params.id, { Motiu_baixa: motiu, Data_baixa: data });
        res.json({ message: "Client donat de baixa" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error donant de baixa" });
    }
}

async function altaClient(req, res) {
    try {
        const existing = await repo.getDetailById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Client no trobat" });
        await repo.setAlta(req.params.id);
        res.json({ message: "Client donat d'alta" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error donant d'alta" });
    }
}

async function addClientNacionalitat(req, res) {
    try {
        const existing = await repo.getDetailById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Client no trobat" });
        const idPais = parseInt(req.body?.idPais);
        if (!Number.isFinite(idPais)) return res.status(400).json({ message: "idPais obligatori" });
        await repo.addNacionalitat(req.params.id, idPais);
        const nacionalitats = await repo.getNacionalitats(req.params.id);
        res.status(201).json({ message: "Nacionalitat afegida", nacionalitats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error afegint nacionalitat" });
    }
}

async function removeClientNacionalitat(req, res) {
    try {
        const affected = await repo.removeNacionalitat(req.params.id, req.params.idPais);
        if (affected === 0) return res.status(404).json({ message: "Nacionalitat no trobada" });
        res.json({ message: "Nacionalitat eliminada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminant nacionalitat" });
    }
}

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient, createFullClient, updateFullClient, addClientNacionalitat, removeClientNacionalitat, baixaClient, altaClient };
