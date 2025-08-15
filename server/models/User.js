import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/sequelize.js';

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
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
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Numéro de téléphone requis' },
      is: { args: [/^\+2613[2-4|7-9]\d{7}$/], msg: 'Format de téléphone malgache invalide (ex: +261321234567)' },
    },
  },
}, {
  hooks: {
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