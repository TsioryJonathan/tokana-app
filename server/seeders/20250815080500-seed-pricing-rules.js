export default {
  up: async (queryInterface) => {
    const now = new Date();
    const rows = [
      // VILLE (standard)
      { zoneLevel: 'ville', type: 'standard', minWeight: 0, maxWeight: 2, pickupFee: 0, deliveryFee: 3000, expressSurcharge: 0, createdAt: now, updatedAt: now },
      { zoneLevel: 'ville', type: 'standard', minWeight: 2, maxWeight: 5, pickupFee: 0, deliveryFee: 6000, expressSurcharge: 0, createdAt: now, updatedAt: now },
      // VILLE (express surcharge)
      { zoneLevel: 'ville', type: 'express', minWeight: 0, maxWeight: 2, pickupFee: 0, deliveryFee: 3000, expressSurcharge: 5000, createdAt: now, updatedAt: now },
      { zoneLevel: 'ville', type: 'express', minWeight: 2, maxWeight: 5, pickupFee: 0, deliveryFee: 6000, expressSurcharge: 5000, createdAt: now, updatedAt: now },

      // PERIPHERIE (standard)
      { zoneLevel: 'peripherie', type: 'standard', minWeight: 0, maxWeight: 2, pickupFee: 0, deliveryFee: 3500, expressSurcharge: 0, createdAt: now, updatedAt: now },
      { zoneLevel: 'peripherie', type: 'standard', minWeight: 2, maxWeight: 5, pickupFee: 0, deliveryFee: 7000, expressSurcharge: 0, createdAt: now, updatedAt: now },
      // PERIPHERIE (express surcharge)
      { zoneLevel: 'peripherie', type: 'express', minWeight: 0, maxWeight: 2, pickupFee: 0, deliveryFee: 3500, expressSurcharge: 7000, createdAt: now, updatedAt: now },
      { zoneLevel: 'peripherie', type: 'express', minWeight: 2, maxWeight: 5, pickupFee: 0, deliveryFee: 7000, expressSurcharge: 7000, createdAt: now, updatedAt: now },

      // SUPER-PERIPHERIE (standard)
      { zoneLevel: 'super-peripherie', type: 'standard', minWeight: 0, maxWeight: 2, pickupFee: 0, deliveryFee: 4000, expressSurcharge: 0, createdAt: now, updatedAt: now },
      { zoneLevel: 'super-peripherie', type: 'standard', minWeight: 2, maxWeight: 5, pickupFee: 0, deliveryFee: 8000, expressSurcharge: 0, createdAt: now, updatedAt: now },
      // SUPER-PERIPHERIE (express surcharge)
      { zoneLevel: 'super-peripherie', type: 'express', minWeight: 0, maxWeight: 2, pickupFee: 0, deliveryFee: 4000, expressSurcharge: 10000, createdAt: now, updatedAt: now },
      { zoneLevel: 'super-peripherie', type: 'express', minWeight: 2, maxWeight: 5, pickupFee: 0, deliveryFee: 8000, expressSurcharge: 10000, createdAt: now, updatedAt: now },
    ];

    await queryInterface.bulkInsert('PricingRules', rows);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('PricingRules', null, {});
  },
};
