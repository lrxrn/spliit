FROM node:21-alpine AS base

WORKDIR /usr/app
COPY ./package.json \
     ./package-lock.json \
     ./next.config.mjs \
     ./tsconfig.json \
     ./reset.d.ts \
     ./tailwind.config.js \
     ./postcss.config.js ./
COPY ./scripts ./scripts
COPY ./prisma ./prisma

RUN apk add --no-cache openssl && \
    ( for i in 1 2 3 4 5; do \
        npm ci --ignore-scripts --fetch-retries=5 --fetch-timeout=600000 && exit 0; \
        echo "npm ci failed (attempt $i), retrying in 10s..."; sleep 10; \
      done; exit 1 ) && \
    npx prisma generate

COPY ./src ./src
COPY ./messages ./messages

ENV NEXT_TELEMETRY_DISABLED=1

COPY scripts/build.env .env
RUN npm run build

FROM node:21-alpine AS runner

EXPOSE 3000/tcp
WORKDIR /usr/app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Listen on all interfaces inside the container.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache openssl

# Next.js standalone server: a minimal node_modules traced from the build,
# plus the static assets and public files it serves.
COPY --from=base /usr/app/.next/standalone ./
COPY --from=base /usr/app/.next/static ./.next/static
COPY ./public ./public

# Prisma bits the trace doesn't include but the app needs at runtime:
# the generated client + query engine (for queries) and the CLI + engines
# (for `migrate deploy` on startup), plus the schema and migrations.
COPY --from=base /usr/app/prisma ./prisma
COPY --from=base /usr/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /usr/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=base /usr/app/node_modules/prisma ./node_modules/prisma

COPY ./scripts ./scripts

ENTRYPOINT ["/bin/sh", "/usr/app/scripts/container-entrypoint.sh"]
