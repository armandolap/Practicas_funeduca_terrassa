const router = require("express").Router();
const ctrl = require("../controllers/usuari");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, ctrl.getAllUsuarios);
router.post("/", requireAuth, ctrl.createUsuario);
router.get("/:id", requireAuth, ctrl.getUsuarioById);
router.put("/:id", requireAuth, ctrl.updateUsuario);
router.delete("/:id", requireAuth, ctrl.removeUsuario);

module.exports = router;
