import User from '../../models/User.js';
import Order from '../../models/Order.js';
import { Op } from 'sequelize';
import { normalizeMgPhone } from '../../utils/phone.js';

function handleErr(res, err) {
  console.error(err);
  return res.status(500).json({ msg: 'Erreur serveur' });
}

/**
 * GET /api/admin/couriers
 * Liste tous les livreurs avec filtres et recherche
 */
export const listCouriers = async (req, res) => {
  try {
    const { search, gpsEnabled, page = 1, limit = 50 } = req.query;

    const where = { role: 'livreur' };

    // Recherche par nom, email ou téléphone
    if (search && search.trim()) {
      const trimmed = search.trim();
      const normalizedPhone = normalizeMgPhone(trimmed);
      // Build OR conditions for name, email, and phone (raw + normalized)
      const orConditions = [
        { name: { [Op.iLike]: `%${trimmed}%` } },
        { email: { [Op.iLike]: `%${trimmed}%` } },
      ];
      // Add raw phone search
      orConditions.push({ phone: { [Op.iLike]: `%${trimmed}%` } });
      // Add normalized phone search if different from input
      if (normalizedPhone && normalizedPhone !== trimmed) {
        orConditions.push({ phone: { [Op.iLike]: `%${normalizedPhone}%` } });
      }
      where[Op.or] = orConditions;
    }
    
    // Filtre par GPS activé/désactivé
    if (gpsEnabled !== undefined) {
      where.gpsTrackingEnabled = gpsEnabled === 'true';
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'email', 'phone', 'role', 'gpsTrackingEnabled',
        'gpsLastLat', 'gpsLastLng', 'gpsLastSeenAt', 
        'emailVerifiedAt', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    
    // Mapper les champs GPS pour correspondre au frontend
    const items = rows.map(courier => ({
      id: courier.id,
      name: courier.name,
      email: courier.email,
      phone: courier.phone,
      role: courier.role,
      gpsEnabled: courier.gpsTrackingEnabled,
      lastGpsLat: courier.gpsLastLat,
      lastGpsLng: courier.gpsLastLng,
      lastGpsAt: courier.gpsLastSeenAt,
      emailVerifiedAt: courier.emailVerifiedAt,
      createdAt: courier.createdAt,
      updatedAt: courier.updatedAt,
    }));
    
    return res.json({
      items,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * GET /api/admin/couriers/:id
 * Détails d'un livreur spécifique avec ses performances
 */
export const getCourier = async (req, res) => {
  try {
    const courierId = parseInt(req.params.id, 10);
    if (!Number.isFinite(courierId)) {
      return res.status(400).json({ msg: 'ID livreur invalide' });
    }
    
    const courier = await User.findOne({
      where: { id: courierId, role: 'livreur' },
      attributes: [
        'id', 'name', 'email', 'phone', 'role', 'gpsTrackingEnabled',
        'gpsLastLat', 'gpsLastLng', 'gpsLastSeenAt', 
        'emailVerifiedAt', 'createdAt', 'updatedAt'
      ],
    });
    
    if (!courier) {
      return res.status(404).json({ msg: 'Livreur introuvable' });
    }
    
    // Calculer les performances
    const totalOrders = await Order.count({
      where: { assignedTo: courierId },
    });
    
    const deliveredOrders = await Order.count({
      where: { assignedTo: courierId, status: 'expedie' },
    });
    
    const pendingOrders = await Order.count({
      where: { 
        assignedTo: courierId, 
        status: { [Op.in]: ['cree', 'recupere', 'en_transit'] },
      },
    });
    
    // Mapper les champs GPS
    const courierData = courier.toJSON();
    
    return res.json({
      id: courierData.id,
      name: courierData.name,
      email: courierData.email,
      phone: courierData.phone,
      role: courierData.role,
      gpsEnabled: courierData.gpsTrackingEnabled,
      lastGpsLat: courierData.gpsLastLat,
      lastGpsLng: courierData.gpsLastLng,
      lastGpsAt: courierData.gpsLastSeenAt,
      emailVerifiedAt: courierData.emailVerifiedAt,
      createdAt: courierData.createdAt,
      updatedAt: courierData.updatedAt,
      stats: {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        successRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0',
      },
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * POST /api/admin/couriers
 * Créer un nouveau livreur
 */
export const createCourier = async (req, res) => {
  try {
    const { name, email, phone, password, gpsEnabled } = req.body;
    
    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ msg: 'Nom, email, téléphone et mot de passe requis' });
    }
    
    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ msg: 'Cet email est déjà utilisé' });
    }
    
    // Vérifier si le téléphone existe déjà
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ msg: 'Ce téléphone est déjà utilisé' });
    }
    
    const courier = await User.create({
      name,
      email,
      phone,
      password, // Sera hashé par le beforeCreate hook
      role: 'livreur',
      gpsEnabled: gpsEnabled === true,
      emailVerifiedAt: new Date(), // Auto-vérifié par admin
    });
    
    return res.status(201).json({
      id: courier.id,
      name: courier.name,
      email: courier.email,
      phone: courier.phone,
      role: courier.role,
      gpsEnabled: courier.gpsEnabled,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * PATCH /api/admin/couriers/:id
 * Modifier un livreur existant
 */
export const updateCourier = async (req, res) => {
  try {
    const courierId = parseInt(req.params.id, 10);
    if (!Number.isFinite(courierId)) {
      return res.status(400).json({ msg: 'ID livreur invalide' });
    }
    
    const courier = await User.findOne({
      where: { id: courierId, role: 'livreur' },
    });
    
    if (!courier) {
      return res.status(404).json({ msg: 'Livreur introuvable' });
    }
    
    const { name, email, phone, gpsEnabled } = req.body;
    
    // Vérifier unicité email si changé
    if (email && email !== courier.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ msg: 'Cet email est déjà utilisé' });
      }
      courier.email = email;
    }
    
    // Vérifier unicité téléphone si changé
    if (phone && phone !== courier.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ msg: 'Ce téléphone est déjà utilisé' });
      }
      courier.phone = phone;
    }
    
    if (name !== undefined) courier.name = name;
    if (gpsEnabled !== undefined) courier.gpsEnabled = gpsEnabled;
    
    await courier.save();
    
    return res.json({
      id: courier.id,
      name: courier.name,
      email: courier.email,
      phone: courier.phone,
      role: courier.role,
      gpsEnabled: courier.gpsEnabled,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * DELETE /api/admin/couriers/:id
 * Supprimer un livreur
 */
export const deleteCourier = async (req, res) => {
  try {
    const courierId = parseInt(req.params.id, 10);
    if (!Number.isFinite(courierId)) {
      return res.status(400).json({ msg: 'ID livreur invalide' });
    }
    
    const courier = await User.findOne({
      where: { id: courierId, role: 'livreur' },
    });
    
    if (!courier) {
      return res.status(404).json({ msg: 'Livreur introuvable' });
    }
    
    // Vérifier s'il a des commandes en cours
    const activeOrders = await Order.count({
      where: { 
        assignedTo: courierId,
        status: { [Op.in]: ['cree', 'recupere', 'en_transit'] },
      },
    });
    
    if (activeOrders > 0) {
      return res.status(400).json({ 
        msg: `Impossible de supprimer: ${activeOrders} commande(s) en cours` 
      });
    }
    
    await courier.destroy();
    
    return res.json({ msg: 'Livreur supprimé avec succès' });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * PATCH /api/admin/couriers/:id/gps
 * Activer/désactiver le GPS d'un livreur
 */
export const toggleCourierGps = async (req, res) => {
  try {
    const courierId = parseInt(req.params.id, 10);
    if (!Number.isFinite(courierId)) {
      return res.status(400).json({ msg: 'ID livreur invalide' });
    }
    
    const courier = await User.findOne({
      where: { id: courierId, role: 'livreur' },
    });
    
    if (!courier) {
      return res.status(404).json({ msg: 'Livreur introuvable' });
    }
    
    const { gpsEnabled } = req.body;
    
    if (typeof gpsEnabled !== 'boolean') {
      return res.status(400).json({ msg: 'gpsEnabled doit être un booléen' });
    }
    
    courier.gpsEnabled = gpsEnabled;
    await courier.save();
    
    return res.json({
      id: courier.id,
      name: courier.name,
      gpsEnabled: courier.gpsEnabled,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};
