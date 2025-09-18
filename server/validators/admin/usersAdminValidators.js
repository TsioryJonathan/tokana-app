import Joi from 'joi';

const mgPhone = /^(\+261|0)(3[0-9]|20)\d{7}$/;

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      msg: 'Validation error',
      details: error.details.map(d => ({ message: d.message, path: d.path })),
    });
  }
  req.body = value;
  next();
};

export const validateCreateLivreur = validate(Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(mgPhone).required()
    .messages({ 'string.pattern.base': 'Téléphone MG invalide (ex: +261201234567 ou 0201234567)' }),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).required(),
}));

export const validateListUsersQuery = (req, res, next) => {
  const schema = Joi.object({
    role: Joi.string().valid('client', 'livreur', 'admin').optional(),
    q: Joi.string().max(100).optional().allow(''),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  });
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      msg: 'Validation error',
      details: error.details.map(d => ({ message: d.message, path: d.path })),
    });
  }
  req.query = value;
  next();
};
