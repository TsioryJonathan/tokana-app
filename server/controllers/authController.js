import Joi from "joi";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  createRefreshToken,
  findTokenRecordByRaw,
  rotateRefreshToken,
  revokeToken,
  revokeAllUserTokens,
} from "../services/tokenService.js";

const registerSchema = Joi.alternatives().try(
  Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({ "string.email": "Email invalide" }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({ "string.min": "Mot de passe trop court (min 6)" }),
    name: Joi.string().optional(),
    phone: Joi.string()
      .pattern(/^(\+261|0)(3[0-9]|20)\d{7}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Téléphone MG invalide (ex: +261201234567 ou 0201234567)",
        "string.empty": "Téléphone requis",
      }),
  }),
  Joi.object({
    phone: Joi.string()
      .pattern(/^(\+261|0)(3[0-9]|20)\d{7}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Téléphone MG invalide (ex: +261201234567 ou 0201234567)",
        "string.empty": "Téléphone requis",
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({ "string.min": "Mot de passe trop court (min 6)" }),
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
  })
);

const mgPhone = /^(\+261|0)(3[0-9]|20)\d{7}$/;
const loginSchema = Joi.alternatives().try(
  Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({ "string.email": "Email invalide" }),
    password: Joi.string()
      .required()
      .messages({ "string.empty": "Mot de passe requis" }),
  }),
  Joi.object({
    phone: Joi.string().pattern(mgPhone).required().messages({
      "string.pattern.base":
        "Téléphone MG invalide (ex: +261201234567 ou 0201234567)",
      "string.empty": "Téléphone requis",
    }),
    password: Joi.string()
      .required()
      .messages({ "string.empty": "Mot de passe requis" }),
  })
);

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {

      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });
    }
    const { email, password, name, phone } = value;

    // Uniqueness: check by email or phone
    let user = null;
    if (email) {
      user = await User.findOne({ where: { email } });
      if (user) return res.status(400).json({ msg: "Email déjà utilisé" });
    }
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone)
        return res.status(400).json({ msg: "Téléphone déjà utilisé" });
    }

    // Always force default role at registration (client-side role is ignored)
    user = await User.create({
      email: email ?? null,
      password,
      role: "client",
      name,
      phone,
    });

    const token = generateAccessToken({ id: user.id, role: user.role });
    const { raw: refreshToken } = await createRefreshToken(user.id, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const { email, phone, password } = value;

    let where = {};
    if (email) where.email = email;
    else if (phone) where.phone = phone;

    const user = await User.findOne({ where });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: "Identifiants invalides" });
    }

    const token = generateAccessToken({ id: user.id, role: user.role });
    const { raw: refreshToken } = await createRefreshToken(user.id, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { error, value } = refreshSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });
    const { refreshToken } = value;

    const record = await findTokenRecordByRaw(refreshToken);
    if (
      !record ||
      record.revokedAt ||
      new Date(record.expiresAt).getTime() <= Date.now()
    ) {
      return res.status(401).json({ msg: "Refresh token invalide" });
    }

    // Anti-replay strict: if reused (already rotated), consider compromise -> revoke all user tokens
    if (record.rotatedAt) {
      await revokeAllUserTokens(record.userId);
      return res.status(401).json({
        msg: "Refresh token réutilisé (compromis): toutes les sessions ont été révoquées",
      });
    }

    // rotate refresh token
    const { raw: newRefresh } = await rotateRefreshToken(record, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    const user = await User.findByPk(record.userId);
    if (!user) return res.status(401).json({ msg: "Utilisateur introuvable" });
    const token = generateAccessToken({ id: user.id, role: user.role });
    return res.json({ token, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { error, value } = logoutSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });
    const { refreshToken } = value;
    const record = await findTokenRecordByRaw(refreshToken);
    if (record && !record.revokedAt) {
      await revokeToken(record);
    }
    return res.json({ msg: "Déconnecté" });
  } catch (err) {
    next(err);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: "Non authentifié" });
    await revokeAllUserTokens(req.user.id);
    return res.json({ msg: "Toutes les sessions ont été déconnectées" });
  } catch (err) {
    next(err);
  }
};
