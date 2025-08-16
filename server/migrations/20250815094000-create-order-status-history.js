export default {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    // Normalize table names to handle case-sensitivity across dialects
    const hasTable = tables.map(t => (typeof t === 'string' ? t.toLowerCase() : t.tableName?.toLowerCase())).includes('orderstatushistories');
    if (!hasTable) {
      await queryInterface.createTable('OrderStatusHistories', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        orderId: { type: Sequelize.INTEGER, allowNull: false },
        fromStatus: {
          type: Sequelize.ENUM(
            'en_cours_de_traitement',
            'en_route_vers_recuperation',
            'en_chemin',
            'en_chemin_pour_livraison',
            'expedie'
          ),
          allowNull: false,
        },
        toStatus: {
          type: Sequelize.ENUM(
            'en_cours_de_traitement',
            'en_route_vers_recuperation',
            'en_chemin',
            'en_chemin_pour_livraison',
            'expedie'
          ),
          allowNull: false,
        },
        changedBy: { type: Sequelize.INTEGER, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      });
      await queryInterface.addIndex('OrderStatusHistories', ['orderId', 'createdAt'], { name: 'osh_order_created_idx' });
    }
  },
  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    const hasTable = tables.map(t => (typeof t === 'string' ? t.toLowerCase() : t.tableName?.toLowerCase())).includes('orderstatushistories');
    if (hasTable) {
      await queryInterface.removeIndex('OrderStatusHistories', 'osh_order_created_idx');
      await queryInterface.dropTable('OrderStatusHistories');
    }
  }
};
