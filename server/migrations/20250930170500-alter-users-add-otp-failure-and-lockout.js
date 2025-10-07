export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'accountOtpFailedAttempts', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Users', 'accountOtpLockedUntil', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'accountOtpLockedUntil');
    await queryInterface.removeColumn('Users', 'accountOtpFailedAttempts');
  },
};
