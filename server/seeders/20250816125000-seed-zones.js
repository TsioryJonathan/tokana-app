import fs from 'fs/promises';
import path from 'path';

export default {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const dataPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'data', 'zones.json');
      const raw = await fs.readFile(dataPath, 'utf-8');
      const zones = JSON.parse(raw);
      const now = new Date();

      // Insert Zones first
      const zoneKeyToId = {};
      for (const [key, zone] of Object.entries(zones)) {
        const normalizedKey = key.replace('_', '-');
        // Try to find existing
        let existing = await queryInterface.sequelize.query(
          'SELECT id FROM "Zones" WHERE key = :key LIMIT 1',
          { replacements: { key: normalizedKey }, type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        );
        let zoneId = existing[0]?.id;
        if (!zoneId) {
          const inserted = await queryInterface.sequelize.query(
            'INSERT INTO "Zones" (key, label, "createdAt", "updatedAt") VALUES (:key, :label, :createdAt, :updatedAt) RETURNING id',
            { replacements: { key: normalizedKey, label: zone.label || normalizedKey, createdAt: now, updatedAt: now }, type: queryInterface.sequelize.QueryTypes.INSERT, transaction }
          );
          // INSERT returns [resultRows, metadata] in pg; grab id from first row if present
          zoneId = Array.isArray(inserted) && inserted[0] && inserted[0][0] ? inserted[0][0].id : undefined;
          if (!zoneId) {
            // Fallback reselect
            existing = await queryInterface.sequelize.query(
              'SELECT id FROM "Zones" WHERE key = :key LIMIT 1',
              { replacements: { key: normalizedKey }, type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
            );
            zoneId = existing[0]?.id;
          }
        }
        zoneKeyToId[normalizedKey] = zoneId;
      }

      // Insert Axes and Localities
      const axisKeyToId = {};
      for (const [zoneKeyRaw, zone] of Object.entries(zones)) {
        const zoneKey = zoneKeyRaw.replace('_', '-');
        const zoneId = zoneKeyToId[zoneKey];
        const axes = zone.axes || {};
        for (const [axisKey, localities] of Object.entries(axes)) {
          const axisLabel = axisKey.replace('_', '-');
          // Find-or-insert Axis
          let ares = await queryInterface.sequelize.query(
            'SELECT id FROM "Axes" WHERE "zoneId" = :zoneId AND key = :key LIMIT 1',
            { replacements: { zoneId, key: axisKey }, type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
          );
          let axisId = ares[0]?.id;
          if (!axisId) {
            const insertedAxis = await queryInterface.sequelize.query(
              'INSERT INTO "Axes" ("zoneId", key, label, "createdAt", "updatedAt") VALUES (:zoneId, :key, :label, :createdAt, :updatedAt) RETURNING id',
              { replacements: { zoneId, key: axisKey, label: axisLabel, createdAt: now, updatedAt: now }, type: queryInterface.sequelize.QueryTypes.INSERT, transaction }
            );
            axisId = Array.isArray(insertedAxis) && insertedAxis[0] && insertedAxis[0][0] ? insertedAxis[0][0].id : undefined;
            if (!axisId) {
              ares = await queryInterface.sequelize.query(
                'SELECT id FROM "Axes" WHERE "zoneId" = :zoneId AND key = :key LIMIT 1',
                { replacements: { zoneId, key: axisKey }, type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
              );
              axisId = ares[0]?.id;
            }
          }
          axisKeyToId[`${zoneKey}:${axisKey}`] = axisId;

          if (Array.isArray(localities) && localities.length > 0) {
            for (const name of localities) {
              const lres = await queryInterface.sequelize.query(
                'SELECT id FROM "Localities" WHERE "axisId" = :axisId AND name = :name LIMIT 1',
                { replacements: { axisId, name }, type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
              );
              if (!lres[0]?.id) {
                await queryInterface.sequelize.query(
                  'INSERT INTO "Localities" ("axisId", name, "createdAt", "updatedAt") VALUES (:axisId, :name, :createdAt, :updatedAt)',
                  { replacements: { axisId, name, createdAt: now, updatedAt: now }, type: queryInterface.sequelize.QueryTypes.INSERT, transaction }
                );
              }
            }
          }
        }
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Localities', null, { transaction });
      await queryInterface.bulkDelete('Axes', null, { transaction });
      await queryInterface.bulkDelete('Zones', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
