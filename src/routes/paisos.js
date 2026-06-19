const router = require("express").Router();
const paisController = require("../controllers/paisos");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, paisController.getAllPais);

router.get("/:id", requireAuth, paisController.getPaisById);

module.exports = router;