const { User } = require('../../models');
const { Op } = require('sequelize');

function handleErr(res, err) {
  console.error(err);
  return res.status(500).json({ msg: 'Erreur serveur' });
}

/**
 * GET /api/admin/clients
 * Liste tous les clients avec filtres et recherche
 */
exports.listClients = async (req, res) => {
  try {
    const { search, zone, page = 1, limit = 50 } = req.query;
    
    const where = { role: 'client' };
    
    // Recherche par nom, email ou téléphone
    if (search && search.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
        { phone: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }
    
    // Filtre par zone
    if (zone && zone.trim()) {
      where.zone = zone.trim();
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'email', 'phone', 'role', 'zone', 
        'address', 'notes', 'emailVerifiedAt', 'createdAt', 'updatedAt'
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
 * GET /api/admin/clients/:id
 * Détails d'un client spécifique
 */
exports.getClient = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    if (!Number.isFinite(clientId)) {
      return res.status(400).json({ msg: 'ID client invalide' });
    }
    
    const client = await User.findOne({
      where: { id: clientId, role: 'client' },
      attributes: [
        'id', 'name', 'email', 'phone', 'role', 'zone', 
        'address', 'notes', 'emailVerifiedAt', 'createdAt', 'updatedAt'
      ],
    });
    
    if (!client) {
      return res.status(404).json({ msg: 'Client introuvable' });
    }
    
    return res.json(client);
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * POST /api/admin/clients
 * Créer un nouveau client
 */
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, password, zone, address, notes } = req.body;
    
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
    
    const client = await User.create({
      name,
      email,
      phone,
      password, // Sera hashé par le beforeCreate hook
      role: 'client',
      zone: zone || null,
      address: address || null,
      notes: notes || null,
      emailVerifiedAt: new Date(), // Auto-vérifié par admin
    });
    
    return res.status(201).json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      role: client.role,
      zone: client.zone,
      address: client.address,
      notes: client.notes,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * PATCH /api/admin/clients/:id
 * Modifier un client existant
 */
exports.updateClient = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    if (!Number.isFinite(clientId)) {
      return res.status(400).json({ msg: 'ID client invalide' });
    }
    
    const client = await User.findOne({
      where: { id: clientId, role: 'client' },
    });
    
    if (!client) {
      return res.status(404).json({ msg: 'Client introuvable' });
    }
    
    const { name, email, phone, zone, address, notes } = req.body;
    
    // Vérifier unicité email si changé
    if (email && email !== client.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ msg: 'Cet email est déjà utilisé' });
      }
      client.email = email;
    }
    
    // Vérifier unicité téléphone si changé
    if (phone && phone !== client.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ msg: 'Ce téléphone est déjà utilisé' });
      }
      client.phone = phone;
    }
    
    if (name !== undefined) client.name = name;
    if (zone !== undefined) client.zone = zone;
    if (address !== undefined) client.address = address;
    if (notes !== undefined) client.notes = notes;
    
    await client.save();
    
    return res.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      role: client.role,
      zone: client.zone,
      address: client.address,
      notes: client.notes,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * DELETE /api/admin/clients/:id
 * Supprimer un client
 */
exports.deleteClient = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    if (!Number.isFinite(clientId)) {
      return res.status(400).json({ msg: 'ID client invalide' });
    }
    
    const client = await User.findOne({
      where: { id: clientId, role: 'client' },
    });
    
    if (!client) {
      return res.status(404).json({ msg: 'Client introuvable' });
    }
    
    await client.destroy();
    
    return res.json({ msg: 'Client supprimé avec succès' });
  } catch (err) {
    return handleErr(res, err);
  }
};
