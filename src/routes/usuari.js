const router = require("express").Router();
const ctrl = require("../controllers/usuari");

router.get("/", ctrl.getAllUsuarios);
router.post("/", ctrl.createUsuario);
router.get("/:id", ctrl.getUsuarioById);
router.put("/:id", ctrl.updateUsuario);
router.delete("/:id", ctrl.removeUsuario);

module.exports = router;
