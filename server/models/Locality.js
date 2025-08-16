import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import Axis from './Axis.js';

const Locality = sequelize.define('Locality', {
  axisId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Axis, key: 'id' },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  indexes: [
    { fields: ['axisId'] },
  ],
});

Axis.hasMany(Locality, { foreignKey: 'axisId', as: 'localities' });
Locality.belongsTo(Axis, { foreignKey: 'axisId', as: 'axis' });

export default Locality;
