import { getGroup, getGroupExpenses } from '@/lib/api'
import { getSpendingByParticipant } from '@/lib/totals'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getStatsByParticipantProcedure = baseProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
    }),
  )
  .query(async ({ input: { groupId } }) => {
    const group = await getGroup(groupId)
    if (!group) return { participants: [] }

    const expenses = await getGroupExpenses(groupId)
    return {
      participants: getSpendingByParticipant(group.participants, expenses),
    }
  })
