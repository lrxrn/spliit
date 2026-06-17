import { ZodIssueCode, z } from 'zod'

const interpretEnvVarAsBool = (val: unknown): boolean => {
  if (typeof val !== 'string') return false
  // .trim() guards against trailing whitespace such as the CR from a CRLF
  // (Windows) .env file, which would otherwise make "true\r" !== "true".
  return ['true', 'yes', '1', 'on'].includes(val.trim().toLowerCase())
}

const envSchema = z
  .object({
    POSTGRES_URL_NON_POOLING: z.string().url(),
    POSTGRES_PRISMA_URL: z.string().url(),
    // Runtime override for the public base URL. Read at server start, so it
    // works in a prebuilt image without a rebuild. Takes precedence over
    // NEXT_PUBLIC_BASE_URL (which is baked at build time).
    BASE_URL: z.string().url().trim().optional(),
    NEXT_PUBLIC_BASE_URL: z
      .string()
      .optional()
      .default(
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000',
      ),
    NEXT_PUBLIC_ENABLE_EXPENSE_DOCUMENTS: z.preprocess(
      interpretEnvVarAsBool,
      z.boolean().default(false),
    ),
    // Runtime (non-public) counterpart. Unlike NEXT_PUBLIC_* vars — which Next.js
    // inlines into the bundle at build time and can therefore never be changed in
    // a prebuilt image — this is read from the environment at runtime, so it can
    // be toggled with `docker run -e ...`. Takes precedence when set.
    ENABLE_EXPENSE_DOCUMENTS: z.preprocess(
      interpretEnvVarAsBool,
      z.boolean().default(false),
    ),
    // Runtime override for the default currency code used when creating a new
    // group. Takes precedence over NEXT_PUBLIC_DEFAULT_CURRENCY_CODE.
    DEFAULT_CURRENCY_CODE: z.string().trim().optional(),
    S3_UPLOAD_KEY: z.string().optional(),
    S3_UPLOAD_SECRET: z.string().optional(),
    S3_UPLOAD_BUCKET: z.string().optional(),
    S3_UPLOAD_REGION: z.string().optional(),
    S3_UPLOAD_ENDPOINT: z.string().optional(),
    STORAGE_PROVIDER: z.enum(['s3', 'r2']).default('s3'),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PUBLIC_URL: z.string().url().optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    LANDING_TITLE: z.string().optional(),
    LANDING_DESCRIPTION: z.string().optional(),
    LANDING_CTA: z.string().optional(),
    NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT: z.preprocess(
      interpretEnvVarAsBool,
      z.boolean().default(false),
    ),
    // Runtime (non-public) counterpart, see ENABLE_EXPENSE_DOCUMENTS above.
    ENABLE_RECEIPT_EXTRACT: z.preprocess(
      interpretEnvVarAsBool,
      z.boolean().default(false),
    ),
    NEXT_PUBLIC_ENABLE_CATEGORY_EXTRACT: z.preprocess(
      interpretEnvVarAsBool,
      z.boolean().default(false),
    ),
    // Runtime (non-public) counterpart, see ENABLE_EXPENSE_DOCUMENTS above.
    ENABLE_CATEGORY_EXTRACT: z.preprocess(
      interpretEnvVarAsBool,
      z.boolean().default(false),
    ),
    // .trim() on these guards against a trailing CR from a CRLF (Windows) .env
    // file: an OPENAI_API_KEY ending in "\r" would otherwise fail auth with 401.
    OPENAI_API_KEY: z.string().trim().optional(),
    OPENAI_BASE_URL: z.string().trim().url().optional(),
    OPENAI_MODEL_CATEGORY_EXTRACT: z
      .string()
      .trim()
      .optional()
      .default('gpt-5.4-nano'),
    OPENAI_MODEL_RECEIPT_EXTRACT: z
      .string()
      .trim()
      .optional()
      .default('gpt-5.4-nano'),
  })
  .superRefine((env, ctx) => {
    const enableExpenseDocuments =
      env.ENABLE_EXPENSE_DOCUMENTS || env.NEXT_PUBLIC_ENABLE_EXPENSE_DOCUMENTS
    const enableReceiptExtract =
      env.ENABLE_RECEIPT_EXTRACT || env.NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT
    const enableCategoryExtract =
      env.ENABLE_CATEGORY_EXTRACT || env.NEXT_PUBLIC_ENABLE_CATEGORY_EXTRACT
    if (enableExpenseDocuments && env.STORAGE_PROVIDER === 'r2') {
      if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: 'If STORAGE_PROVIDER=r2 and ENABLE_EXPENSE_DOCUMENTS is set, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and R2_PUBLIC_URL must be set',
        })
      }
    } else if (
      enableExpenseDocuments &&
      // S3_UPLOAD_ENDPOINT is fully optional as it will only be used for providers other than AWS
      (!env.S3_UPLOAD_BUCKET ||
        !env.S3_UPLOAD_KEY ||
        !env.S3_UPLOAD_REGION ||
        !env.S3_UPLOAD_SECRET)
    ) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message:
          'If ENABLE_EXPENSE_DOCUMENTS is set, S3_UPLOAD_KEY, S3_UPLOAD_SECRET, S3_UPLOAD_BUCKET and S3_UPLOAD_REGION must be set too',
      })
    }
    if (
      (enableReceiptExtract || enableCategoryExtract) &&
      !env.OPENAI_API_KEY
    ) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message:
          'If ENABLE_RECEIPT_EXTRACT or ENABLE_CATEGORY_EXTRACT is set, OPENAI_API_KEY must be set too',
      })
    }
  })

export const env = envSchema.parse(process.env)

// The effective public base URL: runtime BASE_URL takes precedence over the
// build-time-baked NEXT_PUBLIC_BASE_URL, making it possible to configure the
// URL in a prebuilt Docker image without rebuilding.
export const effectiveBaseUrl = env.BASE_URL ?? env.NEXT_PUBLIC_BASE_URL
