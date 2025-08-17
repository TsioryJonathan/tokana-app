import Joi from 'joi';
import User from '../../models/User.js';

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

    // Uniqueness checks
    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ msg: 'Email déjà utilisé' });
    }
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) return res.status(409).json({ msg: 'Téléphone déjà utilisé' });
    }

    const payload = { phone, name, password, role: 'livreur' };
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
