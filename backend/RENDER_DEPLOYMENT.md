# Render Deployment Guide

> **Current deployment:** Railway (`https://geotracker-production-b922.up.railway.app`)
> **Target:** Migrate backend from Railway to Render

## Prerequisites

- Render account (sign up at https://render.com)
- GitHub repo connected to Render
- A free MySQL database from a third-party provider (see options below)

## Architecture

| Service      | Provider   | Notes                                   |
| ------------ | ---------- | --------------------------------------- |
| **Backend**  | Render     | Laravel (Docker Web Service)            |
| **Database** | 3rd-party  | Free MySQL from provider of your choice |
| **Frontend** | Vercel     | Already deployed — update API URL       |

## Free MySQL Providers (Recommendations)

| Provider        | Free Tier                           | Notes                                  |
| --------------- | ----------------------------------- | -------------------------------------- |
| **PlanetScale** | 1GB storage, 10M queries/month      | MySQL-compatible (Vitess). No credit card needed. Easiest option. |
| **TiDB Serverless** | 5GB storage, 50M requests/month | MySQL-compatible. No credit card needed. |
| **Aiven**       | 1GB storage, MySQL 8                | Requires credit card.                |
| **AlwaysData**  | 100MB, 1 database                   | Basic, good for small projects.      |
| **db4free.net** | 200MB, MySQL 8                      | For testing only — no SLA.           |

**Recommended: PlanetScale** — create a free database at https://planetscale.com, then grab the connection credentials (host, port, database name, username, password).

## Deployment Steps

### 1. Create a Render Blueprint (render.yaml)

Create `render.yaml` at the repo root (`C:\Users\echob\OneDrive\Desktop\JLabs3\render.yaml`):

```yaml
services:
  - type: web
    name: geotracker-api
    env: docker
    repo: https://github.com/YOUR_ORG/YOUR_REPO
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_DEBUG
        value: "false"
      - key: APP_URL
        value: https://geotracker-api.onrender.com
      - key: APP_KEY
        sync: false
      - key: FRONTEND_ORIGIN
        value: https://geo-tracker-eight-blond.vercel.app
      - key: FRONTEND_ORIGINS
        value: https://geo-tracker-eight-blond.vercel.app
      - key: SANCTUM_STATEFUL_DOMAINS
        value: geo-tracker-eight-blond.vercel.app
      - key: SESSION_DRIVER
        value: database
      - key: SESSION_SECURE_COOKIE
        value: "true"
      - key: SESSION_SAME_SITE
        value: none
      - key: DB_CONNECTION
        value: mysql
      - key: DB_HOST
        value: YOUR_DB_HOST         # from your MySQL provider
      - key: DB_PORT
        value: "3306"
      - key: DB_DATABASE
        value: YOUR_DB_NAME         # from your MySQL provider
      - key: DB_USERNAME
        value: YOUR_DB_USER         # from your MySQL provider
      - key: DB_PASSWORD
        sync: false                 # set in dashboard
      - key: CACHE_STORE
        value: database
      - key: QUEUE_CONNECTION
        value: database
      - key: LOG_CHANNEL
        value: stack
      - key: LOG_LEVEL
        value: error
```

### 2. Generate APP_KEY

Run locally from the `backend/` directory:

```bash
php artisan key:generate --show
```

### 3. Set Up Your Free MySQL Database

**With PlanetScale (recommended):**
1. Sign up at https://planetscale.com
2. Create a new database
3. Go to Settings → Passwords → Create password
4. Copy the connection details (host, database name, username, password)
5. Note: PlanetScale uses SSL — add `?ssl={"rejectUnauthorized":true}` or set `DB_SSLMODE=required` if needed

**With TiDB Serverless:**
1. Sign up at https://tidbcloud.com
2. Create a free cluster
3. Go to Connect → Get connection string
4. Use the provided host, port (4000), username, and password

### 4. Deploy via Render Dashboard

1. Go to https://dashboard.render.com
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create the web service
5. When prompted, set:
   - `APP_KEY` — paste the value from step 2
   - `DB_PASSWORD` — your MySQL provider's password
   - Fill in `DB_HOST`, `DB_DATABASE`, `DB_USERNAME` with your provider's values
6. Click **Apply**

### 5. Allow Render IPs in Your Database Provider

Most MySQL providers require allowlisting IPs. Add Render's outbound IPs:

- `35.173.0.0/18` (us-east)
- `54.235.0.0/16` (us-east)
- Or use `0.0.0.0/0` for open access (not recommended for production)

### 6. Run Migrations

After deploy, open Render Shell (`https://dashboard.render.com → your service → Shell`):

```bash
php artisan migrate --force
```

### 7. Update Frontend API URL

In `frontend/vercel.json`, change the Railway URL to the new Render URL:

```json
"env": {
  "REACT_APP_API_URL": "https://geotracker-api.onrender.com"
}
```

Redeploy the frontend on Vercel.

### 8. Verify

```bash
curl https://geotracker-api.onrender.com/api/health
```

## Post-Migration Cleanup

1. **Remove Railway files** (optional but recommended):
   - `backend/railway.json`
   - `backend/railway.toml`
   - `backend/RAILWAY_DEPLOYMENT.md`
   - `backend/.railwayignore`

2. **Remove Railway project** from https://railway.app

3. **Update any docs** referencing the old Railway URL.

## Troubleshooting

### Build Fails
- Verify `dockerfilePath: ./backend/Dockerfile` and `dockerContext: ./backend` are correct
- Check Render build logs for errors

### Database Connection Issues
- Verify the credentials in Render environment variables
- Ensure you've allowlisted Render IPs in your MySQL provider
- PlanetScale/TiDB use SSL — if the connection fails, try adding `DB_SSLMODE=required` or `MYSQL_ATTR_SSL_CA` config

### 500 Errors
- Check Render logs: Dashboard → Service → Logs
- Ensure `APP_KEY` is set
- Run `php artisan config:clear && php artisan config:cache` via Render Shell
