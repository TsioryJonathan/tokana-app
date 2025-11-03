import Joi from 'joi';
import UserAddress from '../models/UserAddress.js';

const idParamSchema = Joi.object({ id: Joi.number().integer().positive().required() });

const upsertSchema = Joi.object({
  label: Joi.string().allow('', null).optional(),
  mapboxAddress: Joi.string().allow('', null).optional(),
  detail: Joi.string().min(3).max(255).required(),
  lat: Joi.number().min(-90).max(90).optional(),
  lng: Joi.number().min(-180).max(180).optional(),
  isDefault: Joi.boolean().optional(),
});

export const listAddresses = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: 'Non authentifié' });
    const rows = await UserAddress.findAll({ where: { userId: req.user.id }, order: [['isDefault', 'DESC'], ['id', 'ASC']] });
    res.json(rows);
  } catch (err) { next(err); }
};

export const createAddress = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: 'Non authentifié' });
    const { error, value } = upsertSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const tx = await UserAddress.sequelize.transaction();
    try {
      if (value.isDefault) {
        await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id }, transaction: tx });
      }
      const created = await UserAddress.create({ ...value, userId: req.user.id }, { transaction: tx });
      await tx.commit();
      res.status(201).json(created);
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (err) { next(err); }
};

export const updateAddress = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: 'Non authentifié' });
    const { error: pErr, value: pVal } = idParamSchema.validate(req.params);
    if (pErr) return res.status(400).json({ msg: 'ID invalide' });
    const { error, value } = upsertSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const addr = await UserAddress.findByPk(pVal.id);
    if (!addr || addr.userId !== req.user.id) return res.status(404).json({ msg: 'Adresse introuvable' });

    const tx = await UserAddress.sequelize.transaction();
    try {
      if (value.isDefault) {
        await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id }, transaction: tx });
      }
      await addr.update(value, { transaction: tx });
      await tx.commit();
      res.json(addr);
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (err) { next(err); }
};

export const deleteAddress = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: 'Non authentifié' });
    const { error: pErr, value: pVal } = idParamSchema.validate(req.params);
    if (pErr) return res.status(400).json({ msg: 'ID invalide' });

    const addr = await UserAddress.findByPk(pVal.id);
    if (!addr || addr.userId !== req.user.id) return res.status(404).json({ msg: 'Adresse introuvable' });

    await addr.destroy();
    res.json({ msg: 'Adresse supprimée' });
  } catch (err) { next(err); }
};
