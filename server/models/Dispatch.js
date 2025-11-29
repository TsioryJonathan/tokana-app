import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Dispatch = sequelize.define('Dispatch', {
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  courierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('WAITING_COURIER', 'IN_PROGRESS', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'WAITING_COURIER',
  },
  netAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cashAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mobileMoneyAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  indexes: [
    { fields: ['clientId'] },
    { fields: ['courierId'] },
    { fields: ['status'] },
  ],
});

export default Dispatch;
