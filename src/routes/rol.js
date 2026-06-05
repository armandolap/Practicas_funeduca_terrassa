const router = require("express").Router();
const rol = require("../controllers/rol");

router.get("/", rol.getAllRol);

router.get("/:id", rol.getRolById);

module.exports = router;