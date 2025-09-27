export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("PricingRules", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      zoneLevel: {
        type: Sequelize.ENUM("ville", "peripherie", "super-peripherie"),
        allowNull: false,
      },
      type: { type: Sequelize.ENUM("standard", "express"), allowNull: false },
      minWeight: { type: Sequelize.FLOAT, allowNull: false },
      maxWeight: { type: Sequelize.FLOAT, allowNull: false },
      pickupFee: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      deliveryFee: { type: Sequelize.INTEGER, allowNull: false },
      expressSurcharge: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("PricingRules", ["zoneLevel", "type"]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("PricingRules");
    // Note: ENUM types may remain in Postgres; dropping them is optional and environment-specific
    if (queryInterface.sequelize.getDialect() === "postgres") {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_PricingRules_zoneLevel";'
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_PricingRules_type";'
      );
    }
  },
};
