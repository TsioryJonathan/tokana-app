export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CourierSettlements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      courierId: { type: Sequelize.INTEGER, allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('DECLARED', 'CONFIRMED'),
        allowNull: false,
        defaultValue: 'DECLARED',
      },
      cashAmount: { type: Sequelize.INTEGER, allowNull: true },
      mobileMoneyAmount: { type: Sequelize.INTEGER, allowNull: true },
      declaredBy: { type: Sequelize.INTEGER, allowNull: true },
      confirmedBy: { type: Sequelize.INTEGER, allowNull: true },
      declaredAt: { type: Sequelize.DATE, allowNull: false },
      confirmedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('CourierSettlements', ['courierId', 'date'], {
      unique: true,
      name: 'couriersettlements_courier_date',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('CourierSettlements');
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_CourierSettlements_status";');
    }
  },
};
