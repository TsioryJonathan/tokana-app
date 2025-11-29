export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Orders', 'isPrepaid', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await queryInterface.addColumn('Orders', 'deliveryFeePrepaid', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('Orders', 'isPrepaid');
  await queryInterface.removeColumn('Orders', 'deliveryFeePrepaid');
}
