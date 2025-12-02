import { Op } from 'sequelize';
import Dispatch from '../models/Dispatch.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { computeOrderSettlement } from '../services/settlementService.js';

const handleErr = (res, err) => {
  const status = err?.status || 500;
  return res.status(status).json({ msg: err?.message || 'Erreur serveur' });
};

export const listCourierDispatches = async (req, res) => {
  try {
    const courierId = req.user?.id;
    if (!courierId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const { status } = req.query || {};
    const where = { courierId };
    if (status) where.status = status;

    const dispatches = await Dispatch.findAll({ where, order: [['id', 'DESC']] });

    const enriched = await Promise.all(
      dispatches.map(async (d) => {
        const client = await User.findByPk(d.clientId, { attributes: ['id', 'name', 'phone', 'email'] });
        const orders = await Order.findAll({
          where: { clientDispatchId: d.id },
          attributes: ['id', 'status', 'cashToCollect', 'priceTotal', 'isPrepaid', 'deliveryFeePrepaid'],
        });

        return {
          id: d.id,
          clientId: d.clientId,
          clientName: client?.name ?? null,
          clientPhone: client?.phone ?? null,
          clientEmail: client?.email ?? null,
          courierId: d.courierId,
          status: d.status,
          netAmount: d.netAmount,
          cashAmount: d.cashAmount,
          mobileMoneyAmount: d.mobileMoneyAmount,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          orders: orders.map((o) => {
            const breakdown = computeOrderSettlement(o);
            return {
              id: o.id,
              status: o.status,
              cashToCollect: o.cashToCollect,
              priceTotal: o.priceTotal,
              isPrepaid: !!o.isPrepaid,
              deliveryFeePrepaid: !!o.deliveryFeePrepaid,
              clientNet: breakdown.clientNet,
            };
          }),
        };
      })
    );

    return res.json({ items: enriched });
  } catch (err) {
    return handleErr(res, err);
  }
};

export const updateDispatchStatus = async (req, res) => {
  try {
    const courierId = req.user?.id;
    if (!courierId) {
      return res.status(401).json({ msg: 'Non authentifié' });
    }

    const dispatchId = parseInt(String(req.params.id), 10);
    if (!Number.isFinite(dispatchId)) {
      return res.status(400).json({ msg: 'ID dispatch invalide' });
    }

    const { status } = req.body || {};
    if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ msg: 'Status invalide (IN_PROGRESS ou COMPLETED attendu)' });
    }

    const dispatch = await Dispatch.findByPk(dispatchId);
    if (!dispatch) {
      return res.status(404).json({ msg: 'Dispatch introuvable' });
    }

    if (dispatch.courierId !== courierId) {
      return res.status(403).json({ msg: 'Ce dispatch ne vous est pas assigné' });
    }

    dispatch.status = status;
    await dispatch.save();

    return res.json({
      id: dispatch.id,
      clientId: dispatch.clientId,
      courierId: dispatch.courierId,
      status: dispatch.status,
      netAmount: dispatch.netAmount,
      cashAmount: dispatch.cashAmount,
      mobileMoneyAmount: dispatch.mobileMoneyAmount,
    });
  } catch (err) {
    return handleErr(res, err);
  }
};

export default { listCourierDispatches, updateDispatchStatus };
