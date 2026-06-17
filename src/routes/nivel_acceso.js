const router = require("express").Router();
const nivelAcceso = require("../controllers/nivel_acceso");

router.get("/", nivelAcceso.getAll);
router.get("/:id", nivelAcceso.getById);

module.exports = router;
