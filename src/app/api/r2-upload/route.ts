import { getSession } from '@/lib/auth'
import { env } from '@/lib/env'
import { randomId } from '@/lib/random'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await getSession(await headers())
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { filename, contentType } = (await req.json()) as {
    filename: string
    contentType: string
  }
  const [, extension] = (filename ?? '').match(/(\.[^.]*)$/) ?? [null, '']
  const key = `document-${new Date().toISOString()}-${randomId()}${extension.toLowerCase()}`

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  })

  const presignedUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 3600 },
  )

  const publicUrl = `${env.R2_PUBLIC_URL}/${key}`
  return Response.json({ presignedUrl, publicUrl })
}
