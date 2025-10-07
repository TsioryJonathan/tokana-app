import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  logging: false,
  pool: { max: 5, min: 0, idle: 10000, acquire: 30000 },
  retry: { max: 3 },
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: { require: true, rejectUnauthorized: false },
          keepAlive: true,
        }
      : {},
});
