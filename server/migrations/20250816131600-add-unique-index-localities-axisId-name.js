export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Localities', ['axisId', 'name'], {
      name: 'localities_axisid_name_unique',
      unique: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Localities', 'localities_axisid_name_unique');
  },
};
