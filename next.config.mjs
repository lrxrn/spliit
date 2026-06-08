import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/**
 * Undefined entries are not supported. Push optional patterns to this array only if defined.
 * @type {import('next/dist/shared/lib/image-config').RemotePattern}
 */
const remotePatterns = []

// S3 Storage
if (process.env.S3_UPLOAD_ENDPOINT) {
  // custom endpoint for providers other than AWS
  const url = new URL(process.env.S3_UPLOAD_ENDPOINT);
  remotePatterns.push({
    hostname: url.hostname,
  })
} else if (process.env.S3_UPLOAD_BUCKET && process.env.S3_UPLOAD_REGION) {
  // default provider
  remotePatterns.push({
    hostname: `${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`,
  })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server (.next/standalone) with only the traced
  // production files, so the runtime image stays small.
  output: 'standalone',
  images: {
    remotePatterns
  },
  experimental: {
    serverActions: {
      // Allow server actions from the configured base URL and localhost.
      // NEXT_PUBLIC_BASE_URL covers custom domains / IPs used to access the
      // container; localhost:3000 covers local dev and same-host access.
      allowedOrigins: [
        'localhost:3000',
        ...(process.env.NEXT_PUBLIC_BASE_URL
          ? [new URL(process.env.NEXT_PUBLIC_BASE_URL).host]
          : []),
      ],
    },
  },
}

export default withNextIntl(nextConfig)
