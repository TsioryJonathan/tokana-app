import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './config/sequelize.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();
const app = express();

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connecté (Supabase)');
    await sequelize.sync({ alter: true }); // Dev only
  } catch (err) {
    console.error('Erreur connexion DB:', err.message);
    process.exit(1);
  }
};
await connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur sur port ${PORT}`));