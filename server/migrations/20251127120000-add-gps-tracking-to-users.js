export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'gpsTrackingEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Users', 'gpsLastLat', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'gpsLastLng', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'gpsLastSeenAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('Users', ['role', 'gpsTrackingEnabled'], {
      name: 'users_role_tracking_enabled',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('Users', 'users_role_tracking_enabled');
    await queryInterface.removeColumn('Users', 'gpsTrackingEnabled');
    await queryInterface.removeColumn('Users', 'gpsLastLat');
    await queryInterface.removeColumn('Users', 'gpsLastLng');
    await queryInterface.removeColumn('Users', 'gpsLastSeenAt');
  },
};
