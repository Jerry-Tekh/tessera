# Tessera Frontend

React + Vite frontend for Tessera.

## Local Development

Run the API on `http://localhost:3000`, then start the frontend:

```bash
npm install
npm run dev
```

Vite serves the app on `http://127.0.0.1:5173/` and proxies `/api` to the backend.

## Production API Origin

For same-origin deployments that proxy `/api` to the backend, no frontend env vars are required.

For separate frontend/API origins, set:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## Demo Logins

Seed these accounts from the backend with `npm run seed:demo-users`.

All demo accounts use password `TesseraDemo123!`.

| Role | Email |
| --- | --- |
| super_admin | `demo.superadmin@tessera.local` |
| organizer | `demo.organizer@tessera.local` |
| event_staff | `demo.staff@tessera.local` |
| registered_user | `demo.user@tessera.local` |
