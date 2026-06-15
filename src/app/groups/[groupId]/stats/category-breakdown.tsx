'use client'
import { useCurrentGroup } from '@/app/groups/[groupId]/current-group-context'
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CategorySpending } from '@/lib/totals'
import { formatCurrency, getCurrencyFromGroup } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { useLocale, useTranslations } from 'next-intl'

export function CategoryBreakdown() {
  const { groupId, group } = useCurrentGroup()
  const t = useTranslations('Stats.ByCategory')
  const { data } = trpc.groups.stats.byCategory.useQuery({ groupId })

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!data || !group ? (
          <div className="flex flex-col gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : data.categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <CategoryBars
            categories={data.categories}
            currency={getCurrencyFromGroup(group)}
          />
        )}
      </CardContent>
    </Card>
  )
}

function CategoryBars({
  categories,
  currency,
}: {
  categories: CategorySpending[]
  currency: ReturnType<typeof getCurrencyFromGroup>
}) {
  const locale = useLocale()
  const t = useTranslations('Categories')
  const total = categories.reduce((sum, category) => sum + category.total, 0)
  const max = Math.max(...categories.map((category) => category.total))

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category, index) => {
        const width = max > 0 ? (category.total / max) * 100 : 0
        const share = total > 0 ? Math.round((category.total / total) * 100) : 0
        return (
          <div key={category.categoryId} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <CategoryIcon
                  category={{
                    id: category.categoryId,
                    grouping: category.grouping,
                    name: category.name,
                  }}
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                />
                <span className="truncate">
                  {t(`${category.grouping}.${category.name}`)}
                </span>
              </div>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatCurrency(currency, category.total, locale)} ({share}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
