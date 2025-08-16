import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import Zone from './Zone.js';

const Axis = sequelize.define('Axis', {
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Zone, key: 'id' },
  },
  key: {
    type: DataTypes.ENUM('nord', 'est', 'sud', 'ouest', 'nord_ouest', 'sud_ouest'),
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  indexes: [
    { fields: ['zoneId'] },
  ],
});

Zone.hasMany(Axis, { foreignKey: 'zoneId', as: 'axes' });
Axis.belongsTo(Zone, { foreignKey: 'zoneId', as: 'zone' });

export default Axis;
