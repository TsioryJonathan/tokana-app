import { Op } from 'sequelize';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import CourierSettlement from '../../models/CourierSettlement.js';
import Dispatch from '../../models/Dispatch.js';
import { computeOrderSettlement } from '../../services/settlementService.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

export const getClientReport = async (req, res) => {
  try {
    const { clientId, dateFrom, dateTo } = req.query || {};
    if (!clientId) {
      return res.status(400).json({ msg: 'clientId requis' });
    }
    const clientIdNum = parseInt(String(clientId), 10);
    if (!Number.isFinite(clientIdNum)) {
      return res.status(400).json({ msg: 'clientId invalide' });
    }

    const where = { createdBy: clientIdNum };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        const d = new Date(dateFrom);
        if (Number.isNaN(d.getTime())) return res.status(400).json({ msg: 'dateFrom invalide' });
        where.createdAt[Op.gte] = d;
      }
      if (dateTo) {
        const d = new Date(dateTo);
        if (Number.isNaN(d.getTime())) return res.status(400).json({ msg: 'dateTo invalide' });
        where.createdAt[Op.lte] = d;
      }
    }

    const orders = await Order.findAll({ where, order: [['id', 'ASC']] });

    const items = orders.map((o) => {
      const breakdown = computeOrderSettlement(o);
      return {
        id: o.id,
        createdAt: o.createdAt,
        status: o.status,
        assignedTo: o.assignedTo,
        cashToCollect: o.cashToCollect,
        priceTotal: o.priceTotal,
        isPrepaid: !!o.isPrepaid,
        deliveryFeePrepaid: !!o.deliveryFeePrepaid,
        courierCollected: breakdown.courierCollected,
        clientNet: breakdown.clientNet,
        adminNet: breakdown.adminNet,
        deliveryFee: breakdown.deliveryFee,
        caseType: breakdown.caseType,
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

    const client = await User.findByPk(clientIdNum, {
      attributes: ['id', 'name', 'phone', 'email'],
    });

    return res.json({
      client: client
        ? {
            id: client.id,
            name: client.name,
            phone: client.phone,
            email: client.email,
          }
        : { id: clientIdNum },
      period: {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      },
      totals,
      items,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const getHistory = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query || {};

    let settlementsWhere = {};
    if (dateFrom || dateTo) {
      settlementsWhere.date = {};
      if (dateFrom) settlementsWhere.date[Op.gte] = dateFrom;
      if (dateTo) settlementsWhere.date[Op.lte] = dateTo;
    }

    const [settlements, dispatches] = await Promise.all([
      CourierSettlement.findAll({ where: settlementsWhere, order: [['date', 'DESC'], ['courierId', 'ASC']] }),
      Dispatch.findAll({
        where:
          dateFrom || dateTo
            ? {
                createdAt: {
                  ...(dateFrom ? { [Op.gte]: new Date(dateFrom) } : {}),
                  ...(dateTo ? { [Op.lte]: new Date(dateTo) } : {}),
                },
              }
            : {},
        order: [['createdAt', 'DESC']],
      }),
    ]);

    const settlementsView = settlements.map((s) => ({
      courierId: s.courierId,
      date: s.date,
      status: s.status,
      cashAmount: s.cashAmount,
      mobileMoneyAmount: s.mobileMoneyAmount,
      declaredAt: s.declaredAt,
      confirmedAt: s.confirmedAt,
    }));

    const dispatchesView = dispatches.map((d) => ({
      id: d.id,
      clientId: d.clientId,
      courierId: d.courierId,
      status: d.status,
      netAmount: d.netAmount,
      cashAmount: d.cashAmount,
      mobileMoneyAmount: d.mobileMoneyAmount,
      createdAt: d.createdAt,
    }));

    return res.json({
      period: {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      },
      settlements: settlementsView,
      dispatches: dispatchesView,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};
