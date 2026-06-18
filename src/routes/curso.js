const router = require("express").Router();
const curso = require("../controllers/curso");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, curso.getAllcurso);
router.post("/", requireAuth, curso.createCurso);

router.get("/:id", requireAuth, curso.getCursoById);
router.put("/:id", requireAuth, curso.updateCurso);
router.delete("/:id", requireAuth, curso.deleteCurso);
module.exports = router;