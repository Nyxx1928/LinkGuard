# Render Deployment Guide

## Architecture

| Service      | Provider   | URL                                        |
| ------------ | ---------- | ------------------------------------------ |
| **Frontend** | Vercel     | `https://link-guard-zero.vercel.app`       |
| **Backend**  | Render     | `https://link-guard-api.onrender.com`      |
| **Database** | TiDB Serverless | MySQL-compatible, provisioned via TiDB Cloud |

## How to Deploy / Redeploy

### Prerequisites

- Render account (https://render.com)
- GitHub repo connected to Render
- TiDB Cloud account (https://tidbcloud.com)

### Deployment Steps

1. Push changes to the `main` branch (or the branch connected to Render).

2. Render auto-deploys from the connected branch. Alternatively, trigger a manual deploy:
   - Go to https://dashboard.render.com
   - Select the `geotracker-api` service
   - Click **Manual Deploy** → **Deploy latest commit**

3. After deploy, run migrations if there are new ones:

   Via Render Shell (Dashboard → Service → Shell):
   ```bash
   php artisan migrate --force
   ```

   Or run remotely:
   ```bash
   curl -X POST https://link-guard-api.onrender.com/up
   ```

### Environment Variables (set in Render Dashboard)

| Variable               | Value                                               |
| ---------------------- | --------------------------------------------------- |
| `APP_ENV`              | `production`                                        |
| `APP_DEBUG`            | `false`                                             |
| `APP_KEY`              | *(auto-generated, set via Render secret)*           |
| `APP_URL`              | `https://link-guard-api.onrender.com`               |
| `DB_CONNECTION`        | `mysql`                                             |
| `DB_HOST`              | *(TiDB host, e.g. `gateway01.us-east-1.tidbcloud.com`)* |
| `DB_PORT`              | `4000`                                              |
| `DB_DATABASE`          | *(TiDB database name)*                              |
| `DB_USERNAME`          | *(TiDB username)*                                   |
| `DB_PASSWORD`          | *(TiDB password, set as secret)*                    |
| `DB_SSLMODE`           | `required`                                          |
| `FRONTEND_ORIGIN`      | `https://link-guard-zero.vercel.app`                 |
| `FRONTEND_ORIGINS`     | `https://link-guard-zero.vercel.app`                 |
| `SESSION_DRIVER`       | `database`                                          |
| `SESSION_SECURE_COOKIE`| `true`                                              |
| `SESSION_SAME_SITE`    | `none`                                              |
| `CACHE_STORE`          | `database`                                          |
| `QUEUE_CONNECTION`     | `database`                                          |
| `LOG_LEVEL`            | `error`                                             |
| `MAIL_MAILER`          | `smtp`                                              |
| `MAIL_HOST`            | `smtp-relay.brevo.com`                              |
| `MAIL_PORT`            | `587`                                               |
| `MAIL_USERNAME`        | *(Brevo SMTP login)*                                |
| `MAIL_PASSWORD`        | *(Brevo SMTP key, set as secret)*                   |
| `MAIL_ENCRYPTION`      | `tls`                                               |

## Frontend

The frontend is deployed on **Vercel** at `https://link-guard-zero.vercel.app`.

It points to the Render backend via the `REACT_APP_API_URL` env var in `frontend/vercel.json`:
```json
"REACT_APP_API_URL": "https://link-guard-api.onrender.com"
```

To redeploy the frontend after backend changes:
- Push to the connected branch, or
- Trigger a manual deploy in Vercel Dashboard

## TiDB Database Connection Details

TiDB Serverless is fully MySQL-compatible but uses **port 4000** (not 3306) and **requires SSL**.

Connection config in Render env vars:
| Variable       | Example Value                                    |
| -------------- | ------------------------------------------------ |
| `DB_HOST`      | `gateway01.us-east-1.prod.aws.tidbcloud.com`     |
| `DB_PORT`      | `4000`                                           |
| `DB_DATABASE`  | Your TiDB database name                          |
| `DB_USERNAME`  | Your TiDB username (e.g. `2hBzU4m2wB4Txxxx.root`) |
| `DB_PASSWORD`  | Your TiDB password                                |
| `DB_SSLMODE`   | `required`                                       |

> **Note:** You can also use a full `DB_URL` instead of individual vars:
> ```
> DB_URL=mysql://username:password@host:4000/dbname?ssl-mode=VERIFY_IDENTITY
> ```

## Verification

```bash
# Health check
curl https://link-guard-api.onrender.com/api/health

# Test a public endpoint
curl https://link-guard-api.onrender.com/api/lookup/example.com
```

## Troubleshooting

### Build Fails
- Check Render build logs: Dashboard → Service → Events
- Verify Docker builds locally: `docker build -f backend/Dockerfile backend/`

### Database Connection Issues
- Ensure TiDB IP allowlist includes Render's outbound IP ranges:
  - `35.173.0.0/18` (us-east)
  - `54.235.0.0/16` (us-east)
- TiDB requires SSL — `DB_SSLMODE=required` must be set
- Verify credentials in Render Dashboard → Environment

### 500 Errors
- Check Render runtime logs: Dashboard → Service → Logs
- Ensure `APP_KEY` is set
- Run `php artisan config:clear && php artisan config:cache` via Render Shell
- Check TiDB has no storage limit issues (free tier: 5GB)
