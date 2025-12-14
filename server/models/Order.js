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
  dropoffLat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  dropoffLng: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  pickupName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pickupPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dropoffName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // NEW: address details (free-form exact address)
  pickupAddressDetail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dropoffAddressDetail: {
    type: DataTypes.STRING,
    allowNull: true,
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
  category: {
    type: DataTypes.ENUM('ENVELOPE', 'SMALL', 'MEDIUM', 'LARGE', 'CUSTOM'),
    allowNull: true,
  },
  customDimensions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  senderRemarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fragile: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  bulky: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  cashToCollect: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isPrepaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  deliveryFeePrepaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  priceTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  pickupLocalityId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dropoffLocalityId: {
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
  needReturn: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  clientDispatchId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(
      'en_cours_de_traitement',
      'en_route_vers_recuperation',
      'en_chemin',
      'en_chemin_pour_livraison',
      'expedie',
      'annule',
      'compte_regle'
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
    { fields: ['clientDispatchId'] },
    { fields: ['dropoffLat', 'dropoffLng'] },
  ],
});

export default Order;
