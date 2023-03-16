const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { create, list, update, erase, getOne } = require("../data-handler");

const restrictedRoutes = "/:entity(pets|vets|owners|consults)";

//listar mascotas
router.get(restrictedRoutes, async (req, res) => {
  const { entity = null } = req.params;
  if (!entity) {
    res.status(404).json({ mensaje: "not found" });
  }
  const pets = await list({ entityDir: entity });
  res.status(200).json(pets);
});

//obtener una sola mascota
router.get(`${restrictedRoutes}/:_id`, async (req, res) => {
  const { _id = null, entity = null } = req.params;
  if (!_id) {
    return res.status(400).json({ mensaje: "missing id" });
  }
  if (!entity) {
    res.status(404).json({ mensaje: "not found" });
  }
  const singlePet = await getOne({ entityDir: entity, fileName: _id });
  if (singlePet) {
    res.status(200).json(singlePet);
  }
  res.status(404).json({ mensaje: "no encontrado" });
});

//crear mascotas
router.post(restrictedRoutes, async (req, res) => {
  const { entity = null } = req.params;
  if (!entity) {
    res.status(404).json({ mensaje: "not found" });
  }
  //si hay datos en el body y si el body no está vacio en algun campo
  if (req.body && Object.keys(req.body).length > 0) {
    //crear un identificador unico para cada json de mascota
    const _id = uuidv4();
    //con el fin de que el id se integre al cuerpo del json, copiamos el req.body a un nuevo objeto, y le agregamos el _id
    const newPet = { ...req.body, _id };
    //petCreated es lo que se envia
    const petCreated = await create({
      entityDir: entity,
      fileName: _id,
      dataSave: newPet,
    });
    res.status(200).json(petCreated);
  }
  return res.status(400).json({ mensaje: "missing body" });
});

//editar mascotas
router.put(`${restrictedRoutes}/:_id`, async (req, res) => {
  //verificar que exista el _id, con el fin de verificar si existen mascotas
  const { _id = null, entity = null } = req.params;
  if (!_id) {
    return res.status(400).json({ mensaje: "missing id" });
  }
  if (!entity) {
    res.status(404).json({ mensaje: "not found" });
  }
  //si hay datos en el body y si el body no está vacio en algun campo
  if (req.body && Object.keys(req.body).length > 0) {
    const currentData = { ...req.body, _id };
    const updatedPet = await update({
      entityDir: entity,
      fileName: _id,
      currentData,
    });
    return res.status(200).json(updatedPet);
  }
  return res.status(400).json({ mensaje: "missing body" });
});

//eliminar mascotas
router.delete(`${restrictedRoutes}/:_id`, async (req, res) => {
  //verificar que exista el _id, con el fin de verificar si existen mascotas
  const { _id = null, entity = null } = req.params;
  if (!_id) {
    return res.status(400).json({ mensaje: "missing id" });
  }
  if (!entity) {
    res.status(404).json({ mensaje: "not found" });
  }
  await erase({ entityDir: entity, fileName: _id });
  return res.status(204).send();
});

module.exports = router;
