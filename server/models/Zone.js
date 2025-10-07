import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

const Zone = sequelize.define('Zone', {
  key: {
    type: DataTypes.ENUM('ville', 'peripherie', 'super-peripherie'),
    allowNull: false,
    unique: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  geometry: {
    // GeoJSON MultiPolygon or Polygon representing the zone boundary
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  indexes: [
    { unique: true, fields: ['key'] },
  ],
});

export default Zone;
