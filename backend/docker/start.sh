#!/bin/bash
set -e

echo "==> Running Laravel startup tasks..."

php artisan key:generate --force --no-interaction || true

# Ensure Apache loads only one MPM; some base images re-enable event by default
if command -v a2dismod >/dev/null 2>&1; then
	a2dismod mpm_event >/dev/null 2>&1 || true
	a2dismod mpm_worker >/dev/null 2>&1 || true
	a2enmod mpm_prefork >/dev/null 2>&1 || true
fi

# Clear stale cache
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "==> Starting Apache..."
exec apache2-foreground
