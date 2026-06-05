const router = require("express").Router();
const resulAcad = require("../controllers/resul_acad");

router.get("/", resulAcad.getAllResulAcad);

router.get("/:id", resulAcad.getResulAcadById);

module.exports = router;