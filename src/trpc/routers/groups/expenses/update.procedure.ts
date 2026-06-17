import { assertGroupEditAccess, updateExpense } from '@/lib/api'
import { expenseFormSchema } from '@/lib/schemas'
import { protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

export const updateGroupExpenseProcedure = protectedProcedure
  .input(
    z.object({
      expenseId: z.string().min(1),
      groupId: z.string().min(1),
      expenseFormValues: expenseFormSchema,
      participantId: z.string().optional(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input: { expenseId, groupId, expenseFormValues, participantId },
    }) => {
      await assertGroupEditAccess(groupId, ctx.userId)
      const expense = await updateExpense(
        groupId,
        expenseId,
        expenseFormValues,
        participantId,
        ctx.userId,
      )
      return { expenseId: expense.id }
    },
  )
