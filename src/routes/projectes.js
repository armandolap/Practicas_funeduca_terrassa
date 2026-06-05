const router = require("express").Router();
const projectes = require("../controllers/projectes");

router.get("/", projectes.getAllProjectes);

router.get("/:id", projectes.getProjectesById);

module.exports = router;