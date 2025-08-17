import bcrypt from 'bcryptjs';

export default {
  up: async (queryInterface, Sequelize) => {
    const email = process.env.ADMIN_EMAIL;
    const phone = process.env.ADMIN_PHONE;
    const name = process.env.ADMIN_NAME || 'Admin';
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !phone || !password) {
      console.warn('[seed-admin] Skipped: ADMIN_EMAIL/ADMIN_PHONE/ADMIN_PASSWORD missing in environment');
      return;
    }

    const now = new Date();

    // Check existing by email or phone
    const [existingByEmail] = await queryInterface.sequelize.query(
      'SELECT id, role FROM "Users" WHERE email = :email LIMIT 1',
      { replacements: { email }, type: Sequelize.QueryTypes.SELECT }
    );

    const [existingByPhone] = await queryInterface.sequelize.query(
      'SELECT id, role FROM "Users" WHERE phone = :phone LIMIT 1',
      { replacements: { phone }, type: Sequelize.QueryTypes.SELECT }
    );

    if (existingByEmail || existingByPhone) {
      const id = (existingByEmail?.id) || (existingByPhone?.id);
      // Ensure role is admin
      await queryInterface.sequelize.query(
        'UPDATE "Users" SET role = :role, "updatedAt" = :updatedAt WHERE id = :id',
        { replacements: { role: 'admin', id, updatedAt: now } }
      );
      console.log(`[seed-admin] Updated existing user ${id} to role=admin`);
      return;
    }

    // Hash password here as seeder bypasses model hooks
    const hashed = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('Users', [{
      email,
      phone,
      name,
      password: hashed,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    }]);

    console.log('[seed-admin] Admin user created');
  },

  down: async (queryInterface) => {
    const email = process.env.ADMIN_EMAIL;
    const phone = process.env.ADMIN_PHONE;
    if (!email && !phone) return;
    await queryInterface.bulkDelete('Users', {
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    });
    console.log('[seed-admin] Admin user deleted');
  },
};
