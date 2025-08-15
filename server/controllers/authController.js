import Joi from 'joi';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({ 'string.email': 'Email invalide' }),
  password: Joi.string().min(6).required().messages({ 'string.min': 'Mot de passe trop court (min 6)' }),
  role: Joi.string().valid('client', 'livreur', 'admin').optional(),
  name: Joi.string().when('role', {
    is: 'livreur',
    then: Joi.string().required().messages({ 'string.empty': 'Nom requis pour livreurs' }),
    otherwise: Joi.string().optional(),
  }),
  phone: Joi.string().pattern(/^\+2613[2-4|7-9]\d{7}$/).required().messages({
    'string.pattern.base': 'Format de téléphone malgache invalide (ex: +261321234567)',
    'string.empty': 'Téléphone requis',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({ 'string.email': 'Email invalide' }),
  password: Joi.string().required().messages({ 'string.empty': 'Mot de passe requis' }),
});

export const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const { email, password, role, name, phone } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ msg: 'Utilisateur existe déjà' });

    user = await User.create({ email, password, role, name, phone });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, email, role, name, phone } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: 'Identifiants invalides' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, email, role: user.role, name: user.name, phone: user.phone } });
  } catch (err) {
    next(err);
  }
};