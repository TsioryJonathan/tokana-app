import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const UserAddress = sequelize.define('UserAddress', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  detail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lat: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  lng: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  indexes: [
    { fields: ['userId'] },
  ],
});

export default UserAddress;
