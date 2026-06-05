const router = require("express").Router();
const curso = require("../controllers/curso");

router.get("/", neses.getAllCurso);

router.get("/:id", neses.getCursoById);

module.exports = router;