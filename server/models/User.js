import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/sequelize.js';
import { normalizeMgPhone, isValidMgPhone } from '../utils/phone.js';

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: { isEmail: { msg: 'Email invalide' } },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'Mot de passe requis' } },
  },
  role: {
    type: DataTypes.ENUM('client', 'livreur', 'admin'),
    defaultValue: 'client',
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isValid(value) {
        if (value == null || value === '') return;
        const normalized = normalizeMgPhone(value);
        if (!isValidMgPhone(normalized)) {
          throw new Error('Téléphone MG invalide (ex: +261201234567 ou 0201234567)');
        }
      },
    },
  },
  phoneVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  accountOtpHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountOtpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  accountOtpRequestCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  accountOtpLastRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  accountOtpChannel: {
    type: DataTypes.ENUM('sms', 'email'),
    allowNull: true,
  },
  accountOtpFailedAttempts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  accountOtpLockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  validate: {
    eitherEmailOrPhone() {
      if (!this.email && !this.phone) {
        throw new Error('Soit email, soit téléphone doit être fourni');
      }
    },
  },
  hooks: {
    beforeValidate: (user) => {
      if (user.phone) {
        user.phone = normalizeMgPhone(user.phone);
      }
    },
    beforeCreate: async (user) => {
      if (user.role === 'livreur' && !user.name) {
        throw new Error('Nom requis pour les livreurs');
      }
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.role === 'livreur' && !user.name) {
        throw new Error('Nom requis pour les livreurs');
      }
      if (user.changed('phone') && user.phone) {
        user.phone = normalizeMgPhone(user.phone);
      }
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default User;