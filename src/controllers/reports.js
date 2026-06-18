const repo = require("../repositories/reports");

async function getProjectesGeneresEdats(req, res) {
    try { res.json(await repo.projectesGeneresEdats()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getGenere(req, res) {
    try { res.json(await repo.genere()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getSitEco(req, res) {
    try { res.json(await repo.sitEco()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getRolFam(req, res) {
    try { res.json(await repo.rolFam()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getTipHab(req, res) {
    try { res.json(await repo.tipHab()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getCont(req, res) {
    try { res.json(await repo.cont()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getNeses(req, res) {
    try { res.json(await repo.neses()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getSebasDev(req, res) {
    try { res.json(await repo.sebasDev()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getCursAny(req, res) {
    try { res.json(await repo.cursAny(req.params.any)); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getResAcad(req, res) {
    try { res.json(await repo.resAcad()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getMotiusBaixa(req, res) {
    try { res.json(await repo.motiusBaixa()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getRiscos(req, res) {
    try { res.json(await repo.riscos()); } catch (e) { res.status(500).json({ message: e.message }); }
}
async function getPaisos(req, res) {
    try { res.json(await repo.paisos()); } catch (e) { res.status(500).json({ message: e.message }); }
}

module.exports = {
    getProjectesGeneresEdats, getGenere, getSitEco, getRolFam, getTipHab, getCont,
    getNeses, getSebasDev, getCursAny, getResAcad, getMotiusBaixa, getRiscos, getPaisos
};
