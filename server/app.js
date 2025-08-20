import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { sequelize } from './config/sequelize.js';
import authRoutes from './routes/authRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import zonesRoutes from './routes/zonesRoutes.js';
import zonesAdminRoutes from './routes/admin/zonesAdminRoutes.js';
import usersAdminRoutes from './routes/admin/usersAdminRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connecté (Supabase)');
    // Rely on migrations; optional opt-in sync with DB_SYNC=alter (use with caution)
    if (process.env.DB_SYNC === 'alter') {
      console.warn('DB_SYNC=alter activé: synchronisation ALTER des modèles Sequelize');
      await sequelize.sync({ alter: true });
    }
  } catch (err) {
    console.error('Erreur connexion DB:', err.message);
    process.exit(1);
  }
};
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant dans les variables d\'environnement');
  process.exit(1);
}
if (!process.env.POSTGRES_URI) {
  console.error('POSTGRES_URI manquant dans les variables d\'environnement');
  process.exit(1);
}
await connectDB();

// Security middlewares
app.use(helmet());
// CORS: allow only whitelisted origins if provided
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
const corsOptions = {
  origin: allowedOrigins.length === 0
    ? true // allow all in absence of config (dev default)
    : (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
  credentials: true,
};
app.use(cors(corsOptions));
console.log('CORS allowed origins:', allowedOrigins.length ? allowedOrigins : 'ALL (dev)');
// Rate limit API
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);
// Compression to save bandwidth on mobile
app.use(compression());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/admin/zones', zonesAdminRoutes);
app.use('/api/admin/users', usersAdminRoutes);

// Swagger UI at /docs
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const openapiPath = path.resolve(__dirname, 'docs', 'openapi.yaml');
  const file = fs.readFileSync(openapiPath, 'utf8');
  const openapiDoc = yaml.parse(file);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
  console.log('Swagger UI mounted at /docs');
} catch (e) {
  console.warn('Swagger UI not mounted (openapi.yaml missing or invalid):', e.message);
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`Serveur sur http://${HOST}:${PORT}`));