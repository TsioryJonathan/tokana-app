import Order from '../models/Order.js';
import Dispatch from '../models/Dispatch.js';
import { Op } from 'sequelize';

/**
 * GET /api/client/account-status
 * Retourne le statut financier du client connecté
 * - amountToReceive: montant total à recevoir (argent collecté - frais de livraison)
 * - amountReceived: montant déjà remis au client
 * - paymentMethod: dernier moyen de paiement utilisé
 * - lastPaymentDate: date du dernier versement
 * - status: 'pending' | 'paid' | 'partial'
 */
export async function getAccountStatus(req, res, next) {
  try {
    const clientId = req.user.id;

    // Récupérer toutes les commandes livrées du client
    const deliveredOrders = await Order.findAll({
      where: {
        createdBy: clientId,
        status: 'expedie',
      },
      attributes: ['id', 'cashToCollect', 'priceTotal', 'clientDispatchId'],
    });

    // Calculer le montant total à recevoir
    // = somme des cashToCollect - somme des frais de livraison (priceTotal)
    let totalCashCollected = 0;
    let totalDeliveryFees = 0;
    let ordersWithDispatch = 0;

    for (const order of deliveredOrders) {
      totalCashCollected += order.cashToCollect || 0;
      totalDeliveryFees += order.priceTotal || 0;
      if (order.clientDispatchId) {
        ordersWithDispatch++;
      }
    }

    const amountToReceive = Math.max(0, totalCashCollected - totalDeliveryFees);

    // Récupérer les dispatches (versements) du client
    const dispatches = await Dispatch.findAll({
      where: {
        clientId: clientId,
        status: 'COMPLETED',
      },
      order: [['updatedAt', 'DESC']],
      limit: 10,
    });

    // Calculer le montant total remis
    let amountReceived = 0;
    let paymentMethod = null;
    let lastPaymentDate = null;

    for (const dispatch of dispatches) {
      amountReceived += dispatch.netAmount || 0;
    }

    // Récupérer le dernier dispatch pour le moyen de paiement
    if (dispatches.length > 0) {
      const lastDispatch = dispatches[0];
      lastPaymentDate = lastDispatch.updatedAt;
      
      // Déterminer le moyen de paiement
      if (lastDispatch.mobileMoneyAmount > 0 && lastDispatch.cashAmount > 0) {
        paymentMethod = 'Cash + Mobile Money';
      } else if (lastDispatch.mobileMoneyAmount > 0) {
        paymentMethod = 'Mobile Money';
      } else if (lastDispatch.cashAmount > 0) {
        paymentMethod = 'Cash';
      }
    }

    // Déterminer le statut global
    let status = 'pending';
    if (amountToReceive === 0 || amountReceived >= amountToReceive) {
      status = 'paid';
    } else if (amountReceived > 0) {
      status = 'partial';
    }

    res.json({
      amountToReceive,
      amountReceived,
      paymentMethod,
      lastPaymentDate,
      status,
      // Infos supplémentaires
      totalOrders: deliveredOrders.length,
      totalCashCollected,
      totalDeliveryFees,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/client/orders/summary
 * Résumé des commandes du client
 */
export async function getOrdersSummary(req, res, next) {
  try {
    const clientId = req.user.id;

    // Compter par statut
    const [created, inTransit, delivered, cancelled] = await Promise.all([
      Order.count({ where: { createdBy: clientId, status: 'en_cours_de_traitement' } }),
      Order.count({ where: { createdBy: clientId, status: { [Op.in]: ['en_route_vers_recuperation', 'en_chemin', 'en_chemin_pour_livraison'] } } }),
      Order.count({ where: { createdBy: clientId, status: 'expedie' } }),
      Order.count({ where: { createdBy: clientId, status: 'annule' } }),
    ]);

    res.json({
      created,
      inTransit,
      delivered,
      cancelled,
      total: created + inTransit + delivered + cancelled,
    });
  } catch (err) {
    next(err);
  }
}
