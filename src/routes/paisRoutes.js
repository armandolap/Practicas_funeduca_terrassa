const router = require("express").Router();
const paisController = require("../controllers/paisController");

router.get("/", paisController.getAllPais);

router.get("/:id", paisController.getPaisById);

module.exports = router;