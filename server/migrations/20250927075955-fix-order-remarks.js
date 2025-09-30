import { DataTypes } from "sequelize";

export async function up(queryInterface, Sequelize) {
  // Create table if it doesn't already exist
  try {
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
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
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
  } catch (e) {
    // If table exists, ignore error
  }

  // Add indexes if not existing (use IF NOT EXISTS when possible)
  try {
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "order_remarks_order_id" ON "OrderRemarks" ("orderId");'
    );
  } catch (e) {
    // ignore
  }
  try {
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "order_remarks_created_by" ON "OrderRemarks" ("createdBy");'
    );
  } catch (e) {
    // ignore
  }
}

export async function down(queryInterface) {
  try {
    await queryInterface.dropTable("OrderRemarks");
  } catch (e) {
    // ignore
  }
}
