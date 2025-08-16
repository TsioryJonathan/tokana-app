export default {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Orders');
    if (!table.recipientPhone) {
      await queryInterface.addColumn('Orders', 'recipientPhone', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.deliveryOtpHash) {
      await queryInterface.addColumn('Orders', 'deliveryOtpHash', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.deliveryOtpExpiresAt) {
      await queryInterface.addColumn('Orders', 'deliveryOtpExpiresAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
    if (!table.deliveryOtpVerifiedAt) {
      await queryInterface.addColumn('Orders', 'deliveryOtpVerifiedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },
  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('Orders');
    if (table.deliveryOtpVerifiedAt) {
      await queryInterface.removeColumn('Orders', 'deliveryOtpVerifiedAt');
    }
    if (table.deliveryOtpExpiresAt) {
      await queryInterface.removeColumn('Orders', 'deliveryOtpExpiresAt');
    }
    if (table.deliveryOtpHash) {
      await queryInterface.removeColumn('Orders', 'deliveryOtpHash');
    }
    if (table.recipientPhone) {
      await queryInterface.removeColumn('Orders', 'recipientPhone');
    }
  }
};
