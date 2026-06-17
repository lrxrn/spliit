'use client'
import { authClient } from '@/lib/auth-client'
import { LogIn, LogOut, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()
  const t = useTranslations('Header')
  const router = useRouter()

  if (isPending) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
  }

  if (!session?.user) {
    return (
      <Button variant="ghost" size="sm" asChild className="-my-3 text-primary">
        <Link href="/auth/signin">
          <LogIn className="h-4 w-4 mr-1" />
          {t('signIn')}
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={session.user.email ?? 'Account'}
        >
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-medium">
            {session.user.name || t('account')}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {session.user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer"
          onClick={async () => {
            await authClient.signOut()
            router.refresh()
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
