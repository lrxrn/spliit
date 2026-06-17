import { assertGroupEditAccess, deleteExpense } from '@/lib/api'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const deleteGroupExpenseProcedure = protectedProcedure
  .input(
    z.object({
      expenseId: z.string().min(1),
      groupId: z.string().min(1),
      participantId: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input: { expenseId, groupId, participantId } }) => {
    await assertGroupEditAccess(groupId, ctx.userId)
    await deleteExpense(groupId, expenseId, participantId, ctx.userId)
    return {}
  })
