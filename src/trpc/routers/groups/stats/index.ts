import { createTRPCRouter } from '@/trpc/init'
import { getStatsByCategoryProcedure } from '@/trpc/routers/groups/stats/byCategory.procedure'
import { getStatsByParticipantProcedure } from '@/trpc/routers/groups/stats/byParticipant.procedure'
import { getGroupStatsProcedure } from '@/trpc/routers/groups/stats/get.procedure'
import { getRecurringStatsProcedure } from '@/trpc/routers/groups/stats/recurring.procedure'

export const groupStatsRouter = createTRPCRouter({
  get: getGroupStatsProcedure,
  byCategory: getStatsByCategoryProcedure,
  byParticipant: getStatsByParticipantProcedure,
  recurring: getRecurringStatsProcedure,
})
