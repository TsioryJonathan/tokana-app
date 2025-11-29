import User from '../../models/User.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

export const listCourierLocations = async (req, res) => {
  try {
    const { onlyActive } = req.query || {};
    const where = { role: 'livreur' };
    if (onlyActive === 'true') {
      where.gpsTrackingEnabled = true;
    }

    const couriers = await User.findAll({
      where,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'phone', 'gpsTrackingEnabled', 'gpsLastLat', 'gpsLastLng', 'gpsLastSeenAt'],
    });

    return res.json({
      items: couriers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        gpsTrackingEnabled: !!c.gpsTrackingEnabled,
        gpsLastLat: c.gpsLastLat,
        gpsLastLng: c.gpsLastLng,
        gpsLastSeenAt: c.gpsLastSeenAt,
      })),
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const updateCourierTracking = async (req, res) => {
  try {
    const idNum = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      return res.status(400).json({ msg: 'ID invalide' });
    }

    const { enabled } = req.body || {};
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ msg: 'enabled (bool) requis' });
    }

    const user = await User.findByPk(idNum);
    if (!user || user.role !== 'livreur') {
      return res.status(404).json({ msg: 'Livreur introuvable' });
    }

    user.gpsTrackingEnabled = enabled;
    await user.save();

    return res.json({
      id: user.id,
      gpsTrackingEnabled: !!user.gpsTrackingEnabled,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};
