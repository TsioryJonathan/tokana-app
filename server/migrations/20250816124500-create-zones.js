export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Zones', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      key: { type: Sequelize.ENUM('ville', 'peripherie', 'super-peripherie'), allowNull: false, unique: true },
      label: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Zones');
    // Drop ENUM type if needed (Postgres)
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Zones_key\";");
    }
  },
};
