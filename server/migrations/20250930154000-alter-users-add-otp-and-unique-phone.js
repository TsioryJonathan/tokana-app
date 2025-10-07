export default {
  up: async (queryInterface, Sequelize) => {
    // 1) Make email nullable to support phone-first signup
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // 2) Add unique constraint on phone
    //    Note: ensure existing data has no duplicates before running
    await queryInterface.addConstraint('Users', {
      fields: ['phone'],
      type: 'unique',
      name: 'users_phone_unique',
    });

    // 3) Add account verification (OTP) fields
    await queryInterface.addColumn('Users', 'phoneVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'emailVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'accountOtpHash', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'accountOtpExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'accountOtpRequestCount', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Users', 'accountOtpLastRequestedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // ENUM for accountOtpChannel
    await queryInterface.sequelize.transaction(async (t) => {
      // Create enum type if not exists (Postgres specific). If using another DB, adjust as needed.
      // Some dialects don't need explicit enum type creation.
      try {
        await queryInterface.sequelize.query(
          "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Users_accountOtpChannel') THEN CREATE TYPE \"enum_Users_accountOtpChannel\" AS ENUM ('sms','email'); END IF; END $$;",
          { transaction: t }
        );
      } catch (e) {
        // ignore if dialect doesn't support
      }

      await queryInterface.addColumn(
        'Users',
        'accountOtpChannel',
        { type: Sequelize.ENUM('sms', 'email'), allowNull: true },
        { transaction: t }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove OTP-related columns
    await queryInterface.removeColumn('Users', 'accountOtpChannel');
    await queryInterface.removeColumn('Users', 'accountOtpLastRequestedAt');
    await queryInterface.removeColumn('Users', 'accountOtpRequestCount');
    await queryInterface.removeColumn('Users', 'accountOtpExpiresAt');
    await queryInterface.removeColumn('Users', 'accountOtpHash');
    await queryInterface.removeColumn('Users', 'emailVerifiedAt');
    await queryInterface.removeColumn('Users', 'phoneVerifiedAt');

    // Drop enum type if Postgres (safe guard; ignore error on other dialects)
    try {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Users_accountOtpChannel";'
      );
    } catch (e) {
      // ignore
    }

    // Remove unique constraint on phone
    try {
      await queryInterface.removeConstraint('Users', 'users_phone_unique');
    } catch (e) {
      // ignore if not present
    }

    // Revert email to NOT NULL (original schema)
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
