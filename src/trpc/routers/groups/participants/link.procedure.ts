import { assertGroupEditAccess } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { protectedProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const linkParticipantProcedure = protectedProcedure
  .input(
    z.object({
      groupId: z.string().min(1),
      participantId: z.string().min(1),
      email: z.string().email().nullable(),
    }),
  )
  .mutation(async ({ ctx, input: { groupId, participantId, email } }) => {
    await assertGroupEditAccess(groupId, ctx.userId)

    let userId: string | null = null
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'No account found for that email' })
      userId = user.id
    }

    await prisma.participant.update({
      where: { id: participantId },
      data: { userId },
    })
  })
