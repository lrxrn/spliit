import { Button } from '@/components/ui/button'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Activity, Link2, SplitSquareVertical } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function HomePage() {
  const t = await getTranslations()

  const title = process.env.LANDING_TITLE ?? null
  const description = process.env.LANDING_DESCRIPTION ?? null
  const cta = process.env.LANDING_CTA ?? null

  return (
    <main>
      {/* Hero */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container flex max-w-screen-md flex-col items-center gap-6 text-center">
          <h1 className="!leading-none font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl landing-header py-2">
            {title ? (
              title
            ) : (
              t.rich('Homepage.title', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })
            )}
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            {description ? (
              description
            ) : (
              t.rich('Homepage.description', {
                strong: (chunks) => <strong>{chunks}</strong>,
              })
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/groups">
                {cta ?? t('Homepage.button.groups')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">{t('Homepage.button.signIn')}</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="https://github.com/spliit-app/spliit">
                <GitHubLogoIcon className="w-4 h-4 mr-2" />
                {t('Homepage.button.github')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-slate-50 dark:bg-card border-y">
        <div className="container max-w-screen-md">
          <h2 className="text-2xl font-bold text-center mb-8">
            {t('Homepage.features.title')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center gap-3 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{t('Homepage.features.noAccount.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Homepage.features.noAccount.description')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <SplitSquareVertical className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{t('Homepage.features.splitting.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Homepage.features.splitting.description')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{t('Homepage.features.tracking.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Homepage.features.tracking.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <div className="container max-w-screen-md">
          <h2 className="text-2xl font-bold text-center mb-8">
            {t('Homepage.howItWorks.title')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {(['step1', 'step2', 'step3'] as const).map((step, i) => (
              <div key={step} className="flex flex-col items-center text-center gap-2 p-4">
                <div className="rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{t(`Homepage.howItWorks.${step}.title`)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(`Homepage.howItWorks.${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
