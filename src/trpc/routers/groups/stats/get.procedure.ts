import { getGroupExpenses } from '@/lib/api'
import {
  filterExpensesByDateRange,
  getTotalActiveUserPaidFor,
  getTotalActiveUserShare,
  getTotalGroupSpending,
} from '@/lib/totals'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getGroupStatsProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      participantId: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  )
  .query(async ({ input: { groupId, participantId, from, to } }) => {
    const expenses = filterExpensesByDateRange(
      await getGroupExpenses(groupId),
      from,
      to,
    )
    const totalGroupSpendings = getTotalGroupSpending(expenses)

    const totalParticipantSpendings =
      participantId !== undefined
        ? getTotalActiveUserPaidFor(participantId, expenses)
        : undefined
    const totalParticipantShare =
      participantId !== undefined
        ? getTotalActiveUserShare(participantId, expenses)
        : undefined

    return {
      totalGroupSpendings,
      totalParticipantSpendings,
      totalParticipantShare,
    }
  })
