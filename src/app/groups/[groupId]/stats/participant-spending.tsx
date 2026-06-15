'use client'
import { useCurrentGroup } from '@/app/groups/[groupId]/current-group-context'
import { StatsRange } from '@/app/groups/[groupId]/stats/stats-range'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ParticipantSpending } from '@/lib/totals'
import { formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useLocale, useTranslations } from 'next-intl'

export function ParticipantSpendingStats({ range }: { range: StatsRange }) {
  const { groupId, group } = useCurrentGroup()
  const t = useTranslations('Stats.ByParticipant')
  const { data } = trpc.groups.stats.byParticipant.useQuery({
    groupId,
    from: range.from,
    to: range.to,
  })

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || !group ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : data.participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ParticipantTable
            participants={data.participants}
            currency={getCurrencyFromGroup(group)}
          />
        )}
      </CardContent>
    </Card>
  )
}

function ParticipantTable({
  participants,
  currency,
}: {
  participants: ParticipantSpending[]
  currency: ReturnType<typeof getCurrencyFromGroup>
}) {
  const locale = useLocale()
  const t = useTranslations('Stats.ByParticipant')

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 px-2">{t('participant')}</TableHead>
          <TableHead className="h-8 px-2 text-right">{t('paid')}</TableHead>
          <TableHead className="h-8 px-2 text-right">{t('count')}</TableHead>
          <TableHead className="h-8 px-2 text-right">{t('share')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.participantId}>
            <TableCell className="p-2 font-medium">
              {participant.name}
            </TableCell>
            <TableCell className="p-2 text-right tabular-nums">
              {formatCurrency(currency, participant.paid, locale)}
            </TableCell>
            <TableCell className="p-2 text-right tabular-nums text-muted-foreground">
              {participant.paidCount}
            </TableCell>
            <TableCell className="p-2 text-right tabular-nums text-muted-foreground">
              {formatCurrency(currency, participant.share, locale)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
