export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Axes', ['zoneId', 'key'], {
      name: 'axes_zoneid_key_unique',
      unique: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Axes', 'axes_zoneid_key_unique');
  },
};
