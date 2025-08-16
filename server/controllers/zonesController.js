import Zone from '../models/Zone.js';
import Axis from '../models/Axis.js';
import Locality from '../models/Locality.js';

export const getZones = async (req, res, next) => {
  try {
    // Try DB first
    const zones = await Zone.findAll({
      include: [{
        model: Axis,
        as: 'axes',
        include: [{ model: Locality, as: 'localities' }],
      }],
      order: [
        ['id', 'ASC'],
        [{ model: Axis, as: 'axes' }, 'id', 'ASC'],
        [{ model: Axis, as: 'axes' }, { model: Locality, as: 'localities' }, 'id', 'ASC'],
      ],
    });

    const payload = {};
    for (const z of zones) {
      const key = z.key; // 'ville' | 'peripherie' | 'super-peripherie'
      const axesObj = {};
      for (const a of (z.axes || [])) {
        const axisKey = a.key; // 'nord' | 'est' | 'sud' | 'ouest' | 'nord_ouest'
        axesObj[axisKey] = (a.localities || []).map(l => l.name);
      }
      payload[key] = { label: z.label, axes: axesObj };
    }
    // If DB empty, return empty object (no fallback)
    return res.json(payload);
  } catch (err) {
    next(err);
  }
};
