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

FROM node:21-alpine AS runtime-deps

WORKDIR /usr/app
COPY --from=base /usr/app/package.json /usr/app/package-lock.json /usr/app/next.config.mjs ./
COPY --from=base /usr/app/prisma ./prisma

# Install production dependencies only, so the runtime image stays small.
RUN ( for i in 1 2 3 4 5; do \
        npm ci --omit=dev --omit=optional --ignore-scripts \
          --fetch-retries=5 --fetch-timeout=600000 && exit 0; \
        echo "npm ci failed (attempt $i), retrying in 10s..."; sleep 10; \
      done; exit 1 ) && \
    npx prisma generate

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
