export default {
  up: async (queryInterface, Sequelize) => {
    // Ajouter les nouveaux statuts à l'enum 'enum_Orders_status'
    // Note: PostgreSQL permet d'ajouter des valeurs à un enum existant
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Orders_status" ADD VALUE IF NOT EXISTS 'annule';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Orders_status" ADD VALUE IF NOT EXISTS 'compte_regle';
    `);

    // Ajouter la catégorie CUSTOM à l'enum 'enum_Orders_category'
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Orders_category" ADD VALUE IF NOT EXISTS 'CUSTOM';
    `);

    // Ajouter le champ customDimensions pour les dimensions personnalisées
    await queryInterface.addColumn('Orders', 'customDimensions', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Ajouter le champ senderRemarks pour les remarques de l'expéditeur
    await queryInterface.addColumn('Orders', 'senderRemarks', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    // Supprimer les colonnes ajoutées
    await queryInterface.removeColumn('Orders', 'customDimensions');
    await queryInterface.removeColumn('Orders', 'senderRemarks');
    
    // Note: On ne peut pas facilement supprimer des valeurs d'un enum en PostgreSQL
    // Il faudrait recréer l'enum, ce qui est complexe et risqué
    // Donc on laisse les valeurs en place
  },
};
