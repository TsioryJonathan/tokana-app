// app/lib/mappers/order.ts
// Centralizes mapping between backend Order and UI model

export type OrderStatus =
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type ServiceType = 'STANDARD' | 'EXPRESS';

export type UIOrder = {
  id: string;
  code: string;
  createdAt: string;
  from: string;
  to: string;
  senderName?: string;
  recipientName?: string;
  priceAr: number;
  service: ServiceType;
  status: OrderStatus;
};

export function mapBackendStatus(s: string): OrderStatus {
  switch (s) {
    case 'en_cours_de_traitement':
      return 'CREATED';
    case 'en_route_vers_recuperation':
      return 'PICKED_UP';
    case 'en_chemin':
    case 'en_chemin_pour_livraison':
      return 'IN_TRANSIT';
    case 'expedie':
      return 'DELIVERED';
    case 'annule':
      return 'CANCELLED';
    default:
      return 'CREATED';
  }
}

export function mapBackendOrderToUI(o: any): UIOrder {
  return {
    id: String(o.id),
    code: o.code ? String(o.code) : `TK-${o.id}`,
    createdAt: o.createdAt,
    from: o.pickupAddress,
    to: o.dropoffAddress,
    senderName: (o as any).pickupName || (o as any).senderName || undefined,
    recipientName: (o as any).dropoffName || (o as any).recipientName || undefined,
    priceAr: Number((o as any).priceTotal ?? (o as any).price ?? 0),
    service: (o.type === 'express' ? 'EXPRESS' : 'STANDARD') as ServiceType,
    status: mapBackendStatus(o.status),
  };
}
export const statusLabel: Record<OrderStatus, string> = {
  CREATED: 'Créée',
  PICKED_UP: 'Retirée',
  IN_TRANSIT: 'En cours',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export const statusBadge: Record<OrderStatus, string> = {
  CREATED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PICKED_UP: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_TRANSIT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function stepIndex(status: OrderStatus) {
  switch (status) {
    case 'CREATED':
      return 0;
    case 'PICKED_UP':
      return 1;
    case 'IN_TRANSIT':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return -1; // CANCELLED
  }
}
