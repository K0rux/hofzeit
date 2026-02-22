'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Set cookie before creating client so it picks up the storage preference
      if (rememberMe) {
        document.cookie = 'hofzeit_remember_me=true; max-age=2592000; path=/; SameSite=Lax; Secure'
      } else {
        document.cookie = 'hofzeit_remember_me=; max-age=0; path=/'
      }

      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('E-Mail oder Passwort ist falsch.')
        return
      }

      if (data.session) {
        // Use window.location.href to avoid redirect loops in PWA
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Hofzeit</CardTitle>
        <CardDescription>Zeiterfassung Bauhof</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@gemeinde.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
              Eingeloggt bleiben (30 Tage)
            </Label>
          </div>

          {error && (
            <p id="login-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
            {loading ? 'Anmelden...' : 'Anmelden'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Passwort vergessen? Wenden Sie sich an Ihren Administrator.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
