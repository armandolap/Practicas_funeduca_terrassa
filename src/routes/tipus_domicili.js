const router = require("express").Router();
const paisController = require("../controllers/tipus_domicili");

router.get("/", paisController.getAllTipo_Domicilo);

router.get("/:id", paisController.getTipo_DomiciloById);

module.exports = router;

    getAlltipo_domicilio,
    gettipo_domicilioById