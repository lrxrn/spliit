import { getGroupExpenses } from '@/lib/api'
import { getSpendingByCategory } from '@/lib/totals'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getStatsByCategoryProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
    }),
  )
  .query(async ({ input: { groupId } }) => {
    const expenses = await getGroupExpenses(groupId)
    return { categories: getSpendingByCategory(expenses) }
  })
