import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const CourierSettlement = sequelize.define('CourierSettlement', {
  courierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('DECLARED', 'CONFIRMED'),
    allowNull: false,
    defaultValue: 'DECLARED',
  },
  cashAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mobileMoneyAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mobileMoneyProvider: {
    type: DataTypes.ENUM('MVOLA', 'AIRTEL', 'ORANGE', 'TELMA'),
    allowNull: true,
  },
  declaredBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  confirmedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  declaredAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['courierId', 'date'], unique: true, name: 'couriersettlements_courier_date' },
  ],
});

export default CourierSettlement;
