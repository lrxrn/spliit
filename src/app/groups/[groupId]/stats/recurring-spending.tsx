'use client'
import { useCurrentGroup } from '@/app/groups/[groupId]/current-group-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RecurringSpending } from '@/lib/totals'
import { formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useLocale, useTranslations } from 'next-intl'

export function RecurringSpendingStats() {
  const { groupId, group } = useCurrentGroup()
  const t = useTranslations('Stats.Recurring')
  const { data } = trpc.groups.stats.recurring.useQuery({ groupId })

  // Keep the stats page uncluttered for groups that have no recurring
  // expenses: only render the card once we know there is something to show.
  if (data && data.count === 0) return null

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || !group ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <RecurringSummary
            stats={data}
            currency={getCurrencyFromGroup(group)}
          />
        )}
      </CardContent>
    </Card>
  )
}

function RecurringSummary({
  stats,
  currency,
}: {
  stats: RecurringSpending
  currency: ReturnType<typeof getCurrencyFromGroup>
}) {
  const locale = useLocale()
  const t = useTranslations('Stats.Recurring')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-muted-foreground">{t('estimatedMonthly')}</div>
        <div className="text-lg">
          {formatCurrency(currency, stats.estimatedMonthly, locale)}
        </div>
        <div className="text-sm text-muted-foreground">
          {t('estimatedYearly', {
            amount: formatCurrency(currency, stats.estimatedYearly, locale),
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {stats.byPeriod.map((period) => (
          <div
            key={period.period}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="text-muted-foreground">
              {t(`period.${period.period}`, { count: period.count })}
            </span>
            <span className="tabular-nums">
              {formatCurrency(currency, period.total, locale)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
