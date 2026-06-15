import { getGroup, getGroupExpenses } from '@/lib/api'
import {
  filterExpensesByDateRange,
  getSpendingByParticipant,
} from '@/lib/totals'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getStatsByParticipantProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  )
  .query(async ({ input: { groupId, from, to } }) => {
    const group = await getGroup(groupId)
    if (!group) return { participants: [] }

    const expenses = filterExpensesByDateRange(
      await getGroupExpenses(groupId),
      from,
      to,
    )
    return {
      participants: getSpendingByParticipant(group.participants, expenses),
    }
  })
