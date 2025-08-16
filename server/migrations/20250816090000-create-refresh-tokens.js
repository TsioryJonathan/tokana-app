export default {
  async up(queryInterface, Sequelize) {
    const tableName = 'RefreshTokens';
    const table = await queryInterface.describeTable(tableName).catch(() => null);
    if (table) return; // idempotent

    await queryInterface.createTable(tableName, {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      tokenHash: { type: Sequelize.STRING, allowNull: false, unique: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      revokedAt: { type: Sequelize.DATE, allowNull: true },
      rotatedAt: { type: Sequelize.DATE, allowNull: true },
      replacedByTokenId: { type: Sequelize.INTEGER, allowNull: true },
      userAgent: { type: Sequelize.STRING, allowNull: true },
      ip: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex(tableName, ['userId']);
    await queryInterface.addIndex(tableName, ['expiresAt']);
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'RefreshTokens';
    await queryInterface.dropTable(tableName).catch(() => {});
  }
};
