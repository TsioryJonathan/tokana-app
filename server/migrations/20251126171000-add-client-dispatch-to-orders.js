export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'clientDispatchId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addIndex('Orders', ['clientDispatchId'], {
      name: 'orders_client_dispatch_id',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('Orders', 'orders_client_dispatch_id');
    await queryInterface.removeColumn('Orders', 'clientDispatchId');
  },
};
