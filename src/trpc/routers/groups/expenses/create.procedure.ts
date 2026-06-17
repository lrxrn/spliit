import { assertGroupEditAccess, createExpense } from '@/lib/api'
import { expenseFormSchema } from '@/lib/schemas'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const createGroupExpenseProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(
    async ({ ctx, input: { groupId, expenseFormValues, participantId } }) => {
      await assertGroupEditAccess(groupId, ctx.userId)
      const expense = await createExpense(
        expenseFormValues,
        groupId,
        participantId,
        ctx.userId,
      )
      return { expenseId: expense.id }
    },
  )
