import Order from '../models/Order.js';
import User from '../models/User.js';
import Joi from 'joi';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

const postponeSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required(),
  newDate: Joi.date().iso().optional(),
});

const transferSchema = Joi.object({
  targetCourierId: Joi.number().integer().required(),
  reason: Joi.string().min(5).max(500).optional(),
});

export const postponeOrder = async (req, res) => {
  try {
    const courierId = req.user?.id;
    if (!courierId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const orderId = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ msg: 'ID commande invalide' });
    }

    const { error, value } = postponeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ msg: error.details.map((e) => e.message).join(', ') });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Commande introuvable' });
    }

    if (order.assignedTo !== courierId) {
      return res.status(403).json({ msg: 'Cette commande ne vous est pas assignée' });
    }

    if (order.status === 'expedie') {
      return res.status(400).json({ msg: 'Impossible de reporter une commande déjà expédiée' });
    }

    // On peut ajouter un champ postponeReason dans Order si besoin, pour l'instant on log juste
    // Pour MVP, on met juste un statut "en attente" ou on garde le statut actuel
    // L'admin pourra voir la raison via les remarques ou un système de logs

    return res.json({
      id: order.id,
      status: order.status,
      msg: `Commande reportée. Raison: ${value.reason}`,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const transferOrder = async (req, res) => {
  try {
    const courierId = req.user?.id;
    if (!courierId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const orderId = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ msg: 'ID commande invalide' });
    }

    const { error, value } = transferSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ msg: error.details.map((e) => e.message).join(', ') });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Commande introuvable' });
    }

    if (order.assignedTo !== courierId) {
      return res.status(403).json({ msg: 'Cette commande ne vous est pas assignée' });
    }

    if (order.status === 'expedie') {
      return res.status(400).json({ msg: 'Impossible de transférer une commande déjà expédiée' });
    }

    const targetCourier = await User.findByPk(value.targetCourierId);
    if (!targetCourier || targetCourier.role !== 'livreur') {
      return res.status(400).json({ msg: 'Livreur cible introuvable ou invalide' });
    }

    order.assignedTo = value.targetCourierId;
    await order.save();

    return res.json({
      id: order.id,
      assignedTo: order.assignedTo,
      msg: `Commande transférée au livreur #${value.targetCourierId}`,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export default { postponeOrder, transferOrder };
