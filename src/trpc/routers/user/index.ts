import { prisma } from '@/lib/prisma'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { z } from 'zod'

const groupPreferenceInput = z.object({
  groupId: z.string().min(1),
  isRecent: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  visitedAt: z.string().datetime().optional(),
})

export const userRouter = createTRPCRouter({
  preferences: createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
      return prisma.userGroupPreference.findMany({
        where: { userId: ctx.userId },
        include: { group: { select: { id: true, name: true } } },
        orderBy: { visitedAt: 'desc' },
      })
    }),

    sync: protectedProcedure
      .input(z.object({ groups: z.array(groupPreferenceInput) }))
      .mutation(async ({ ctx, input }) => {
        await prisma.$transaction(
          input.groups.map((g) =>
            prisma.userGroupPreference.upsert({
              where: {
                userId_groupId: { userId: ctx.userId, groupId: g.groupId },
              },
              update: {
                ...(g.isRecent !== undefined && { isRecent: g.isRecent }),
                ...(g.isStarred !== undefined && { isStarred: g.isStarred }),
                ...(g.isArchived !== undefined && { isArchived: g.isArchived }),
                ...(g.visitedAt !== undefined && {
                  visitedAt: new Date(g.visitedAt),
                }),
              },
              create: {
                userId: ctx.userId,
                groupId: g.groupId,
                isRecent: g.isRecent ?? false,
                isStarred: g.isStarred ?? false,
                isArchived: g.isArchived ?? false,
                visitedAt: g.visitedAt ? new Date(g.visitedAt) : new Date(),
              },
            }),
          ),
        )
      }),
  }),
})
