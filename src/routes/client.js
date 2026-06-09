const router = require("express").Router();
const client = require("../controllers/client");

router.get("/", client.getAllClients);
router.post("/", client.createClient);

router.get("/:id", client.getClientById);
router.put("/:id", client.updateClient);
router.delete("/:id", client.deleteClient);

module.exports = router;
