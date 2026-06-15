'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Currency } from '@/lib/currency'
import { MonthlySpending } from '@/lib/totals'
import { formatCurrency } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'

type Props = {
  months?: MonthlySpending[]
  currency?: Currency
}

export function SpendingOverTime({ months, currency }: Props) {
  const t = useTranslations('Stats.OverTime')

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!months || !currency ? (
          <div className="flex flex-col gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : months.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <MonthlyBars months={months} currency={currency} />
        )}
      </CardContent>
    </Card>
  )
}

function MonthlyBars({
  months,
  currency,
}: {
  months: MonthlySpending[]
  currency: Currency
}) {
  const locale = useLocale()
  const max = Math.max(...months.map((month) => month.total))
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className="flex flex-col gap-4">
      {months.map((month) => {
        const width = max > 0 ? (month.total / max) * 100 : 0
        return (
          <div key={month.month} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="capitalize">
                {monthFormat.format(new Date(`${month.month}-01T00:00:00Z`))}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatCurrency(currency, month.total, locale)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: 'hsl(var(--chart-1))',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
