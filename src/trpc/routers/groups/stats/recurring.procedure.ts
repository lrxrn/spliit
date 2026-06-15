import { getActiveRecurringExpenses } from '@/lib/api'
import { getRecurringSpending } from '@/lib/totals'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getRecurringStatsProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
    }),
  )
  .query(async ({ input: { groupId } }) => {
    const expenses = await getActiveRecurringExpenses(groupId)
    return getRecurringSpending(expenses)
  })
