import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { sequelize } from "./config/sequelize.js";
import authRoutes from "./routes/authRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import zonesRoutes from "./routes/zonesRoutes.js";
import zonesAdminRoutes from "./routes/admin/zonesAdminRoutes.js";
import usersAdminRoutes from "./routes/admin/usersAdminRoutes.js";
import statsAdminRoutes from "./routes/admin/statsAdminRoutes.js";
import addressesRoutes from "./routes/addressesRoutes.js";
import meRoutes from "./routes/meRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { protect } from "./middleware/authMiddleware.js";
import User from "./models/User.js";
import swaggerUi from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { verifyEmailConfig } from "./services/emailService.js";



// Charger les variables d'environnement
dotenv.config();

// Diagnostic des variables d'environnement (sans afficher les secrets)
console.log('[app] Variables d\'environnement chargées:');
console.log(`[app] NODE_ENV: ${process.env.NODE_ENV || 'NON DÉFINI'}`);
console.log(`[app] PORT: ${process.env.PORT || 'NON DÉFINI'}`);
console.log(`[app] SMTP_HOST: ${process.env.SMTP_HOST || 'NON DÉFINI'}`);
console.log(`[app] SMTP_USER: ${process.env.SMTP_USER || 'NON DÉFINI'}`);
console.log(`[app] SMTP_PASS: ${process.env.SMTP_PASS ? 'DÉFINI (' + process.env.SMTP_PASS.length + ' caractères)' : 'NON DÉFINI'}`);
console.log(`[app] POSTGRES_URI: ${process.env.POSTGRES_URI ? 'DÉFINI' : 'NON DÉFINI'}`);

const app = express();

app.set("trust proxy", 1);
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connecté (Supabase)");
    // Rely on migrations; optional opt-in sync with DB_SYNC=alter (use with caution)
    if (process.env.DB_SYNC === "alter") {
      console.warn(
        "DB_SYNC=alter activé: synchronisation ALTER des modèles Sequelize"
      );
      await sequelize.sync({ alter: true });
    }
  } catch (err) {
    console.error("Erreur connexion DB:", err.message);
    process.exit(1);
  }
};
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET manquant dans les variables d'environnement");
  process.exit(1);
}
if (!process.env.POSTGRES_URI) {
  console.error("POSTGRES_URI manquant dans les variables d'environnement");
  process.exit(1);
}
await connectDB();

// Verify email configuration on startup
verifyEmailConfig().catch((err) => {
  console.warn('[app] Vérification SMTP échouée (mode DEV possible):', err.message);
});

// Security middlewares
app.use(helmet());
// CORS: allow only whitelisted origins if provided
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const corsOptions = {
  origin:
    allowedOrigins.length === 0
      ? true // allow all in absence of config (dev default)
      : (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin))
            return callback(null, true);
          return callback(new Error("Not allowed by CORS"));
        },
  credentials: true,
};
app.use(cors(corsOptions));
console.log(
  "CORS allowed origins:",
  allowedOrigins.length ? allowedOrigins : "ALL (dev)"
);
// Development request logger
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    const start = Date.now();
    const auth = req.headers.authorization
      ? `${req.headers.authorization.slice(0, 20)}...`
      : undefined;
    res.on("finish", () => {
      const ms = Date.now() - start;
      console.log(
        `[REQ] ${req.method} ${req.originalUrl} -> ${
          res.statusCode
        } (${ms}ms) auth:${auth ? "yes" : "no"}`
      );
    });
    next();
  });
}
// Rate limit API (only in production)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
if (process.env.NODE_ENV === "production") {
  app.use("/api/", limiter);
  console.log("Rate limiting enabled");
} else {
  console.log("Rate limiting disabled in development");
}
// Compression to save bandwidth on mobile
app.use(compression());
app.use(express.json());

// Optional: Sentry initialization if DSN provided
try {
  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/node");
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });
    app.use(Sentry.Handlers.requestHandler());
  }
} catch (e) {
  console.warn("Sentry not initialized:", e.message);
}

app.use("/api/auth", authRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/zones", zonesRoutes);
app.use("/api/admin/zones", zonesAdminRoutes);
app.use("/api/admin/users", usersAdminRoutes);
app.use("/api/admin/stats", statsAdminRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/me", meRoutes);

// Serve user uploads (avatars, etc.)
try {
  const __filename2 = fileURLToPath(import.meta.url);
  const __dirname2 = path.dirname(__filename2);
  app.use("/uploads", express.static(path.resolve(__dirname2, "uploads")));
  console.log("Static uploads served at /uploads");
} catch (e) {
  console.warn("Uploads static not mounted:", e.message);
}

// Lightweight health check (unauthenticated)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Compatibility route for client SDK: GET /api/me (same as /api/auth/me)
app.get("/api/me", protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      phoneVerifiedAt: user.phoneVerifiedAt,
      emailVerifiedAt: user.emailVerifiedAt,
      accountOtpExpiresAt: user.accountOtpExpiresAt,
      accountOtpChannel: user.accountOtpChannel,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    next(err);
  }
});

// Swagger UI at /docs
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const openapiPath = path.resolve(__dirname, "docs", "openapi.yaml");
  const file = fs.readFileSync(openapiPath, "utf8");
  const openapiDoc = yaml.parse(file);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
  console.log("Swagger UI mounted at /docs");
} catch (e) {
  console.warn(
    "Swagger UI not mounted (openapi.yaml missing or invalid):",
    e.message
  );
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`Serveur sur http://${HOST}:${PORT}`));
