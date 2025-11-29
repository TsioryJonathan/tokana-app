import { Op } from 'sequelize';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Dispatch from '../../models/Dispatch.js';
import { computeOrderSettlement } from '../../services/settlementService.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

export const listPendingClients = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query || {};

    const where = {
      status: 'expedie',
      clientDispatchId: null,
    };

    if (dateFrom || dateTo) {
      where.updatedAt = {};
      if (dateFrom) {
        const d = new Date(dateFrom);
        if (Number.isNaN(d.getTime())) return res.status(400).json({ msg: 'dateFrom invalide' });
        where.updatedAt[Op.gte] = d;
      }
      if (dateTo) {
        const d = new Date(dateTo);
        if (Number.isNaN(d.getTime())) return res.status(400).json({ msg: 'dateTo invalide' });
        where.updatedAt[Op.lte] = d;
      }
    }

    const orders = await Order.findAll({ where, order: [['id', 'ASC']] });

    const byClient = new Map();

    for (const o of orders) {
      const clientId = o.createdBy;
      if (!clientId) continue;
      const breakdown = computeOrderSettlement(o);
      const net = breakdown.clientNet;
      if (!byClient.has(clientId)) {
        byClient.set(clientId, {
          clientId,
          netClient: 0,
          orders: [],
        });
      }
      const agg = byClient.get(clientId);
      agg.netClient += net;
      agg.orders.push({
        id: o.id,
        status: o.status,
        cashToCollect: o.cashToCollect,
        priceTotal: o.priceTotal,
        isPrepaid: !!o.isPrepaid,
        deliveryFeePrepaid: !!o.deliveryFeePrepaid,
        clientNet: net,
      });
    }

    const clientIds = Array.from(byClient.keys());
    let clientsMeta = {};
    if (clientIds.length > 0) {
      const clients = await User.findAll({
        where: { id: { [Op.in]: clientIds } },
        attributes: ['id', 'name', 'phone', 'email'],
      });
      clientsMeta = Object.fromEntries(clients.map((c) => [c.id, c]));
    }

    const items = Array.from(byClient.values())
      .map((agg) => {
        const c = clientsMeta[agg.clientId];
        return {
          clientId: agg.clientId,
          clientName: c?.name ?? null,
          clientPhone: c?.phone ?? null,
          clientEmail: c?.email ?? null,
          netClient: agg.netClient,
          orders: agg.orders,
        };
      })
      .sort((a, b) => (b.netClient || 0) - (a.netClient || 0));

    return res.json({ items });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const createDispatch = async (req, res) => {
  try {
    const { clientId, courierId, orderIds, cashAmount, mobileMoneyAmount } = req.body || {};
    if (!clientId || !courierId || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ msg: 'clientId, courierId et orderIds requis' });
    }

    const clientIdNum = parseInt(String(clientId), 10);
    const courierIdNum = parseInt(String(courierId), 10);
    if (!Number.isFinite(clientIdNum) || !Number.isFinite(courierIdNum)) {
      return res.status(400).json({ msg: 'clientId ou courierId invalide' });
    }

    const ids = orderIds.map((id) => parseInt(String(id), 10)).filter((n) => Number.isFinite(n));
    if (ids.length === 0) {
      return res.status(400).json({ msg: 'orderIds invalides' });
    }

    const orders = await Order.findAll({
      where: {
        id: { [Op.in]: ids },
        createdBy: clientIdNum,
        status: 'expedie',
        clientDispatchId: null,
      },
      order: [['id', 'ASC']],
    });

    if (orders.length !== ids.length) {
      return res.status(400).json({ msg: 'Certaines commandes sont introuvables ou déjà dispatchées' });
    }

    let netSum = 0;
    for (const o of orders) {
      const breakdown = computeOrderSettlement(o);
      netSum += breakdown.clientNet;
    }

    const cash = typeof cashAmount === 'number' ? cashAmount : parseInt(String(cashAmount ?? '0'), 10) || 0;
    const mm = typeof mobileMoneyAmount === 'number' ? mobileMoneyAmount : parseInt(String(mobileMoneyAmount ?? '0'), 10) || 0;

    if (cash + mm !== netSum) {
      return res.status(400).json({ msg: 'La somme Cash + Mobile Money doit être égale au montant net client' });
    }

    const dispatch = await Dispatch.create({
      clientId: clientIdNum,
      courierId: courierIdNum,
      status: 'WAITING_COURIER',
      netAmount: netSum,
      cashAmount: cash,
      mobileMoneyAmount: mm,
    });

    await Order.update({ clientDispatchId: dispatch.id }, { where: { id: { [Op.in]: ids } } });

    return res.status(201).json({
      id: dispatch.id,
      clientId: dispatch.clientId,
      courierId: dispatch.courierId,
      status: dispatch.status,
      netAmount: dispatch.netAmount,
      cashAmount: dispatch.cashAmount,
      mobileMoneyAmount: dispatch.mobileMoneyAmount,
      orderIds: ids,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const listDispatches = async (req, res) => {
  try {
    const { status, clientId, courierId } = req.query || {};
    const where = {};
    if (status) where.status = status;
    if (clientId) where.clientId = parseInt(String(clientId), 10);
    if (courierId) where.courierId = parseInt(String(courierId), 10);

    const items = await Dispatch.findAll({ where, order: [['id', 'DESC']] });

    return res.json(items.map((d) => ({
      id: d.id,
      clientId: d.clientId,
      courierId: d.courierId,
      status: d.status,
      netAmount: d.netAmount,
      cashAmount: d.cashAmount,
      mobileMoneyAmount: d.mobileMoneyAmount,
    })));
  } catch (err) {
    return handleErr(res, err);
  }
};
