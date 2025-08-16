import express from 'express';
import { register, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone });
  } catch (err) {
    next(err);
  }
});

export default router;