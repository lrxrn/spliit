'use server'

import { env } from './env'

const parseFlag = (val: string | undefined) =>
  ['true', 'yes', '1', 'on'].includes((val ?? '').toLowerCase())

export async function getRuntimeFeatureFlags() {
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
