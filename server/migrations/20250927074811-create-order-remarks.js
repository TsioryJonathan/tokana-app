import { DataTypes } from "sequelize";

export async function up(queryInterface) {
  await queryInterface.createTable("OrderRemarks", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    text: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    createdBy: {
      // ⚠️ ajouté car présent dans ton modèle
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users", // si tu as une table Users
        key: "id",
      },
      onDelete: "SET NULL",
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex("OrderRemarks", ["orderId"]);
  await queryInterface.addIndex("OrderRemarks", ["createdBy"]);
}

export async function down(queryInterface) {
  await queryInterface.dropTable("OrderRemarks");
}
