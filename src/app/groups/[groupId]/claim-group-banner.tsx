'use client'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { trpc } from '@/trpc/client'
import { ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCurrentGroup } from './current-group-context'

export function ClaimGroupBanner() {
  const { group } = useCurrentGroup()
  const { data: session } = useSession()
  const t = useTranslations('Groups.ClaimBanner')
  const utils = trpc.useUtils()

  const { mutate: claimGroup, isPending } = trpc.groups.claim.useMutation({
    onSuccess() {
      utils.groups.get.invalidate()
    },
  })

  if (!group || group.ownerId !== null || !session?.user) return null

  return (
    <div className="mx-4 mt-2 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>{t('description')}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-amber-300 bg-amber-100 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900"
        disabled={isPending}
        onClick={() => claimGroup({ groupId: group.id })}
      >
        {t('button')}
      </Button>
    </div>
  )
}
