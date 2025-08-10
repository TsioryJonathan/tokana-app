import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Non autorisé, token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ msg: 'Token expiré' });
    return res.status(401).json({ msg: 'Token invalide' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ msg: 'Accès refusé' });
  next();
};