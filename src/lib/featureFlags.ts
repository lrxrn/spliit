'use server'

import { env } from './env'

const parseFlag = (val: string | undefined) =>
  ['true', 'yes', '1', 'on'].includes((val ?? '').toLowerCase())

export async function getRuntimeFeatureFlags() {
  // TEMP DIAGNOSTIC — remove once the runtime-env issue is resolved. Prints what
  // the rendering process actually sees for process.env at request time.
  console.log(
    '[FLAGS_DEBUG]',
    JSON.stringify({
      ENABLE_CATEGORY_EXTRACT: process.env.ENABLE_CATEGORY_EXTRACT ?? null,
      typeofIt: typeof process.env.ENABLE_CATEGORY_EXTRACT,
      keyPresent: 'ENABLE_CATEGORY_EXTRACT' in process.env,
      NEXT_PUBLIC_ENABLE_CATEGORY_EXTRACT:
        process.env.NEXT_PUBLIC_ENABLE_CATEGORY_EXTRACT ?? null,
      OPENAI_API_KEY_present: Boolean(process.env.OPENAI_API_KEY),
      envKeyCount: Object.keys(process.env).length,
      sampleEnableKeys: Object.keys(process.env).filter((k) =>
        k.includes('ENABLE'),
      ),
      nodeEnv: process.env.NODE_ENV,
    }),
  )

  // Read ENABLE_* directly from process.env on every call so the live runtime
  // value is used rather than the module-level snapshot in `env`. Next.js does
  // not inline non-NEXT_PUBLIC_ vars in server bundles, so this is a true
  // runtime read. env.NEXT_PUBLIC_* are baked at build time (correct behaviour:
  // they reflect the build-time flag value for self-built images).
  return {
    enableExpenseDocuments:
      parseFlag(process.env.ENABLE_EXPENSE_DOCUMENTS) ||
      env.NEXT_PUBLIC_ENABLE_EXPENSE_DOCUMENTS,
    enableReceiptExtract:
      parseFlag(process.env.ENABLE_RECEIPT_EXTRACT) ||
      env.NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT,
    enableCategoryExtract:
      parseFlag(process.env.ENABLE_CATEGORY_EXTRACT) ||
      env.NEXT_PUBLIC_ENABLE_CATEGORY_EXTRACT,
  }
}

export type RuntimeFeatureFlags = Awaited<
  ReturnType<typeof getRuntimeFeatureFlags>
>
