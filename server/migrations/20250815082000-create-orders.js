export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: Sequelize.ENUM('standard', 'express'), allowNull: false },
      zoneLevel: { type: Sequelize.ENUM('ville', 'peripherie', 'super-peripherie'), allowNull: false },
      pickupAddress: { type: Sequelize.STRING, allowNull: false },
      dropoffAddress: { type: Sequelize.STRING, allowNull: false },
      weight: { type: Sequelize.FLOAT, allowNull: false },
      parcels: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      cashToCollect: { type: Sequelize.INTEGER, allowNull: true },
      priceTotal: { type: Sequelize.INTEGER, allowNull: false },
      slotStart: { type: Sequelize.DATE, allowNull: true },
      slotEnd: { type: Sequelize.DATE, allowNull: true },
      status: {
        type: Sequelize.ENUM(
          'en_cours_de_traitement',
          'en_route_vers_recuperation',
          'en_chemin',
          'en_chemin_pour_livraison',
          'expedie'
        ),
        allowNull: false,
        defaultValue: 'en_cours_de_traitement',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    const indexes = await queryInterface.showIndex('Orders');
    const hasTypeZone = indexes.some(i => i.name === 'orders_type_zone_level');
    const hasStatus = indexes.some(i => i.name === 'orders_status');
    if (!hasTypeZone) {
      await queryInterface.addIndex('Orders', ['type', 'zoneLevel'], { name: 'orders_type_zone_level' });
    }
    if (!hasStatus) {
      await queryInterface.addIndex('Orders', ['status'], { name: 'orders_status' });
    }
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Orders');
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Orders_type\";");
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Orders_zoneLevel\";");
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Orders_status\";");
    }
  },
};
