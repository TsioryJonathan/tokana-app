export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Axes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      zoneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Zones', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      key: { type: Sequelize.ENUM('nord', 'est', 'sud', 'ouest', 'nord_ouest'), allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Axes');
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Axes_key\";");
    }
  },
};
