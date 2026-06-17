'use client'
import { authClient } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'email' | 'otp'

export default function SignInPage() {
  const t = useTranslations('Auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/groups'

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signInWithMicrosoft() {
    setLoadingMicrosoft(true)
    setError(null)
    try {
      await authClient.signIn.social({ provider: 'microsoft', callbackURL: callbackUrl })
    } catch {
      setError(t('errorMicrosoft'))
      setLoadingMicrosoft(false)
    }
  }

  async function sendCode() {
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    })
    setLoading(false)
    if (error) {
      setError(error.message ?? t('errorSending'))
    } else {
      setStep('otp')
    }
  }

  async function verifyCode() {
    if (!otp) return
    setLoading(true)
    setError(null)
    const { error } = await authClient.signIn.emailOtp({ email, otp })
    setLoading(false)
    if (error) {
      setError(error.message ?? t('errorVerifying'))
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('signIn')}</CardTitle>
          <CardDescription>
            {step === 'email' ? t('enterEmail') : t('enterCode')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 'email' ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={sendCode} disabled={loading || !email}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('sendCode')}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('orContinueWith')}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={signInWithMicrosoft}
                disabled={loadingMicrosoft || loading}
              >
                {loadingMicrosoft ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MicrosoftIcon className="mr-2 h-4 w-4" />
                )}
                {t('signInWithMicrosoft')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t('codeSentTo', { email })}
              </p>
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">{t('codeLabel')}</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={verifyCode} disabled={loading || otp.length < 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('verify')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError(null)
                }}
              >
                {t('changeEmail')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
