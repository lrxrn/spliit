import GroupExpensesPageClient from '@/app/groups/[groupId]/expenses/page.client'
import { env } from '@/lib/env'
import { Metadata } from 'next'

// Render at request time so the feature flag reflects the *runtime* env.
// NEXT_PUBLIC_* vars are inlined at build time and can't be toggled in a
// prebuilt image; the non-public ENABLE_RECEIPT_EXTRACT can.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Expenses',
}

export default async function GroupExpensesPage() {
  return (
    <GroupExpensesPageClient
      enableReceiptExtract={
        env.ENABLE_RECEIPT_EXTRACT || env.NEXT_PUBLIC_ENABLE_RECEIPT_EXTRACT
      }
    />
  )
}
