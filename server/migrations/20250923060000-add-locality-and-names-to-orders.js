import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('Orders', 'pickupName', { type: DataTypes.STRING, allowNull: true });
  await queryInterface.addColumn('Orders', 'pickupPhone', { type: DataTypes.STRING, allowNull: true });
  await queryInterface.addColumn('Orders', 'dropoffName', { type: DataTypes.STRING, allowNull: true });
  await queryInterface.addColumn('Orders', 'notes', { type: DataTypes.TEXT, allowNull: true });
  await queryInterface.addColumn('Orders', 'pickupLocalityId', { type: DataTypes.STRING, allowNull: true });
  await queryInterface.addColumn('Orders', 'dropoffLocalityId', { type: DataTypes.STRING, allowNull: true });
  await queryInterface.addIndex('Orders', ['dropoffLocalityId']);
}

export async function down(queryInterface) {
  await queryInterface.removeIndex('Orders', ['dropoffLocalityId']);
  await queryInterface.removeColumn('Orders', 'dropoffLocalityId');
  await queryInterface.removeColumn('Orders', 'pickupLocalityId');
  await queryInterface.removeColumn('Orders', 'notes');
  await queryInterface.removeColumn('Orders', 'dropoffName');
  await queryInterface.removeColumn('Orders', 'pickupPhone');
  await queryInterface.removeColumn('Orders', 'pickupName');
}
