'use client'
import { CategoryBreakdown } from '@/app/groups/[groupId]/stats/category-breakdown'
import { ParticipantSpendingStats } from '@/app/groups/[groupId]/stats/participant-spending'
import { RecurringSpendingStats } from '@/app/groups/[groupId]/stats/recurring-spending'
import { SpendingOverTime } from '@/app/groups/[groupId]/stats/spending-over-time'
import {
  getRangeForPeriod,
  StatsPeriod,
} from '@/app/groups/[groupId]/stats/stats-range'
import { StatsRangeSelector } from '@/app/groups/[groupId]/stats/stats-range-selector'
import { SummaryStats } from '@/app/groups/[groupId]/stats/summary-stats'
import { Totals } from '@/app/groups/[groupId]/stats/totals'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function TotalsPageClient() {
  const t = useTranslations('Stats')
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const range = getRangeForPeriod(period)

  return (
    <>
      <StatsRangeSelector period={period} onPeriodChange={setPeriod} />
      <SummaryStats range={range} />
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('Totals.title')}</CardTitle>
          <CardDescription>{t('Totals.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Totals range={range} />
        </CardContent>
      </Card>
      <SpendingOverTime range={range} />
      <ParticipantSpendingStats range={range} />
      <CategoryBreakdown range={range} />
      <RecurringSpendingStats />
    </>
  )
}
