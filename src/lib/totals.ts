import { getGroupExpenses } from '@/lib/api'

export function getTotalGroupSpending(
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): number {
  return expenses.reduce(
    (total, expense) =>
      expense.isReimbursement ? total : total + expense.amount,
    0,
  )
}

export function getTotalActiveUserPaidFor(
  activeUserId: string | null,
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): number {
  return expenses.reduce(
    (total, expense) =>
      expense.paidBy.id === activeUserId && !expense.isReimbursement
        ? total + expense.amount
        : total,
    0,
  )
}

type Expense = NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>[number]

export function calculateShare(
  participantId: string | null,
  expense: Pick<
    Expense,
    'amount' | 'paidFor' | 'splitMode' | 'isReimbursement'
  >,
): number {
  if (expense.isReimbursement) return 0

  const paidFors = expense.paidFor
  const userPaidFor = paidFors.find(
    (paidFor) => paidFor.participant.id === participantId,
  )

  if (!userPaidFor) return 0

  const shares = Number(userPaidFor.shares)

  switch (expense.splitMode) {
    case 'EVENLY':
      // Divide the total expense evenly among all participants
      return expense.amount / paidFors.length
    case 'BY_AMOUNT':
      // Directly add the user's share if the split mode is BY_AMOUNT
      return shares
    case 'BY_PERCENTAGE':
      // Calculate the user's share based on their percentage of the total expense
      return (expense.amount * shares) / 10000 // Assuming shares are out of 10000 for percentage
    case 'BY_SHARES':
      // Calculate the user's share based on their shares relative to the total shares
      const totalShares = paidFors.reduce(
        (sum, paidFor) => sum + Number(paidFor.shares),
        0,
      )
      return (expense.amount * shares) / totalShares
    default:
      return 0
  }
}

export function getTotalActiveUserShare(
  activeUserId: string | null,
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): number {
  const total = expenses.reduce(
    (sum, expense) => sum + calculateShare(activeUserId, expense),
    0,
  )

  return parseFloat(total.toFixed(2))
}

export type CategorySpending = {
  categoryId: number
  grouping: string
  name: string
  total: number
}

/**
 * Aggregates total spending by category (issue #82). Reimbursements are
 * excluded, mirroring the other spending totals. Categories with a net total
 * of zero are dropped and the result is sorted from highest to lowest spend.
 */
export function getSpendingByCategory(
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): CategorySpending[] {
  const byCategory = new Map<number, CategorySpending>()

  for (const expense of expenses) {
    if (expense.isReimbursement) continue

    const category = expense.category
    const categoryId = category?.id ?? 0
    const existing = byCategory.get(categoryId)
    if (existing) {
      existing.total += expense.amount
    } else {
      byCategory.set(categoryId, {
        categoryId,
        grouping: category?.grouping ?? 'Uncategorized',
        name: category?.name ?? 'General',
        total: expense.amount,
      })
    }
  }

  return [...byCategory.values()]
    .filter((category) => category.total !== 0)
    .sort((a, b) => b.total - a.total)
}

export type ParticipantSpending = {
  participantId: string
  name: string
  paid: number
  share: number
}

/**
 * Computes, for every participant, how much they paid and what their share of
 * the group's expenses is (issue #496). Sorted by amount paid, descending.
 */
export function getSpendingByParticipant(
  participants: { id: string; name: string }[],
  expenses: NonNullable<Awaited<ReturnType<typeof getGroupExpenses>>>,
): ParticipantSpending[] {
  return participants
    .map((participant) => ({
      participantId: participant.id,
      name: participant.name,
      paid: getTotalActiveUserPaidFor(participant.id, expenses),
      share: getTotalActiveUserShare(participant.id, expenses),
    }))
    .sort((a, b) => b.paid - a.paid)
}

export type RecurrencePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export type RecurringPeriodStats = {
  period: RecurrencePeriod
  count: number
  total: number
}

export type RecurringSpending = {
  count: number
  byPeriod: RecurringPeriodStats[]
  estimatedMonthly: number
  estimatedYearly: number
}

// How many times each recurrence period occurs within an average month, used
// to normalize recurring spending to a comparable monthly figure. Based on the
// average month length of 365.25 / 12 days.
const MONTHLY_EQUIVALENT_FACTOR: Record<RecurrencePeriod, number> = {
  DAILY: 365.25 / 12,
  WEEKLY: 365.25 / 12 / 7,
  MONTHLY: 1,
}

const RECURRENCE_PERIODS: RecurrencePeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY']

/**
 * Summarizes the active recurring expenses of a group (issue #508). Each active
 * recurring expense is counted once per period and normalized into an estimated
 * monthly and yearly cost so the stats page can act as a basic subscription
 * tracker.
 */
export function getRecurringSpending(
  expenses: {
    amount: number
    recurrenceRule: string | null
    isReimbursement: boolean
  }[],
): RecurringSpending {
  const byPeriod = RECURRENCE_PERIODS.map((period) => {
    const matching = expenses.filter(
      (expense) =>
        !expense.isReimbursement && expense.recurrenceRule === period,
    )
    return {
      period,
      count: matching.length,
      total: matching.reduce((sum, expense) => sum + expense.amount, 0),
    }
  })

  const estimatedMonthly = Math.round(
    byPeriod.reduce(
      (sum, { period, total }) =>
        sum + total * MONTHLY_EQUIVALENT_FACTOR[period],
      0,
    ),
  )

  return {
    count: byPeriod.reduce((sum, { count }) => sum + count, 0),
    byPeriod: byPeriod.filter(({ count }) => count > 0),
    estimatedMonthly,
    estimatedYearly: estimatedMonthly * 12,
  }
}
