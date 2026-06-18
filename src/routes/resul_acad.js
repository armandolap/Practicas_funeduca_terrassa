const router = require("express").Router();
const resulAcad = require("../controllers/resul_acad");
const { requireAuth } = require("../middlewares/auth");

router.get("/", requireAuth, resulAcad.getAllResul_acad);

router.get("/:id", requireAuth, resulAcad.getResul_acadById);

module.exports = router;