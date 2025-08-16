export default {
  up: async (queryInterface, Sequelize) => {
    // Skip if table already exists (idempotent guard)
    const exists = await queryInterface
      .describeTable('Localities')
      .then(() => true)
      .catch(() => false);
    if (exists) return;

    await queryInterface.createTable('Localities', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      axisId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Axes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Localities');
  },
};
