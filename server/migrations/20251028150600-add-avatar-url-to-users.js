export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'avatarUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'avatarUrl');
  },
};
