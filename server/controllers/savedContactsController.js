import SavedContact from '../models/SavedContact.js';
import { Op } from 'sequelize';
import Joi from 'joi';

const handleErr = (res, err) => {
  console.error(err);
  return res.status(500).json({ msg: 'Erreur serveur' });
};

const mgPhone = /^(\+261|0)?(30|3[0-9]|20)\d{7}$/;

const contactSchema = Joi.object({
  type: Joi.string().valid('sender', 'recipient').required(),
  name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().pattern(mgPhone).required(),
  address: Joi.string().min(3).max(255).required(),
  addressDetail: Joi.string().max(255).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  isDefault: Joi.boolean().optional(),
});

/**
 * GET /api/saved-contacts
 * Liste les contacts sauvegardés de l'utilisateur connecté
 */
export const listSavedContacts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const { type } = req.query;
    const where = { userId };
    
    if (type && (type === 'sender' || type === 'recipient')) {
      where.type = type;
    }

    const contacts = await SavedContact.findAll({
      where,
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    return res.json({ items: contacts });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * POST /api/saved-contacts
 * Créer un nouveau contact sauvegardé
 */
export const createSavedContact = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const { error, value } = contactSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    }

    // Si isDefault = true, désactiver les autres par défaut du même type
    if (value.isDefault) {
      await SavedContact.update(
        { isDefault: false },
        { where: { userId, type: value.type } }
      );
    }

    const contact = await SavedContact.create({
      userId,
      ...value,
    });

    return res.status(201).json(contact);
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * PATCH /api/saved-contacts/:id
 * Modifier un contact sauvegardé
 */
export const updateSavedContact = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const contactId = parseInt(req.params.id, 10);
    if (!Number.isFinite(contactId)) {
      return res.status(400).json({ msg: 'ID invalide' });
    }

    const contact = await SavedContact.findOne({
      where: { id: contactId, userId },
    });

    if (!contact) {
      return res.status(404).json({ msg: 'Contact introuvable' });
    }

    const updateSchema = Joi.object({
      name: Joi.string().min(2).max(120).optional(),
      phone: Joi.string().pattern(mgPhone).optional(),
      address: Joi.string().min(3).max(255).optional(),
      addressDetail: Joi.string().max(255).allow('', null).optional(),
      email: Joi.string().email().allow('', null).optional(),
      isDefault: Joi.boolean().optional(),
    });

    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    }

    // Si isDefault = true, désactiver les autres par défaut du même type
    if (value.isDefault) {
      await SavedContact.update(
        { isDefault: false },
        { where: { userId, type: contact.type, id: { [Op.ne]: contactId } } }
      );
    }

    await contact.update(value);

    return res.json(contact);
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * DELETE /api/saved-contacts/:id
 * Supprimer un contact sauvegardé
 */
export const deleteSavedContact = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const contactId = parseInt(req.params.id, 10);
    if (!Number.isFinite(contactId)) {
      return res.status(400).json({ msg: 'ID invalide' });
    }

    const contact = await SavedContact.findOne({
      where: { id: contactId, userId },
    });

    if (!contact) {
      return res.status(404).json({ msg: 'Contact introuvable' });
    }

    await contact.destroy();

    return res.json({ msg: 'Contact supprimé' });
  } catch (err) {
    return handleErr(res, err);
  }
};
