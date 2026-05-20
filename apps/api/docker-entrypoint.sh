#!/bin/sh
set -e

echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy --schema=packages/db/prisma/schema.prisma

echo "Starting Gayatri API..."
exec node --enable-source-maps apps/api/dist/main.js
