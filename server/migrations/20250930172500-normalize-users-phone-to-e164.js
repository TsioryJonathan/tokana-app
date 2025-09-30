export default {
  up: async (queryInterface) => {
    // Normalize existing Users.phone to +261 format
    await queryInterface.sequelize.transaction(async (t) => {
      // 1) Remove spaces, dots, dashes, parentheses
      await queryInterface.sequelize.query(
        "UPDATE \"Users\" SET \"phone\" = regexp_replace(\"phone\", '[\\s.\\-()]+', '', 'g') WHERE \"phone\" IS NOT NULL;",
        { transaction: t }
      );
      // 2) If phone starts with 261XXXXXXXXX -> +261XXXXXXXXX
      await queryInterface.sequelize.query(
        "UPDATE \"Users\" SET \"phone\" = '+' || \"phone\" WHERE \"phone\" ~ '^261\\d{9}$';",
        { transaction: t }
      );
      // 3) If phone is local 0(3x|20)xxxxxxx -> +261(3x|20)xxxxxxx
      await queryInterface.sequelize.query(
        "UPDATE \"Users\" SET \"phone\" = '+261' || substring(\"phone\" from 2) WHERE \"phone\" ~ '^0(3\\d|20)\\d{7}$';",
        { transaction: t }
      );
      // 4) All others unchanged (including already +261...)
    });
  },
  down: async (queryInterface) => {
    // Best-effort reversal: convert +261(3x|20)xxxxxxx back to 0(3x|20)xxxxxxx
    // Note: This is lossy for numbers that weren't originally local format.
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.sequelize.query(
        "UPDATE \"Users\" SET \"phone\" = '0' || substring(\"phone\" from 5) WHERE \"phone\" ~ '^\\+261(3\\d|20)\\d{7}$';",
        { transaction: t }
      );
    });
  },
};
