const router = require("express").Router();
const curso = require("../controllers/curso");

router.get("/", curso.getAllcurso);

router.get("/:id", curso.getCursoById);

module.exports = router;