export default {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Orders');
    if (!table.recipientEmail) {
      await queryInterface.addColumn('Orders', 'recipientEmail', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('Orders');
    if (table.recipientEmail) {
      await queryInterface.removeColumn('Orders', 'recipientEmail');
    }
  }
};
