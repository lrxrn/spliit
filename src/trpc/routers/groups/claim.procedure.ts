import { getGroup } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { protectedProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const claimGroupProcedure = protectedProcedure
  .input(z.object({ groupId: z.string().min(1) }))
  .mutation(async ({ ctx, input: { groupId } }) => {
    const group = await getGroup(groupId)
    if (!group) throw new TRPCError({ code: 'NOT_FOUND' })
    if (group.ownerId !== null)
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Group already has an owner',
      })
    await prisma.group.update({
      where: { id: groupId },
      data: { ownerId: ctx.userId },
    })
  })
