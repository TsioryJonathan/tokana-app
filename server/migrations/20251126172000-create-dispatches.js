export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Dispatches', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      clientId: { type: Sequelize.INTEGER, allowNull: false },
      courierId: { type: Sequelize.INTEGER, allowNull: false },
      status: {
        type: Sequelize.ENUM('WAITING_COURIER', 'IN_PROGRESS', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'WAITING_COURIER',
      },
      netAmount: { type: Sequelize.INTEGER, allowNull: false },
      cashAmount: { type: Sequelize.INTEGER, allowNull: false },
      mobileMoneyAmount: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('Dispatches', ['clientId'], { name: 'dispatches_client_id' });
    await queryInterface.addIndex('Dispatches', ['courierId'], { name: 'dispatches_courier_id' });
    await queryInterface.addIndex('Dispatches', ['status'], { name: 'dispatches_status' });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Dispatches');
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Dispatches_status";');
    }
  },
};
