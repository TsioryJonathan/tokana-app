# Tokana Client SDK (Expo/React Native)

This guide explains how to generate and use the TypeScript SDK for the frontend app from the backend OpenAPI spec.

- Backend OpenAPI spec: `server/docs/openapi.yaml`
- Generated SDK output: `client/app/lib/api/`
- Generator: `openapi-typescript-codegen`

## 1) Install the generator (in client)

Run in `client/` directory:

```bash
npm i -D openapi-typescript-codegen
```

## 2) Generate the SDK

Preferred: use the npm script in `client/` to avoid command duplication.

```bash
cd client
npm run gen:sdk
```

This creates:
- `client/app/lib/api/OpenAPI.ts` (runtime config)
- `client/app/lib/api/services/*` (API services per resource)
- `client/app/lib/api/models/*` (TypeScript models)

Tip: add an NPM script in `client/package.json` for convenience:

```json
{
  "scripts": {
    "gen:sdk": "openapi-typescript-codegen --input ../server/docs/openapi.yaml --output ./app/lib/api --client fetch --exportCore --exportServices --exportModels --name TokanaApiClient"
  }
}
```

Note: The SDK is meant to live under `client/app/lib/api/`. If you previously generated a SDK outside `client/` (e.g., at repo root `app/lib/api/`), you can remove that old folder to avoid confusion.

## 3) Configure the SDK at runtime

Set the base URL and auth token once (after login/refresh):

```ts
// client/app/lib/apiClient.ts
import { OpenAPI } from './lib/api';

export function configureApi(baseUrl: string, token?: string) {
  OpenAPI.BASE = baseUrl;            // e.g. 'http://localhost:5000'
  OpenAPI.TOKEN = token;             // set after login / refresh
}
```

## 4) Example usage

```ts
// client/app/(example)/login.ts
import { AuthService, OpenAPI } from '../lib/api';

OpenAPI.BASE = 'http://localhost:5000';

const { token, refreshToken } = await AuthService.postApiAuthLogin({
  email: 'client@example.com',
  password: 'secret',
});

OpenAPI.TOKEN = token;
```

```ts
// client/app/(example)/orders.ts
import { OrdersService, OpenAPI } from '../lib/api';

OpenAPI.BASE = 'http://localhost:5000';
// OpenAPI.TOKEN must be set (see login example)

const myOrders = await OrdersService.apiOrdersGet({ mine: true });
```

## 5) Error handling

The OpenAPI spec defines detailed error responses (401/403/404/409/429). The generated services expose these via `errors` metadata and reject the promise when an error occurs.

- 401 Unauthorized: handle by refreshing the token via `POST /api/auth/refresh`, then set `OpenAPI.TOKEN` and retry.
- 403 Forbidden: RBAC violation (e.g., admin-only route).
- 404 Not Found: resource does not exist.
- 409 Conflict: business rules (e.g., invalid status transition or duplicate keys).
- 429 Too Many Requests: OTP cooldown in delivery flow.

## 6) Keep types in sync

Whenever `server/docs/openapi.yaml` changes, regenerate the SDK:

```bash
cd client
npm run gen:sdk
```

Notes:
- Prefer referencing named schemas in `openapi.yaml` (e.g., `LoginRequest`) to get clean TypeScript types.
- Swagger UI is available at `http://localhost:5000/docs` for exploration and testing.

## Appendix (optional): raw npx command

If you prefer not to use the npm script, the equivalent command is:

```bash
cd client
npx openapi-typescript-codegen \
  --input ../server/docs/openapi.yaml \
  --output ./app/lib/api \
  --client fetch \
  --exportCore true --exportServices true --exportModels true \
  --name TokanaApiClient
```
