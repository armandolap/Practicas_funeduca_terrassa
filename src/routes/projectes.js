const router = require("express").Router();
const projectes = require("../controllers/projectes");

router.get("/", projectes.getAllprojectes);

router.get("/:id", projectes.getprojectesById);

module.exports = router;