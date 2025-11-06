import User from '../models/User.js';

// Require email verification for client users
export const requireVerifiedEmail = async (req, res, next) => {
  try {
    console.log('[requireVerifiedEmail] Middleware appelé pour:', req.method, req.path);
    console.log('[requireVerifiedEmail] User:', req.user?.id, 'Role:', req.user?.role);
    
    if (!req.user?.id) return res.status(401).json({ msg: 'Non authentifié' });
    // Only enforce for client role; admins/livreurs bypass
    if (req.user.role && req.user.role !== 'client') {
      console.log('[requireVerifiedEmail] Bypass pour role:', req.user.role);
      return next();
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ msg: 'Utilisateur introuvable' });

    console.log('[requireVerifiedEmail] User trouvé - emailVerifiedAt:', user.emailVerifiedAt, 'phoneVerifiedAt:', user.phoneVerifiedAt);

    // Vérifier l'email vérifié, pas le téléphone
    if (!user.emailVerifiedAt) {
      console.log('[requireVerifiedEmail] ❌ Email non vérifié pour user', req.user.id, 'emailVerifiedAt:', user.emailVerifiedAt);
      return res.status(403).json({ msg: 'Email non vérifié' });
    }

    console.log('[requireVerifiedEmail] ✅ Email vérifié pour user', req.user.id);
    return next();
  } catch (e) {
    console.error('[requireVerifiedEmail] Erreur:', e);
    return next(e);
  }
};

// Deprecated: use requireVerifiedEmail instead
export const requireVerifiedPhone = requireVerifiedEmail;
