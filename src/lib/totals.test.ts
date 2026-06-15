import {
  getRecurringSpending,
  getSpendingByCategory,
  getSpendingByParticipant,
} from './totals'

type Expense = Parameters<typeof getSpendingByCategory>[0][number]

function makeExpense(partial: Partial<Expense>): Expense {
  return {
    amount: 0,
    category: null,
    isReimbursement: false,
    splitMode: 'EVENLY',
    paidBy: { id: 'alice', name: 'Alice' },
    paidFor: [],
    ...partial,
  } as unknown as Expense
}

const groceries = { id: 1, grouping: 'Food and Drink', name: 'Groceries' }
const transport = { id: 2, grouping: 'Transportation', name: 'Car' }

describe('getSpendingByCategory', () => {
  it('aggregates by category, ignores reimbursements and sorts by total', () => {
    const result = getSpendingByCategory([
      makeExpense({ amount: 1000, category: groceries }),
      makeExpense({ amount: 500, category: groceries }),
      makeExpense({ amount: 3000, category: transport }),
      makeExpense({ amount: 9999, category: transport, isReimbursement: true }),
    ])

    expect(result).toEqual([
      { categoryId: 2, grouping: 'Transportation', name: 'Car', total: 3000 },
      {
        categoryId: 1,
        grouping: 'Food and Drink',
        name: 'Groceries',
        total: 1500,
      },
    ])
  })

  it('treats a missing category as Uncategorized/General', () => {
    const result = getSpendingByCategory([
      makeExpense({ amount: 200, category: null }),
    ])
    expect(result).toEqual([
      {
        categoryId: 0,
        grouping: 'Uncategorized',
        name: 'General',
        total: 200,
      },
    ])
  })
})

describe('getSpendingByParticipant', () => {
  it('computes paid and share per participant, sorted by amount paid', () => {
    const participants = [
      { id: 'alice', name: 'Alice' },
      { id: 'bob', name: 'Bob' },
    ]
    const expenses = [
      makeExpense({
        amount: 1000,
        paidBy: { id: 'alice', name: 'Alice' },
        paidFor: [
          { participant: { id: 'alice', name: 'Alice' }, shares: 1 },
          { participant: { id: 'bob', name: 'Bob' }, shares: 1 },
        ],
      }),
    ]

    const result = getSpendingByParticipant(participants, expenses)

    expect(result).toEqual([
      { participantId: 'alice', name: 'Alice', paid: 1000, share: 500 },
      { participantId: 'bob', name: 'Bob', paid: 0, share: 500 },
    ])
  })
})

describe('getRecurringSpending', () => {
  it('summarizes active recurring expenses per period', () => {
    const result = getRecurringSpending([
      { amount: 1000, recurrenceRule: 'MONTHLY', isReimbursement: false },
      { amount: 500, recurrenceRule: 'MONTHLY', isReimbursement: false },
      { amount: 700, recurrenceRule: 'WEEKLY', isReimbursement: false },
      { amount: 100, recurrenceRule: 'DAILY', isReimbursement: false },
      { amount: 999, recurrenceRule: 'NONE', isReimbursement: false },
      { amount: 999, recurrenceRule: 'MONTHLY', isReimbursement: true },
    ])

    expect(result.count).toBe(4)
    expect(result.byPeriod).toEqual([
      { period: 'DAILY', count: 1, total: 100 },
      { period: 'WEEKLY', count: 1, total: 700 },
      { period: 'MONTHLY', count: 2, total: 1500 },
    ])
    // 100 * (365.25/12) + 700 * (365.25/12/7) + 1500 = 3044.6875 + 3044.69 -> rounded
    const expectedMonthly = Math.round(
      100 * (365.25 / 12) + 700 * (365.25 / 12 / 7) + 1500,
    )
    expect(result.estimatedMonthly).toBe(expectedMonthly)
    expect(result.estimatedYearly).toBe(expectedMonthly * 12)
  })

  it('returns an empty summary when there are no recurring expenses', () => {
    const result = getRecurringSpending([
      { amount: 1000, recurrenceRule: 'NONE', isReimbursement: false },
    ])
    expect(result.count).toBe(0)
    expect(result.byPeriod).toEqual([])
    expect(result.estimatedMonthly).toBe(0)
    expect(result.estimatedYearly).toBe(0)
  })
})
