import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('Orders', 'category', {
    type: DataTypes.ENUM('ENVELOPE', 'SMALL', 'MEDIUM', 'LARGE'),
    allowNull: true,
  });
  await queryInterface.addColumn('Orders', 'fragile', {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  });
  await queryInterface.addColumn('Orders', 'bulky', {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  });
  await queryInterface.addColumn('Orders', 'needReturn', {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('Orders', 'needReturn');
  await queryInterface.removeColumn('Orders', 'bulky');
  await queryInterface.removeColumn('Orders', 'fragile');
  await queryInterface.removeColumn('Orders', 'category');
}
