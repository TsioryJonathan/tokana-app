import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fromStatus: {
    type: DataTypes.ENUM(
      'en_cours_de_traitement',
      'en_route_vers_recuperation',
      'en_chemin',
      'en_chemin_pour_livraison',
      'expedie'
    ),
    allowNull: false,
  },
  toStatus: {
    type: DataTypes.ENUM(
      'en_cours_de_traitement',
      'en_route_vers_recuperation',
      'en_chemin',
      'en_chemin_pour_livraison',
      'expedie'
    ),
    allowNull: false,
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['orderId', 'createdAt'] },
  ],
});

export default OrderStatusHistory;
