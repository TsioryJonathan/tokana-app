# Tokana Client — Deployment Guide

This document explains how to deploy the Expo client (Web and Mobile).

## Prerequisites
- Node.js LTS
- Deployed API accessible over HTTPS
- Production API URL to set in `client/app.json`

## Configuration
In `client/app.json`, set the production API URL when available:
```json
{
  "expo": {
    "extra": {
      "API_BASE_PROD": "https://api.your-domain.com"
    }
  }
}
```

The client automatically uses:
- In development: `expo.extra.API_BASE_DEV` if present, otherwise Metro/Expo host IP detection.
- In production: `expo.extra.API_BASE_PROD`.

## Web deployment (static)
1) Export static files:
```
npm run export:web
```
2) Deploy the contents of the `dist/` folder to a static host (Netlify, Vercel, S3+CloudFront, etc.).

Notes:
- `app.json → web.bundler: "metro"` and `output: "static"` are already configured.

## Mobile deployment
For iOS/Android binaries, use EAS Build:
1) Install the tool:
```
npm i -g eas-cli
```
2) Initialize EAS in `client/`:
```
eas login
npx expo whoami
eas init
```
3) Build:
```
eas build -p android --profile production
eas build -p ios --profile production
```
4) Distribute via the Play Store / App Store.

Make sure `API_BASE_PROD` points to your live API before publishing.

## Verification
- Run locally in dev for a final check:
```
npm start
# then w for Web, a for Android, i for iOS (on macOS)
```
- In Expo Go, check logs to ensure the correct API base is used in dev.
- In production, open the browser network panel to confirm calls go to `API_BASE_PROD`.
