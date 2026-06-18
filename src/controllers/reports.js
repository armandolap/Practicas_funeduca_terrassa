const repo = require("../repositories/reports");

async function getProjectesGeneresEdats(req, res) {
    try {
        const data = await repo.projectesGeneresEdats();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de projectes per gènere i edats" });
    }
}

async function getGenere(req, res) {
    try {
        const data = await repo.genere();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de gènere" });
    }
}

async function getSitEco(req, res) {
    try {
        const data = await repo.sitEco();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de situació econòmica" });
    }
}

async function getRolFam(req, res) {
    try {
        const data = await repo.rolFam();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de rol familiar" });
    }
}

async function getTipHab(req, res) {
    try {
        const data = await repo.tipHab();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de tipus d'habitatge" });
    }
}

async function getCont(req, res) {
    try {
        const data = await repo.cont();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir recomptes" });
    }
}

async function getNeses(req, res) {
    try {
        const data = await repo.neses();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de necessitats especials" });
    }
}

async function getSebasDev(req, res) {
    try {
        const data = await repo.sebasDev();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports SEBAS" });
    }
}

async function getCursAny(req, res) {
    try {
        const data = await repo.cursAny(req.params.any);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports per curs" });
    }
}

async function getResAcad(req, res) {
    try {
        const data = await repo.resAcad();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de resultats acadèmics" });
    }
}

async function getMotiusBaixa(req, res) {
    try {
        const data = await repo.motiusBaixa();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de motius de baixa" });
    }
}

async function getRiscos(req, res) {
    try {
        const data = await repo.riscos();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de riscos" });
    }
}

async function getPaisos(req, res) {
    try {
        const data = await repo.paisos();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtenir reports de països" });
    }
}

module.exports = {
    getProjectesGeneresEdats, getGenere, getSitEco, getRolFam, getTipHab, getCont,
    getNeses, getSebasDev, getCursAny, getResAcad, getMotiusBaixa, getRiscos, getPaisos
};
