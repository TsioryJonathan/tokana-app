# Tokana Server — Deployment Guide

This document explains how to deploy the Node/Express API to production.

## Prerequisites
- Node.js LTS
- Reachable PostgreSQL database (single URI)
- HTTPS reverse proxy recommended (Nginx, Caddy) or a managed platform
- Properly defined environment variables

## Environment variables
Prepare the file: `server/.env`

Minimum required:
- `POSTGRES_URI` — e.g., `postgres://USER:PASS@HOST:5432/DB`
- `JWT_SECRET` — a strong secret (e.g., `openssl rand -base64 48`)

Recommended:
- `ALLOWED_ORIGINS` — comma-separated allowed frontend origins
- `PORT` (default: 5000), `HOST` (default: 0.0.0.0)

Example (`server/.env`):
```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
POSTGRES_URI=postgres://postgres:postgres@db:5432/tokana_prod
JWT_SECRET=REPLACE_WITH_STRONG_SECRET
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

## Migrations and seeds
Run from `server/`:
```
npm run migrate
# Optional: npm run seed
```
Both `config/config.json` and `config/sequelize.js` read `POSTGRES_URI`.

## Starting the API
- Simple production run:
```
NODE_ENV=production node app.js
```
- With PM2 (recommended):
```
npm i -g pm2
pm2 start app.js --name tokana-api --update-env
pm2 save
```

## CORS in production
In `server/app.js`, CORS uses `ALLOWED_ORIGINS`.
- Empty in dev => allows all.
- In production, set your domains:
```
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
```

## Health & documentation
- Healthcheck: `GET /api/health`
- Swagger UI: `GET /docs` (requires `server/docs/openapi.yaml`)

## Notes
- Rate limiting is automatically enabled in production (see `app.js`).
- Compression (`compression`) and hardening (`helmet`) are already enabled.
