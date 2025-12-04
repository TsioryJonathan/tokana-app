const { User, Order } = require('../../models');
const { Op } = require('sequelize');

function handleErr(res, err) {
  console.error(err);
  return res.status(500).json({ msg: 'Erreur serveur' });
}

/**
 * GET /api/admin/couriers
 * Liste tous les livreurs avec filtres et recherche
 */
exports.listCouriers = async (req, res) => {
  try {
    const { search, gpsEnabled, page = 1, limit = 50 } = req.query;
    
    const where = { role: 'livreur' };
    
    // Recherche par nom, email ou téléphone
    if (search && search.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
        { phone: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }
    
    // Filtre par GPS activé/désactivé
    if (gpsEnabled !== undefined) {
      where.gpsEnabled = gpsEnabled === 'true';
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'email', 'phone', 'role', 'gpsEnabled',
        'lastGpsLat', 'lastGpsLng', 'lastGpsAt', 
        'emailVerifiedAt', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    
    return res.json({
      items: rows,
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
exports.getCourier = async (req, res) => {
  try {
    const courierId = parseInt(req.params.id, 10);
    if (!Number.isFinite(courierId)) {
      return res.status(400).json({ msg: 'ID livreur invalide' });
    }
    
    const courier = await User.findOne({
      where: { id: courierId, role: 'livreur' },
      attributes: [
        'id', 'name', 'email', 'phone', 'role', 'gpsEnabled',
        'lastGpsLat', 'lastGpsLng', 'lastGpsAt', 
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
    
    return res.json({
      ...courier.toJSON(),
      stats: {
        totalOrders,
        deliveredOrders,
        pendingOrders,
        successRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0,
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
exports.createCourier = async (req, res) => {
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
exports.updateCourier = async (req, res) => {
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
exports.deleteCourier = async (req, res) => {
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
exports.toggleCourierGps = async (req, res) => {
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
