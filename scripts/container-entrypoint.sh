#!/bin/bash

set -euxo pipefail

# Run the Prisma CLI directly (the standalone build does not expose it on PATH).
node node_modules/prisma/build/index.js migrate deploy
# Start the Next.js standalone server.
exec node server.js
