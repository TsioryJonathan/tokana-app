export default {
  up: async (queryInterface) => {
    // Postgres: add enum value if not exists
    const sql = `DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'enum_Axes_key' AND e.enumlabel = 'sud_ouest'
      ) THEN
        ALTER TYPE "enum_Axes_key" ADD VALUE 'sud_ouest';
      END IF;
    END
    $$;`;
    await queryInterface.sequelize.query(sql);
  },
  down: async () => {
    // No reliable down for removing enum values in PostgreSQL; leave as-is
  },
};
