import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const RefreshToken = sequelize.define('RefreshToken', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    index: true,
  },
  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rotatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  replacedByTokenId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['expiresAt'] },
  ],
});

export default RefreshToken;
