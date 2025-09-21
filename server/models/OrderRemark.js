import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const OrderRemark = sequelize.define('OrderRemark', {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    index: true,
  },
  text: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['orderId'] },
    { fields: ['createdBy'] },
  ],
});

export default OrderRemark;
