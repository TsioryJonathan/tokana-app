export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('UserAddresses', 'mapboxAddress', { type: Sequelize.STRING, allowNull: true });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('UserAddresses', 'mapboxAddress');
}

