import { Op } from 'sequelize';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import CourierSettlement from '../../models/CourierSettlement.js';
import { computeOrderSettlement } from '../../services/settlementService.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

/**
 * GET /api/admin/settlements/evening
 * Liste tous les règlements (CourierSettlement) filtrés par date optionnelle
 */
export const listSettlements = async (req, res) => {
  try {
    const { date } = req.query;
    const where = {};
    
    if (date) {
      // Si date fournie, on filtre exactement sur cette date
      where.date = date; // date est stockée en YYYY-MM-DD (DATEONLY)
    } else {
      // Par défaut, on pourrait limiter aux X derniers jours si nécessaire
      // Pour l'instant on renvoie tout ou on filtre par défaut sur aujourd'hui ?
      // Le frontend semble vouloir tout ou filtrer par date.
    }

    const settlements = await CourierSettlement.findAll({
      where,
      order: [['date', 'DESC'], ['declaredAt', 'DESC']],
      include: [
        { model: User, as: 'courier', attributes: ['id', 'name', 'phone'] } // Assurez-vous que l'association existe
      ]
    });

    // Si l'association n'est pas définie dans le modèle, on doit récupérer les users manuellement
    // Vérifions si on peut faire une jointure simple. Si non, on map.
    // Pour simplifier sans toucher aux associations User/CourierSettlement si elles manquent :
    
    let items = [];
    if (settlements.length > 0) {
      const courierIds = [...new Set(settlements.map(s => s.courierId))];
      const couriers = await User.findAll({
        where: { id: courierIds },
        attributes: ['id', 'name']
      });
      const courierMap = couriers.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

      items = settlements.map(s => ({
        id: s.id,
        courierId: s.courierId,
        courierName: courierMap[s.courierId] || `Livreur #${s.courierId}`,
        date: s.date,
        status: s.status,
        cashAmount: s.cashAmount,
        mobileMoneyAmount: s.mobileMoneyAmount,
        declaredAt: s.declaredAt,
        confirmedAt: s.confirmedAt,
      }));
    }

    return res.json({
      items
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

/**
 * GET /api/admin/settlements/evening/details
 * Détails du calcul pour un livreur et une date spécifique (liste des commandes)
 */
export const getEveningSettlementDetails = async (req, res) => {
  try {
    const { date, courierId } = req.query;
    // ... (logique existante de getEveningSettlements)
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
    // Cas 1: Confirmation par ID (via URL parameter ou body id)
    const { id } = req.params;
    const { date, courierId, cashAmount, mobileMoneyAmount } = req.body || {};

    let settlement;
    const now = new Date();

    if (id) {
      settlement = await CourierSettlement.findByPk(id);
      if (!settlement) {
        return res.status(404).json({ msg: 'Règlement introuvable' });
      }
      
      settlement.status = 'CONFIRMED';
      settlement.confirmedBy = req.user?.id ?? settlement.confirmedBy;
      settlement.confirmedAt = now;
      await settlement.save();

      return res.json({
        id: settlement.id,
        status: settlement.status,
        confirmedAt: settlement.confirmedAt
      });
    }

    // Cas 2: Confirmation par date/courierId (création ou update)
    if (!date || !courierId) {
      return res.status(400).json({ msg: 'date et courierId requis (ou ID dans l\'URL)' });
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
      id: record.id,
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
