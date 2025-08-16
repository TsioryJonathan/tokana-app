import Joi from 'joi';

const zoneKeyEnum = ['ville', 'peripherie', 'super-peripherie'];
const axisKeyEnum = ['nord', 'est', 'sud', 'ouest', 'nord_ouest', 'sud_ouest'];

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

export const validateCreateZone = validate(Joi.object({
  key: Joi.string().valid(...zoneKeyEnum).required(),
  label: Joi.string().min(1).required(),
}));

export const validateUpdateZone = validate(Joi.object({
  label: Joi.string().min(1).required(),
}));

export const validateCreateAxis = validate(Joi.object({
  key: Joi.string().valid(...axisKeyEnum).required(),
  label: Joi.string().min(1).required(),
}));

export const validateUpdateAxis = validate(Joi.object({
  label: Joi.string().min(1).required(),
}));

export const validateCreateLocality = validate(Joi.object({
  name: Joi.string().min(1).required(),
}));

export const validateUpdateLocality = validate(Joi.object({
  name: Joi.string().min(1).required(),
}));
