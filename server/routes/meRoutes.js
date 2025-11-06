import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { putMe } from '../controllers/meController.js';

const router = express.Router();

// PUT /api/me - update profile basic fields
router.put('/', protect, putMe);

// Prepare upload storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, '..', 'uploads');
const avatarsDir = path.join(uploadsRoot, 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  },
});
const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } }); // 3MB

// POST /api/me/avatar - upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  console.log('[uploadAvatar] Requête reçue');
  console.log('[uploadAvatar] req.file:', req.file);
  console.log('[uploadAvatar] req.body:', req.body);
  console.log('[uploadAvatar] Content-Type:', req.headers['content-type']);
  
  if (!req.file) {
    console.error('[uploadAvatar] ❌ Aucun fichier reçu');
    console.error('[uploadAvatar] req.files:', req.files);
    return res.status(400).json({ msg: 'Fichier manquant' });
  }
  
  const publicPath = `/uploads/avatars/${req.file.filename}`;
  const proto = (req.headers['x-forwarded-proto'] || req.protocol);
  const host = req.get('host');
  const absolute = `${proto}://${host}${publicPath}`;
  try {
    await User.update({ avatarUrl: absolute }, { where: { id: req.user.id } });
    console.log('[uploadAvatar] ✅ Avatar mis à jour pour user', req.user.id);
  } catch (e) {
    // Even if DB update fails, return the uploaded URL so client can display it
    console.warn('Failed to persist avatarUrl:', e?.message);
  }
  res.status(201).json({ avatarUrl: absolute });
});

export default router;
