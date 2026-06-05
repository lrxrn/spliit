‘use server’
import { getCategories } from ‘@/lib/api’
import { env } from ‘@/lib/env’
import { formatCategoryForAIPrompt } from ‘@/lib/utils’
import OpenAI from ‘openai’

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  baseURL: env.OPENAI_BASE_URL,
})

export async function extractExpenseInformationFromImage(imageUrl: string) {
  ‘use server’
  const categories = await getCategories()

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL_RECEIPT_EXTRACT,
    response_format: {
      type: ‘json_schema’,
      json_schema: {
        name: ‘receipt_response’,
        strict: true,
        schema: {
          type: ‘object’,
          properties: {
            amount: { type: ‘number’ },
            categoryId: { type: ‘string’ },
            date: { type: ‘string’ },
            title: { type: ‘string’ },
          },
          required: [‘amount’, ‘categoryId’, ‘date’, ‘title’],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: ‘user’,
        content: [
          {
            type: ‘text’,
            text: `
              This image contains a receipt.
              Read the total amount as a plain number without currency symbols.
              Guess the category ID from this list: ${categories.map(
                (category) => formatCategoryForAIPrompt(category),
              )}.
              Guess the expense’s date in yyyy-mm-dd format.
              Guess a short title for the expense.
              Return a JSON object with fields: amount (number), categoryId (string), date (string), title (string).`,
          },
        ],
      },
      {
        role: ‘user’,
        content: [{ type: ‘image_url’, image_url: { url: imageUrl } }],
      },
    ],
  })

  const messageContent = completion.choices.at(0)?.message.content
  const parsed = messageContent ? JSON.parse(messageContent) : {}
  return {
    amount: Number(parsed.amount),
    categoryId: parsed.categoryId ?? null,
    date: parsed.date ?? null,
    title: parsed.title ?? null,
  }
}

export type ReceiptExtractedInfo = Awaited<
  ReturnType<typeof extractExpenseInformationFromImage>
>
