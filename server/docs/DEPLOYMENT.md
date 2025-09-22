# Tokana Server – Deployment Guide (MVP)

This guide explains how to run the Tokana backend in Development and Production with the required environment variables for OTP, SMS, Email, and delivery slots.

## Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Bash/cURL

## 1) Environment variables
Duplicate `server/.env.example` to `server/.env` and fill values.

Key sections to review:

- Business timezone and slots
  - `BUSINESS_TZ=Indian/Antananarivo`
  - `SLOTS_DEV_ALWAYS_ON=true` (force open windows in dev)

- JWT / Sessions
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`

- OTP (Proof of Delivery)
  - `OTP_SECRET` (random secret for hashing OTP)
  - `OTP_TTL_MINUTES=5`
  - `OTP_WINDOW_MINUTES=10` (smoothing window)
  - `OTP_COOLDOWN_STEPS=0,60,120,300` (cooldown per resend in the window)

- SMS (Notifications + OTP via SMS)
  - `SMS_PROVIDER=dev|befiana`
  - If `befiana`: set `SMS_BEFIANA_API_URL`, `SMS_BEFIANA_API_KEY`, `SMS_SENDER_ID`
  - If values are missing, the server logs messages instead of sending (DEV-safe)

- Email (Fallback for OTP/notifications)
  - `SMTP_HOST`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - If missing, emails are logged in DEV

- Business contact (optional)
  - `CONTACT_PHONE` used in pricing responses when weight > 5kg (manual handling)

## 2) Database
- Create the database and user that match `DB_*` in `.env`.
- Run Sequelize migrations and optional seeders.

Example:
```bash
# from repository root
export PGPASSWORD=postgres
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE tokana_dev;"

# Install server deps
npm --prefix server ci

# Run migrations
npm --prefix server run sequelize -- db:migrate

# (Optional) seed pricing rules, zones, admin
npm --prefix server run sequelize -- db:seed:all
```

## 3) Run server (Development)
```bash
# from repository root
npm --prefix server run dev
# Server listens on PORT (default 5000)
```

In DEV mode:
- If SMS/SMTP creds are not provided, messages are printed to logs.
- `SLOTS_DEV_ALWAYS_ON=true` keeps both Standard and Express order windows open for testing.

## 4) Run server (Production)
- Set strong secrets (`JWT_*`, `OTP_SECRET`).
- Use a real SMS provider (e.g., Befiana) and valid SMTP credentials.
- Configure `BUSINESS_TZ` to the correct timezone.
- Ensure HTTPS termination on your reverse proxy.

Example (systemd unit) sketch:
```ini
[Unit]
Description=Tokana Server
After=network.target

[Service]
Type=simple
User=tokana
Group=tokana
WorkingDirectory=/opt/tokana/server
Environment=NODE_ENV=production
EnvironmentFile=/opt/tokana/server/.env
ExecStart=/usr/bin/npm start --prefix /opt/tokana/server
Restart=always

[Install]
WantedBy=multi-user.target
```

## 5) API Endpoints (MVP highlights)
- Orders
  - `POST /api/orders` (supports `recipientPhone` in MG format and `recipientEmail`)
  - `PATCH /api/orders/:id/status` (sends best‑effort SMS/Email notification after update)
  - `POST /api/orders/:id/request-otp` and `POST /api/orders/:id/verify-otp`
- Pricing
  - `POST /api/pricing/quote`
- Slots
  - `GET /api/slots?type=standard&zoneLevel=...`
  - `GET /api/slots?type=express`

Refer to `server/docs/API.md` and `server/docs/openapi.yaml` for full details.

## 6) Quick verification (smoke tests)
- Health/auth flows (register/login), list zones, quote pricing.
- Create an order with `recipientPhone` and update status; check logs for SMS/Email in DEV.
- OTP request/verify and ensure `status=expedie` requires verified OTP.

## 7) Troubleshooting
- OTP not sending: verify `OTP_*` and check logs for rate‑limit (HTTP 429 with Retry‑After header).
- SMS not delivered: check `SMS_PROVIDER` and provider keys; in DEV messages are logged.
- Email not delivered: verify SMTP creds; in DEV messages are logged.
- Slots empty for standard: ensure order time is within business window or set `SLOTS_DEV_ALWAYS_ON=true` in DEV.
