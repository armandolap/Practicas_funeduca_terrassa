const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuari");

router.get("/", usuarioController.getAllUsuarios);
router.post("/", usuarioController.createUsuario);

router.get("/:id", usuarioController.getUsuarioById);
router.put("/:id", usuarioController.updateUsuario);
router.delete("/:id", usuarioController.removeUsuario);

module.exports = router;
