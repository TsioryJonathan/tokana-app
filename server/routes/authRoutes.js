import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, logoutAll, requestAccountOtp, verifyAccountOtp } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Anti-spam: limit registration attempts per IP (dev-friendly but effective)
const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 signups per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Trop de tentatives d\'inscription, réessayez plus tard' },
});

router.post('/register', registerLimiter, register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.post('/request-otp', protect, requestAccountOtp);
router.post('/verify-otp', protect, verifyAccountOtp);
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone });
  } catch (err) {
    next(err);
  }
});
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    res.json({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name, 
      phone: user.phone,
      phoneVerifiedAt: user.phoneVerifiedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      accountOtpExpiresAt: user.accountOtpExpiresAt ? user.accountOtpExpiresAt.toISOString() : null,
      accountOtpChannel: user.accountOtpChannel,
    });
  } catch (err) {
    next(err);
  }
});

export default router;