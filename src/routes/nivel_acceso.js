const router = require("express").Router();
const nivelAcceso = require("../controllers/nivel_acceso");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, nivelAcceso.getAll);
router.get("/:id", requireAuth, nivelAcceso.getById);

module.exports = router;
