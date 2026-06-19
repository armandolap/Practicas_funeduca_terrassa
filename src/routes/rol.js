const router = require("express").Router();
const rol = require("../controllers/rol");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, rol.getAllRol);

router.get("/:id", requireAuth, rol.getRolById);

module.exports = router;