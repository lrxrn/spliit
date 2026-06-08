'use server'

import { connection } from 'next/server'
import { env } from './env'

export async function getRuntimeFeatureFlags() {
  // Opt out of static prerendering so the flags reflect the *runtime*
  // environment. Without this, Next.js may evaluate these at build time
  // (when the vars are unset) and bake the result into the static page,
  // making runtime env vars in a prebuilt image have no effect.
  await connection()
  return {
    enableExpenseDocuments: env.NEXT_PUBLIC_ENABLE_EXPENSE_DOCUMENTS,
    enableReceiptExtract: env.NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT,
    enableCategoryExtract: env.NEXT_PUBLIC_ENABLE_CATEGORY_EXTRACT,
  }
}

export type RuntimeFeatureFlags = Awaited<
  ReturnType<typeof getRuntimeFeatureFlags>
>
