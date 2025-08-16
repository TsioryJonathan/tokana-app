export default {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Orders');
    if (!table.assignedTo) {
      await queryInterface.addColumn('Orders', 'assignedTo', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    const indexes = await queryInterface.showIndex('Orders');
    const hasAssignedTo = indexes.some(i => i.name === 'orders_assigned_to');
    if (!hasAssignedTo) {
      await queryInterface.addIndex('Orders', ['assignedTo'], { name: 'orders_assigned_to' });
    }
  },
  down: async (queryInterface) => {
    const indexes = await queryInterface.showIndex('Orders');
    const hasAssignedTo = indexes.some(i => i.name === 'orders_assigned_to');
    if (hasAssignedTo) {
      await queryInterface.removeIndex('Orders', 'orders_assigned_to');
    }
    const table = await queryInterface.describeTable('Orders');
    if (table.assignedTo) {
      await queryInterface.removeColumn('Orders', 'assignedTo');
    }
  }
};
