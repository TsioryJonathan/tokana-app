import { Op } from 'sequelize';
import Order from '../models/Order.js';
import CourierSettlement from '../models/CourierSettlement.js';
import { computeOrderSettlement } from '../services/settlementService.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

export const getCourierEveningSettlement = async (req, res) => {
  try {
    const courierId = req.user?.id;
    if (!courierId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const { date } = req.query;
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
      assignedTo: courierId,
    };

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

    const existing = await CourierSettlement.findOne({ where: { courierId, date: dateStr } });
    let settlement = null;
    if (existing) {
      settlement = {
        courierId: existing.courierId,
        date: existing.date,
        status: existing.status,
        cashAmount: existing.cashAmount,
        mobileMoneyAmount: existing.mobileMoneyAmount,
        mobileMoneyProvider: existing.mobileMoneyProvider,
        declaredAt: existing.declaredAt,
        confirmedAt: existing.confirmedAt,
      };
    }

    return res.json({
      date: dateStr,
      courierId,
      totals,
      items,
      settlement,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const declareCourierEveningSettlement = async (req, res) => {
  try {
    const courierId = req.user?.id;
    if (!courierId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const { date, cashAmount, mobileMoneyAmount, mobileMoneyProvider } = req.body || {};
    if (!date) {
      return res.status(400).json({ msg: 'date requise' });
    }

    const baseDate = new Date(date);
    if (Number.isNaN(baseDate.getTime())) {
      return res.status(400).json({ msg: 'Date invalide' });
    }

    const cashAmountNum = typeof cashAmount === 'number' ? cashAmount : parseInt(String(cashAmount ?? ''), 10);
    const mmAmountNum = typeof mobileMoneyAmount === 'number' ? mobileMoneyAmount : parseInt(String(mobileMoneyAmount ?? ''), 10);

    // Valider le provider si un montant mobile money est spécifié
    if (mmAmountNum > 0 && !mobileMoneyProvider) {
      return res.status(400).json({ msg: 'Veuillez sélectionner le fournisseur de mobile money' });
    }
    if (!mmAmountNum && mobileMoneyProvider) {
      return res.status(400).json({ msg: 'Veuillez spécifier le montant mobile money' });
    }

    const now = new Date();
    const dateStr = baseDate.toISOString().slice(0, 10);

    const [record, created] = await CourierSettlement.findOrCreate({
      where: { courierId, date: dateStr },
      defaults: {
        status: 'DECLARED',
        cashAmount: Number.isFinite(cashAmountNum) ? cashAmountNum : null,
        mobileMoneyAmount: Number.isFinite(mmAmountNum) ? mmAmountNum : null,
        mobileMoneyProvider: mmAmountNum > 0 ? mobileMoneyProvider : null,
        declaredBy: courierId,
        declaredAt: now,
      },
    });

    if (!created) {
      // Mise à jour si déjà existant
      record.cashAmount = Number.isFinite(cashAmountNum) ? cashAmountNum : record.cashAmount;
      record.mobileMoneyAmount = Number.isFinite(mmAmountNum) ? mmAmountNum : record.mobileMoneyAmount;
      // Mise à jour du provider seulement si un montant mobile money est spécifié
      if (mmAmountNum > 0) {
        record.mobileMoneyProvider = mobileMoneyProvider;
      }
      if (!record.declaredAt) {
        record.declaredAt = now;
        record.declaredBy = courierId;
      }
      // Ne pas écraser le status CONFIRMED si l'admin a déjà confirmé
      if (record.status !== 'CONFIRMED') {
        record.status = 'DECLARED';
      }
      await record.save();
    }

    return res.json({
      courierId: record.courierId,
      date: record.date,
      status: record.status,
      cashAmount: record.cashAmount,
      mobileMoneyAmount: record.mobileMoneyAmount,
      mobileMoneyProvider: record.mobileMoneyProvider,
      declaredAt: record.declaredAt,
      confirmedAt: record.confirmedAt,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export default { getCourierEveningSettlement, declareCourierEveningSettlement };
