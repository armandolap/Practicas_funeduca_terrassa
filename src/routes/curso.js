const router = require("express").Router();
const curso = require("../controllers/curso");

router.get("/", curso.getAllcurso);
router.post("/",curso.createCurso);

router.get("/:id", curso.getCursoById);
router.put("/:id",curso.updateCurso);
router.delete("/:id",curso.deleteCurso);
module.exports = router;