import { effectiveBaseUrl } from '@/lib/env'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/groups/',
    },
    sitemap: `${effectiveBaseUrl}/sitemap.xml`,
  }
}
