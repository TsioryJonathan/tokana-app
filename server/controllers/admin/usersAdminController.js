import Joi from 'joi';
import User from '../../models/User.js';
import { Op } from 'sequelize';
import { normalizeMgPhone } from '../../utils/phone.js';

// Must match authController pattern: /^(\+261|0)(3[0-9]|20)\d{7}$/
const mgPhone = /^(\+261|0)(3[0-9]|20)\d{7}$/;

export const createLivreur = async (req, res, next) => {
  try {
    // Validate here as safety; primary validation is in validator middleware
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(mgPhone).required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const { email, phone, password, name } = value;
    const normalizedPhone = phone ? normalizeMgPhone(phone) : null;

    // Uniqueness checks
    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ msg: 'Email déjà utilisé' });
    }
    if (normalizedPhone) {
      const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
      if (existingPhone) return res.status(409).json({ msg: 'Téléphone déjà utilisé' });
    }

    const payload = { phone: normalizedPhone, name, password, role: 'livreur' };
    if (email) Object.assign(payload, { email });
    const user = await User.create(payload);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(mgPhone).optional(),
      password: Joi.string().min(6).optional(),
      name: Joi.string().optional(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ msg: 'ID utilisateur invalide' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur introuvable' });
    }

    const { email, phone, password, name } = value;

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== user.id) {
        return res.status(409).json({ msg: 'Email déjà utilisé' });
      }
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const normalizedPhone = normalizeMgPhone(phone);
      const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
      if (existingPhone && existingPhone.id !== user.id) {
        return res.status(409).json({ msg: 'Téléphone déjà utilisé' });
      }
      user.phone = normalizedPhone;
    }

    if (typeof name === 'string') {
      user.name = name;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    return res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ msg: 'ID utilisateur invalide' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur introuvable' });
    }

    await user.destroy();

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const createClient = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(mgPhone).required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const { email, phone, password, name } = value;
    const normalizedPhone = phone ? normalizeMgPhone(phone) : null;

    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ msg: 'Email déjà utilisé' });
    }
    if (normalizedPhone) {
      const existingPhone = await User.findOne({ where: { phone: normalizedPhone } });
      if (existingPhone) return res.status(409).json({ msg: 'Téléphone déjà utilisé' });
    }

    const payload = { phone: normalizedPhone, name, password, role: 'client' };
    if (email) Object.assign(payload, { email });
    const user = await User.create(payload);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { role, q } = req.query;
    const page = Math.max(parseInt(req.query.page ?? '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? '20', 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const where = {};
    if (role) {
      Object.assign(where, { role });
    }
    if (q) {
      const like = `%${q}%`;
      Object.assign(where, {
        [Op.or]: [
          { name: { [Op.iLike]: like } },
          { email: { [Op.iLike]: like } },
          { phone: { [Op.iLike]: like } },
        ],
      });
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'],
    });

    return res.json({
      items: rows,
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    });
  } catch (err) {
    next(err);
  }
};
