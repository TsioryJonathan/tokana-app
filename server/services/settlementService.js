export function computeOrderSettlement(order) {
  const cash = Number.isFinite(order.cashToCollect) ? order.cashToCollect : 0;
  const deliveryFee = Number.isFinite(order.priceTotal) ? order.priceTotal : 0;
  const clientNet = cash - deliveryFee;
  const courierCollected = cash;
  const adminNet = courierCollected - clientNet;

  const isPrepaid = !!order.isPrepaid;
  const deliveryFeePrepaid = !!order.deliveryFeePrepaid;

  let caseType = 5;
  if (!isPrepaid && !deliveryFeePrepaid) {
    caseType = 1;
  } else if (!isPrepaid && deliveryFeePrepaid) {
    caseType = 2;
  } else if (isPrepaid && !deliveryFeePrepaid) {
    caseType = 3;
  } else if (isPrepaid && deliveryFeePrepaid) {
    caseType = 4;
  }

  return {
    courierCollected,
    clientNet,
    adminNet,
    deliveryFee,
    caseType,
    isPrepaid,
    deliveryFeePrepaid,
  };
}
