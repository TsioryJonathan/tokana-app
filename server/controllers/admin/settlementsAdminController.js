import { Op } from 'sequelize';
import Order from '../../models/Order.js';
import CourierSettlement from '../../models/CourierSettlement.js';
import { computeOrderSettlement } from '../../services/settlementService.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

export const getEveningSettlements = async (req, res) => {
  try {
    const { date, courierId } = req.query;
    const now = new Date();
    const baseDate = date ? new Date(date) : now;
    if (Number.isNaN(baseDate.getTime())) {
      return res.status(400).json({ msg: 'Date invalide' });
    }
    const dayStart = new Date(baseDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(baseDate);
    dayEnd.setHours(23, 59, 59, 999);

    const where = {
      status: 'expedie',
      updatedAt: { [Op.between]: [dayStart, dayEnd] },
    };

    const courierIdNum = courierId ? parseInt(String(courierId), 10) : null;
    if (courierIdNum) {
      where.assignedTo = courierIdNum;
    }

    const orders = await Order.findAll({ where, order: [['id', 'ASC']] });

    const items = orders.map((o) => {
      const breakdown = computeOrderSettlement(o);
      return {
        id: o.id,
        createdBy: o.createdBy,
        assignedTo: o.assignedTo,
        status: o.status,
        cashToCollect: o.cashToCollect,
        priceTotal: o.priceTotal,
        isPrepaid: !!o.isPrepaid,
        deliveryFeePrepaid: !!o.deliveryFeePrepaid,
        ...breakdown,
      };
    });

    const totals = items.reduce(
      (acc, it) => {
        acc.totalOrders += 1;
        acc.totalCourierCollected += it.courierCollected;
        acc.totalClientNet += it.clientNet;
        acc.totalAdminNet += it.adminNet;
        acc.totalDeliveryFees += it.deliveryFee;
        return acc;
      },
      { totalOrders: 0, totalCourierCollected: 0, totalClientNet: 0, totalAdminNet: 0, totalDeliveryFees: 0 }
    );

    const dateStr = dayStart.toISOString().slice(0, 10);

    let settlement = null;
    if (courierIdNum) {
      const existing = await CourierSettlement.findOne({ where: { courierId: courierIdNum, date: dateStr } });
      if (existing) {
        settlement = {
          courierId: existing.courierId,
          date: existing.date,
          status: existing.status,
          cashAmount: existing.cashAmount,
          mobileMoneyAmount: existing.mobileMoneyAmount,
          declaredAt: existing.declaredAt,
          confirmedAt: existing.confirmedAt,
        };
      }
    }

    return res.json({
      date: dateStr,
      courierId: courierIdNum,
      totals,
      items,
      settlement,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const confirmEveningSettlement = async (req, res) => {
  try {
    const { date, courierId, cashAmount, mobileMoneyAmount } = req.body || {};
    if (!date || !courierId) {
      return res.status(400).json({ msg: 'date et courierId requis' });
    }

    const baseDate = new Date(date);
    if (Number.isNaN(baseDate.getTime())) {
      return res.status(400).json({ msg: 'Date invalide' });
    }

    const courierIdNum = parseInt(String(courierId), 10);
    if (!Number.isFinite(courierIdNum)) {
      return res.status(400).json({ msg: 'courierId invalide' });
    }

    const cashAmountNum = typeof cashAmount === 'number' ? cashAmount : parseInt(String(cashAmount ?? ''), 10);
    const mmAmountNum = typeof mobileMoneyAmount === 'number' ? mobileMoneyAmount : parseInt(String(mobileMoneyAmount ?? ''), 10);

    const now = new Date();
    const dateStr = baseDate.toISOString().slice(0, 10);

    const [record, created] = await CourierSettlement.findOrCreate({
      where: { courierId: courierIdNum, date: dateStr },
      defaults: {
        status: 'CONFIRMED',
        cashAmount: Number.isFinite(cashAmountNum) ? cashAmountNum : null,
        mobileMoneyAmount: Number.isFinite(mmAmountNum) ? mmAmountNum : null,
        declaredBy: req.user?.id ?? null,
        confirmedBy: req.user?.id ?? null,
        declaredAt: now,
        confirmedAt: now,
      },
    });

    if (!created) {
      record.status = 'CONFIRMED';
      record.cashAmount = Number.isFinite(cashAmountNum) ? cashAmountNum : record.cashAmount;
      record.mobileMoneyAmount = Number.isFinite(mmAmountNum) ? mmAmountNum : record.mobileMoneyAmount;
      record.confirmedBy = req.user?.id ?? record.confirmedBy;
      record.confirmedAt = now;
      if (!record.declaredAt) {
        record.declaredAt = now;
        record.declaredBy = req.user?.id ?? record.declaredBy;
      }
      await record.save();
    }

    return res.json({
      courierId: record.courierId,
      date: record.date,
      status: record.status,
      cashAmount: record.cashAmount,
      mobileMoneyAmount: record.mobileMoneyAmount,
      declaredAt: record.declaredAt,
      confirmedAt: record.confirmedAt,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};
