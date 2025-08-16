export default {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Orders');
    if (!table.createdBy) {
      await queryInterface.addColumn('Orders', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    const indexes = await queryInterface.showIndex('Orders');
    const hasCreatedBy = indexes.some(i => i.name === 'orders_created_by');
    if (!hasCreatedBy) {
      await queryInterface.addIndex('Orders', ['createdBy'], { name: 'orders_created_by' });
    }
  },
  down: async (queryInterface) => {
    const indexes = await queryInterface.showIndex('Orders');
    const hasCreatedBy = indexes.some(i => i.name === 'orders_created_by');
    if (hasCreatedBy) {
      await queryInterface.removeIndex('Orders', 'orders_created_by');
    }
    const table = await queryInterface.describeTable('Orders');
    if (table.createdBy) {
      await queryInterface.removeColumn('Orders', 'createdBy');
    }
  }
};
