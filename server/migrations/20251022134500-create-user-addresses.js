export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserAddresses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      label: { type: Sequelize.STRING, allowNull: true },
      detail: { type: Sequelize.STRING, allowNull: false },
      lat: { type: Sequelize.DECIMAL(9, 6), allowNull: true },
      lng: { type: Sequelize.DECIMAL(9, 6), allowNull: true },
      isDefault: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('UserAddresses', ['userId']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('UserAddresses');
  },
};
