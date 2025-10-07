import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('Orders', 'dropoffLat', {
    type: DataTypes.FLOAT,
    allowNull: true,
  });
  await queryInterface.addColumn('Orders', 'dropoffLng', {
    type: DataTypes.FLOAT,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('Orders', 'dropoffLng');
  await queryInterface.removeColumn('Orders', 'dropoffLat');
}
