const router = require("express").Router();
const resulAcad = require("../controllers/resul_acad");

router.get("/", resulAcad.getAllResul_acad);

router.get("/:id", resulAcad.getResul_acadById);

module.exports = router;