import { createTRPCRouter } from '@/trpc/init'
import { linkParticipantProcedure } from './link.procedure'

export const participantsRouter = createTRPCRouter({
  link: linkParticipantProcedure,
})
