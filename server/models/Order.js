import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Order = sequelize.define('Order', {
  type: {
    type: DataTypes.ENUM('standard', 'express'),
    allowNull: false,
  },
  zoneLevel: {
    type: DataTypes.ENUM('ville', 'peripherie', 'super-peripherie'),
    allowNull: false,
  },
  pickupAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dropoffAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  parcels: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  cashToCollect: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priceTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true, // existing rows without user
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    index: true,
  },
  recipientPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recipientEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deliveryOtpHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deliveryOtpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveryOtpVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveryOtpRequestCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  deliveryOtpLastRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  slotStart: {
    type: DataTypes.DATE,
    allowNull: true, // only for standard
  },
  slotEnd: {
    type: DataTypes.DATE,
    allowNull: true, // only for standard
  },
  status: {
    type: DataTypes.ENUM(
      'en_cours_de_traitement',
      'en_route_vers_recuperation',
      'en_chemin',
      'en_chemin_pour_livraison',
      'expedie'
    ),
    allowNull: false,
    defaultValue: 'en_cours_de_traitement',
  },
}, {
  indexes: [
    { fields: ['type', 'zoneLevel'] },
    { fields: ['status'] },
    { fields: ['createdBy'] },
    { fields: ['assignedTo'] },
  ],
});

export default Order;
