import { getGroupExpenses } from '@/lib/api'
import { filterExpensesByDateRange, getSpendingSummary } from '@/lib/totals'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getStatsSummaryProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  )
  .query(async ({ input: { groupId, from, to } }) => {
    const expenses = filterExpensesByDateRange(
      await getGroupExpenses(groupId),
      from,
      to,
    )
    return getSpendingSummary(expenses)
  })
