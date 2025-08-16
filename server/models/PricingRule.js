import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const PricingRule = sequelize.define('PricingRule', {
  zoneLevel: {
    type: DataTypes.ENUM('ville', 'peripherie', 'super-peripherie'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('standard', 'express'),
    allowNull: false,
  },
  minWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  maxWeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  pickupFee: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  deliveryFee: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expressSurcharge: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  indexes: [
    { fields: ['zoneLevel', 'type'] },
  ],
});

export default PricingRule;
