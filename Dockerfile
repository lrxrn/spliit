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

RUN rm -r .next/cache

# Derive the production dependencies from the node_modules the base stage
# already installed, instead of running a second `npm ci` over the network.
# Re-downloading prod deps in a separate stage deterministically failed with
# ECONNRESET under emulated arm64; pruning is offline and reliable.
FROM base AS runtime-deps
RUN npm prune --omit=dev --omit=optional --offline

FROM node:21-alpine AS runner

EXPOSE 3000/tcp
WORKDIR /usr/app

COPY --from=base /usr/app/package.json /usr/app/package-lock.json /usr/app/next.config.mjs ./
COPY --from=runtime-deps /usr/app/node_modules ./node_modules
COPY ./public ./public
COPY ./scripts ./scripts
COPY --from=base /usr/app/prisma ./prisma
COPY --from=base /usr/app/.next ./.next

ENTRYPOINT ["/bin/sh", "/usr/app/scripts/container-entrypoint.sh"]
