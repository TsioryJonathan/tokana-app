import { Op, fn, col } from 'sequelize';
import Order from '../../models/Order.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

export const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const period = (req.query?.period === '7d') ? '7d' : 'today';
    const start = new Date(now);
    if (period === 'today') {
      start.setHours(0, 0, 0, 0);
    } else {
      // last 7 days including today
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    }
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const wherePeriod = { createdAt: { [Op.between]: [start, end] } };

    const [ordersToday, deliveredToday, inProgress, late, heavyCount, otpPending, revenueTodayRow, totalAll, deliveredAll, inProgressAll, lateAll] = await Promise.all([
      Order.count({ where: wherePeriod }),
      Order.count({ where: { status: 'expedie', updatedAt: { [Op.between]: [start, end] } } }),
      Order.count({ where: { ...wherePeriod, status: { [Op.ne]: 'expedie' } } }),
      Order.count({ where: { ...wherePeriod, status: { [Op.ne]: 'expedie' }, slotEnd: { [Op.lt]: now } } }),
      Order.count({ where: { ...wherePeriod, weight: { [Op.gt]: 5 } } }),
      Order.count({ where: { ...wherePeriod, deliveryOtpHash: { [Op.ne]: null }, deliveryOtpVerifiedAt: { [Op.is]: null } } }),
      Order.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('priceTotal')), 0), 'sum']],
        where: wherePeriod,
        raw: true,
      }),
      // Global aggregates (all-time)
      Order.count(),
      Order.count({ where: { status: 'expedie' } }),
      Order.count({ where: { status: { [Op.ne]: 'expedie' } } }),
      Order.count({ where: { status: { [Op.ne]: 'expedie' }, slotEnd: { [Op.lt]: now } } }),
    ]);

    const revenueToday = Number(revenueTodayRow?.sum || 0);

    // Build 7-day series (by createdAt per day) inclusive of today
    const days = [];
    const seriesStart = new Date(now);
    seriesStart.setDate(seriesStart.getDate() - 6);
    seriesStart.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(seriesStart);
      d.setDate(seriesStart.getDate() + i);
      days.push(d);
    }
    const seriesOrders7d = await Promise.all(days.map(async (d) => {
      const startD = new Date(d);
      const endD = new Date(d);
      endD.setHours(23, 59, 59, 999);
      return Order.count({ where: { createdAt: { [Op.between]: [startD, endD] } } });
    }));

    return res.json({
      ordersToday,
      deliveredToday,
      inProgress,
      late,
      heavyCount,
      otpPending,
      revenueToday,
      now: now.toISOString(),
      period,
      start: start.toISOString(),
      end: end.toISOString(),
      global: {
        totalAll,
        deliveredAll,
        inProgressAll,
        lateAll,
      },
      seriesOrders7d,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};
