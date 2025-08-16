export default {
  async up(queryInterface, Sequelize) {
    const table = 'Orders';
    const desc = await queryInterface.describeTable(table);
    const addIfMissing = async (name, spec) => {
      if (!desc[name]) {
        await queryInterface.addColumn(table, name, spec);
      }
    };
    await addIfMissing('recipientPhone', { type: Sequelize.STRING, allowNull: true });
    await addIfMissing('deliveryOtpHash', { type: Sequelize.STRING, allowNull: true });
    await addIfMissing('deliveryOtpExpiresAt', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('deliveryOtpVerifiedAt', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('deliveryOtpRequestCount', { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 });
    await addIfMissing('deliveryOtpLastRequestedAt', { type: Sequelize.DATE, allowNull: true });
  },
  async down(queryInterface) {
    const table = 'Orders';
    const desc = await queryInterface.describeTable(table);
    const removeIfExists = async (name) => { if (desc[name]) { await queryInterface.removeColumn(table, name).catch(()=>{}); } };
    await removeIfExists('recipientPhone');
    await removeIfExists('deliveryOtpHash');
    await removeIfExists('deliveryOtpExpiresAt');
    await removeIfExists('deliveryOtpVerifiedAt');
    await removeIfExists('deliveryOtpRequestCount');
    await removeIfExists('deliveryOtpLastRequestedAt');
  }
};
