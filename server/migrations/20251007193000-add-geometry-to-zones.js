import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('Zones', 'geometry', {
    type: DataTypes.JSONB,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('Zones', 'geometry');
}
