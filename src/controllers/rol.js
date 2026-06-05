const rolRepository = require("../repositories/rol");

//GET: /pais
async function getAllRol(req, res) {
    try {
        const rol = await rolRepository.getAll();

        res.status(200).json(rol);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint llistat de rols"
        });
    }
}

//GET: /pais/:id
async function getRolById(req, res) {
    try {
        const { id } = req.params;

        const rol = await rolRepository.getById(id);

        if (!rol) {
            return res.status(404).json({
                message: "Rol no trobat"
            });
        }

        res.status(200).json(rol);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error obtenint Rol"
        });
    }
}

module.exports = {
    getAllRol,
    getRolById
};