import Joi from 'joi';
import User from '../models/User.js';

const mgPhoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;

const putMeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().pattern(mgPhoneRegex).optional().allow(''),
});

export const putMe = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: 'Non authentifié' });
    const { error, value } = putMeSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });

    const up = {};
    if (typeof value.name === 'string') up.name = value.name;
    if (typeof value.email === 'string') up.email = value.email || null;
    if (typeof value.phone === 'string') up.phone = value.phone || null;

    await user.update(up);
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      phoneVerifiedAt: user.phoneVerifiedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      accountOtpExpiresAt: user.accountOtpExpiresAt,
      accountOtpChannel: user.accountOtpChannel,
    });
  } catch (err) {
    next(err);
  }
};

export default { putMe };
