const reportsRepository = require("../repositories/reports");

async function projectesGeneresEdats(req, res) {
    try {
        const data = await reportsRepository.projectesGeneresEdats();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de projectes per gènere i edat" });
    }
}

async function genere(req, res) {
    try {
        const data = await reportsRepository.genere();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de gènere" });
    }
}

async function sitEco(req, res) {
    try {
        const data = await reportsRepository.sitEco();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de situació econòmica" });
    }
}

async function rolFam(req, res) {
    try {
        const data = await reportsRepository.rolFam();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de rol familiar" });
    }
}

async function tipHab(req, res) {
    try {
        const data = await reportsRepository.tipHab();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de tipus d'habitatge" });
    }
}

async function cont(req, res) {
    try {
        const data = await reportsRepository.cont();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint recomptes" });
    }
}

async function neses(req, res) {
    try {
        const data = await reportsRepository.neses();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de necessitats especials" });
    }
}

async function sebasDev(req, res) {
    try {
        const data = await reportsRepository.sebasDev();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de SEBAS" });
    }
}

async function cursAny(req, res) {
    try {
        const { any } = req.params;
        const data = await reportsRepository.cursAny(any);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de curs per any" });
    }
}

async function resAcad(req, res) {
    try {
        const data = await reportsRepository.resAcad();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de resultats acadèmics" });
    }
}

async function motiusBaixa(req, res) {
    try {
        const data = await reportsRepository.motiusBaixa();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de motius de baixa" });
    }
}

async function riscos(req, res) {
    try {
        const data = await reportsRepository.riscos();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de riscos" });
    }
}

async function paisos(req, res) {
    try {
        const data = await reportsRepository.paisos();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obtenint report de països" });
    }
}

module.exports = {
    projectesGeneresEdats,
    genere,
    sitEco,
    rolFam,
    tipHab,
    cont,
    neses,
    sebasDev,
    cursAny,
    resAcad,
    motiusBaixa,
    riscos,
    paisos
};
