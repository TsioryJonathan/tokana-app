import User from '../models/User.js';

// Require phone verification for client users
export const requireVerifiedPhone = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: 'Non authentifié' });
    // Only enforce for client role; admins/livreurs bypass
    if (req.user.role && req.user.role !== 'client') return next();

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ msg: 'Utilisateur introuvable' });

    if (!user.phoneVerifiedAt) {
      return res.status(403).json({ msg: 'Téléphone non vérifié' });
    }

    return next();
  } catch (e) {
    return next(e);
  }
};
