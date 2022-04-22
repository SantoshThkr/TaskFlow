#!/bin/sh
# Bring the database schema up to date before serving requests.
set -e

alembic upgrade head
exec "$@"
