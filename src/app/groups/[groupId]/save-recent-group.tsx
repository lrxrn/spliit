'use client'
import { saveRecentGroup } from '@/app/groups/recent-groups-helpers'
import { useSession } from '@/lib/auth-client'
import { trpc } from '@/trpc/client'
import { useEffect } from 'react'
import { useCurrentGroup } from './current-group-context'

export function SaveGroupLocally() {
  const { group } = useCurrentGroup()
  const { data: session } = useSession()
  const { mutate: syncPreference } = trpc.user.preferences.sync.useMutation()

  useEffect(() => {
    if (!group) return
    saveRecentGroup({ id: group.id, name: group.name })
    if (session?.user) {
      syncPreference({
        groups: [
          {
            groupId: group.id,
            isRecent: true,
            visitedAt: new Date().toISOString(),
          },
        ],
      })
    }
  }, [group, session])

  return null
}
