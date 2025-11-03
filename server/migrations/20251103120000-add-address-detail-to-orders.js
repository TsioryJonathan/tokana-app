export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Orders', 'pickupAddressDetail', { type: Sequelize.STRING, allowNull: true });
  await queryInterface.addColumn('Orders', 'dropoffAddressDetail', { type: Sequelize.STRING, allowNull: true });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('Orders', 'pickupAddressDetail');
  await queryInterface.removeColumn('Orders', 'dropoffAddressDetail');
}


