# Tokana Backend API Docs (MVP)

Base URL: http://localhost:5000
All responses are JSON. Times are ISO strings (UTC unless specified). Madagascar TZ: BUSINESS_TZ=Indian/Antananarivo.

Auth: Bearer access token in Authorization header unless noted.

## Auth

- POST /api/auth/register
  - Body (email or phone flows):
    - { email, password, role?, name?, phone }
    - OR { phone, password, role?, name?, email? }
  - Returns: { token, refreshToken, user }

- POST /api/auth/login
  - Body: { email, password } OR { phone, password }
  - Returns: { token, refreshToken, user }

- POST /api/auth/refresh
  - Body: { refreshToken }
  - Returns: { token, refreshToken }
  - Anti‑replay strict: if a rotated token is reused, all user sessions are revoked and 401 is returned.

- POST /api/auth/logout
  - Body: { refreshToken }
  - Returns: { msg }

- POST /api/auth/logout-all (auth required)
  - Revokes all refresh tokens for the current user.

## Me
- GET /api/me (auth required)
  - Returns current user profile { id, email, role, name, phone }

## Zones (public)
- GET /api/zones
  - Returns object keyed by zone key: { ville|peripherie|super-peripherie: { label, axes: { axisKey: string[] localities } } }
  - Example:
    {
      "ville": {
        "label": "TANA-VILLE (Centre-ville)",
        "axes": { "nord": ["Ankatso", "..."], "est": ["..."], ... }
      },
      "peripherie": { ... },
      "super-peripherie": { ... }
    }

## Admin Zones (auth admin)
Base: /api/admin/zones

- GET /api/admin/zones → [ { id, key, label } ]
- GET /api/admin/zones/:zoneId/axes → [ { id, zoneId, key, label } ]
- GET /api/admin/zones/axes/:axisId/localities → [ { id, axisId, name } ]

- POST /api/admin/zones
  - Body: { key: 'ville'|'peripherie'|'super-peripherie', label }
- PUT /api/admin/zones/:id
  - Body: { label }
- DELETE /api/admin/zones/:id

- POST /api/admin/zones/:zoneId/axes
  - Body: { key: 'nord'|'est'|'sud'|'ouest'|'nord_ouest'|'sud_ouest', label }
- PUT /api/admin/zones/axes/:id
  - Body: { label }
- DELETE /api/admin/zones/axes/:id

- POST /api/admin/zones/axes/:axisId/localities
  - Body: { name }
- PUT /api/admin/zones/localities/:id
  - Body: { name }
- DELETE /api/admin/zones/localities/:id

Notes DB integrity:
- Unique: Axis(zoneId,key), Locality(axisId,name). Zone/Axis keys are ENUMs (immutable keys; only labels/names editable).

## Orders
Base: /api/orders (auth required unless noted per action)

- POST /api/orders
  - Body:
    {
      type: 'standard'|'express',
      zoneLevel: 'ville'|'peripherie'|'super-peripherie',
      pickupAddress: string,
      dropoffAddress: string,
      weight: number (>0),
      parcels: integer ≥1,
      cashToCollect?: integer,
      recipientEmail?: string,
      // for standard
      slotStart?: ISO,
      slotEnd?: ISO
    }
  - Validations:
    - standard: must be within business order window; slotStart/slotEnd must match getStandardSlots(zoneLevel)
    - express: must be allowed by getExpressAvailability(now)
  - Returns 201: created order

- GET /api/orders
  - Non-admin: returns only own orders; livreur may filter with ?assignedTo=me
  - Admin: can add ?mine=true to filter to own

- GET /api/orders/:id
  - AuthZ: admin/livreur can view any; clients only own

- PATCH /api/orders/:id/assign (admin)
  - Body: { assignedTo: userId|null }

- GET /api/orders/:id/history
  - Returns status change history

- PATCH /api/orders/:id/status
  - Body: { status }
  - Allowed transitions:
    - en_cours_de_traitement → en_route_vers_recuperation
    - en_route_vers_recuperation → en_chemin | en_chemin_pour_livraison
    - en_chemin → en_chemin_pour_livraison
    - en_chemin_pour_livraison → expedie (requires verified OTP)

## Pricing
- POST /api/pricing/quote (auth required)
  - Body: { zoneLevel, type: 'standard'|'express', weight, parcels }
  - Rules summary:
    - Pickup fee per order: ville=0; peripherie=(0 if parcels>2 else 2000); super-peripherie=5000
    - Delivery + express surcharge per parcel
    - >5kg returns requiresManualHandling=true with instructions and optional contactPhone

## Slots
- GET /api/slots/standard?zoneLevel=ville|peripherie|super-peripherie
  - Returns list of { startISO, endISO }
- GET /api/slots/express
  - Returns { allowed: boolean, reason?: string }

## Delivery OTP
Base: /api/orders/:id

- POST /api/orders/:id/request-otp (auth: admin or assigned livreur)
  - Body: { channel: 'sms'|'email', phone?, email? }
  - Preconditions: order.status === 'en_chemin_pour_livraison'
  - Rate limiting / smoothing:
    - Window minutes: OTP_WINDOW_MINUTES (default 10)
    - Cooldown steps (sec): OTP_COOLDOWN_STEPS (default 0,60,120,300)
    - If too soon: HTTP 429, with headers: Retry-After: <sec>, body: { msg, retryAfter }
  - OTP TTL minutes: OTP_TTL_MINUTES (default 5)

- POST /api/orders/:id/verify-otp (auth: admin or assigned livreur)
  - Body: { code: '^[0-9]{6}$' }
  - On success: sets deliveryOtpVerifiedAt

- PATCH /api/orders/:id/status with { status: 'expedie' } requires OTP verified

## Errors (common)
- 400 Bad Request: validation errors
- 401 Unauthorized: no/invalid token; invalid/expired refresh token
- 403 Forbidden: not allowed for role/user
- 404 Not Found: resource missing
- 409 Conflict: unique constraint (e.g., duplicate axis/locality)
- 429 Too Many Requests: OTP resend smoothing window

## Env (relevant)
- ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, JWT_SECRET, JWT_REFRESH_SECRET
- OTP_TTL_MINUTES, OTP_SECRET, OTP_WINDOW_MINUTES, OTP_COOLDOWN_STEPS
- BUSINESS_TZ, SLOTS_DEV_ALWAYS_ON
- SMS_PROVIDER (dev|befiana), SMTP_* for email

## Curl examples (quick)
- List public zones:
  curl -s http://localhost:5000/api/zones | jq

- Admin list zones:
  curl -s -H "Authorization: Bearer TOKEN" http://localhost:5000/api/admin/zones | jq

- Quote pricing:
  curl -s -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
    -d '{"zoneLevel":"ville","type":"standard","weight":1.2,"parcels":1}' \
    http://localhost:5000/api/pricing/quote | jq

- Request OTP:
  curl -i -s -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
    -d '{"channel":"email"}' http://localhost:5000/api/orders/ORDER_ID/request-otp

- Verify OTP:
  curl -s -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
    -d '{"code":"123456"}' http://localhost:5000/api/orders/ORDER_ID/verify-otp | jq
