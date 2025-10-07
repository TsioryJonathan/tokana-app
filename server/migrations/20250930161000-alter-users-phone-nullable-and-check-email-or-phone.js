export default {
  up: async (queryInterface, Sequelize) => {
    // 1) Make phone nullable
    await queryInterface.changeColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // 2) Add DB-level CHECK constraint: at least one of email or phone must be present
    // Name the constraint for easy rollback
    await queryInterface.addConstraint('Users', {
      fields: ['email', 'phone'],
      type: 'check',
      name: 'users_email_or_phone_not_null',
      where: Sequelize.literal('(email IS NOT NULL OR phone IS NOT NULL)'),
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop CHECK constraint
    try {
      await queryInterface.removeConstraint('Users', 'users_email_or_phone_not_null');
    } catch (e) {
      // ignore if not present
    }

    // Revert phone to NOT NULL (previous state before this migration)
    await queryInterface.changeColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
