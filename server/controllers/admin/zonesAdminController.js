import Zone from '../../models/Zone.js';
import Axis from '../../models/Axis.js';
import Locality from '../../models/Locality.js';

// Helpers
const send404 = (res, what = 'Ressource') => res.status(404).json({ msg: `${what} introuvable` });
const handleErr = (res, err) => {
  const status = err.status || 500;
  return res.status(status).json({ msg: err.message || 'Erreur serveur' });
};

// Lists (admin)
export const listZones = async (req, res) => {
  try {
    const zones = await Zone.findAll({ order: [['id', 'ASC']], attributes: ['id', 'key', 'label'] });
    return res.json(zones);
  } catch (err) { return handleErr(res, err); }
};

export const listAxesByZone = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const zone = await Zone.findByPk(zoneId, { attributes: ['id'] });
    if (!zone) return send404(res, 'Zone');
    const axes = await Axis.findAll({ where: { zoneId: zone.id }, order: [['id', 'ASC']], attributes: ['id', 'zoneId', 'key', 'label'] });
    return res.json(axes);
  } catch (err) { return handleErr(res, err); }
};

export const listLocalitiesByAxis = async (req, res) => {
  try {
    const { axisId } = req.params;
    const axis = await Axis.findByPk(axisId, { attributes: ['id'] });
    if (!axis) return send404(res, 'Axe');
    const locs = await Locality.findAll({ where: { axisId: axis.id }, order: [['id', 'ASC']], attributes: ['id', 'axisId', 'name'] });
    return res.json(locs);
  } catch (err) { return handleErr(res, err); }
};

// Zones
export const createZone = async (req, res) => {
  try {
    const { key, label } = req.body;
    if (!key || !label) return res.status(400).json({ msg: 'key et label requis' });
    // ENUM enforced by model; let Sequelize validate
    const exists = await Zone.findOne({ where: { key } });
    if (exists) return res.status(409).json({ msg: 'Zone déjà existante' });
    const z = await Zone.create({ key, label });
    return res.status(201).json(z);
  } catch (err) { return handleErr(res, err); }
};

export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { label } = req.body;
    const z = await Zone.findByPk(id);
    if (!z) return send404(res, 'Zone');
    if (label) z.label = label;
    await z.save();
    return res.json(z);
  } catch (err) { return handleErr(res, err); }
};

export const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    const z = await Zone.findByPk(id);
    if (!z) return send404(res, 'Zone');
    await z.destroy(); // cascades to axes/localities via FKs
    return res.json({ msg: 'Zone supprimée' });
  } catch (err) { return handleErr(res, err); }
};

// Axes
export const createAxis = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { key, label } = req.body;
    if (!key || !label) return res.status(400).json({ msg: 'key et label requis' });
    const zone = await Zone.findByPk(zoneId);
    if (!zone) return send404(res, 'Zone');
    const exists = await Axis.findOne({ where: { zoneId: zone.id, key } });
    if (exists) return res.status(409).json({ msg: 'Axe déjà existant pour cette zone' });
    const a = await Axis.create({ zoneId: zone.id, key, label });
    return res.status(201).json(a);
  } catch (err) { return handleErr(res, err); }
};

export const updateAxis = async (req, res) => {
  try {
    const { id } = req.params;
    const { label } = req.body;
    const a = await Axis.findByPk(id);
    if (!a) return send404(res, 'Axe');
    if (label) a.label = label;
    await a.save();
    return res.json(a);
  } catch (err) { return handleErr(res, err); }
};

export const deleteAxis = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await Axis.findByPk(id);
    if (!a) return send404(res, 'Axe');
    await a.destroy(); // cascades to localities
    return res.json({ msg: 'Axe supprimé' });
  } catch (err) { return handleErr(res, err); }
};

// Localities
export const createLocality = async (req, res) => {
  try {
    const { axisId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: 'name requis' });
    const axis = await Axis.findByPk(axisId);
    if (!axis) return send404(res, 'Axe');
    const exists = await Locality.findOne({ where: { axisId: axis.id, name } });
    if (exists) return res.status(409).json({ msg: 'Localité déjà existante pour cet axe' });
    const l = await Locality.create({ axisId: axis.id, name });
    return res.status(201).json(l);
  } catch (err) { return handleErr(res, err); }
};

export const updateLocality = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const l = await Locality.findByPk(id);
    if (!l) return send404(res, 'Localité');
    if (name) l.name = name;
    await l.save();
    return res.json(l);
  } catch (err) { return handleErr(res, err); }
};

export const deleteLocality = async (req, res) => {
  try {
    const { id } = req.params;
    const l = await Locality.findByPk(id);
    if (!l) return send404(res, 'Localité');
    await l.destroy();
    return res.json({ msg: 'Localité supprimée' });
  } catch (err) { return handleErr(res, err); }
};
