'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

function ResetPasswordConfirmContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState('')

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Ungültiger oder fehlender Reset-Link. Bitte fordere einen neuen Link an.')
    }
  }, [token])

  // Calculate password strength
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0)
      setPasswordStrengthLabel('')
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 15
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20

    setPasswordStrength(strength)

    if (strength < 40) setPasswordStrengthLabel('Schwach')
    else if (strength < 70) setPasswordStrengthLabel('Mittel')
    else setPasswordStrengthLabel('Stark')
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein')
      return
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein')
      return
    }

    if (!token) {
      setError('Ungültiger Reset-Link')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ein Fehler ist aufgetreten. Der Link ist möglicherweise abgelaufen.')
        setIsLoading(false)
        return
      }

      // Show success and redirect after 3 seconds
      setIsSuccess(true)
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)

    } catch (err) {
      setError('Keine Verbindung zum Server. Bitte prüfe deine Internet-Verbindung.')
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-destructive'
    if (passwordStrength < 70) return 'bg-yellow-500'
    return 'bg-accent'
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/hofzeit_logo_512x512.png"
              alt="HofZeit Logo"
              width={120}
              height={120}
              priority
              className="drop-shadow-md"
            />
          </div>

          {/* Success Card */}
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-accent/10 p-3">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Passwort geändert!</CardTitle>
              <CardDescription className="text-center">
                Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt einloggen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Du wirst in <span className="font-semibold text-foreground">3 Sekunden</span> zur Login-Seite weitergeleitet...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/hofzeit_logo_512x512.png"
            alt="HofZeit Logo"
            width={120}
            height={120}
            priority
            className="drop-shadow-md"
          />
        </div>

        {/* New Password Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Neues Passwort setzen</CardTitle>
            <CardDescription className="text-center">
              Wähle ein sicheres Passwort für deinen Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mindestens 8 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || !token}
                    className="pr-10"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading || !token}
                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Passwort-Stärke:</span>
                      <span className={`font-medium ${
                        passwordStrength < 40 ? 'text-destructive' :
                        passwordStrength < 70 ? 'text-yellow-600' :
                        'text-accent'
                      }`}>
                        {passwordStrengthLabel}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort wiederholen</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Passwort erneut eingeben"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading || !token}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading || !token}
                    aria-label={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Passwörter stimmen nicht überein
                  </p>
                )}
                {confirmPassword.length > 0 && password === confirmPassword && password.length >= 8 && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Passwörter stimmen überein
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium mb-2">Passwort-Anforderungen:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    {password.length >= 8 ? (
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                    )}
                    Mindestens 8 Zeichen
                  </li>
                  <li className="flex items-center gap-2">
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) ? (
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                    )}
                    Groß- und Kleinbuchstaben
                  </li>
                  <li className="flex items-center gap-2">
                    {/[0-9]/.test(password) ? (
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                    )}
                    Mindestens eine Zahl
                  </li>
                  <li className="flex items-center gap-2">
                    {/[^a-zA-Z0-9]/.test(password) ? (
                      <CheckCircle2 className="h-3 w-3 text-accent" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                    )}
                    Sonderzeichen empfohlen
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !token || password.length < 8 || password !== confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Passwort wird geändert...
                  </>
                ) : (
                  'Passwort ändern'
                )}
              </Button>

              {/* Back to Reset */}
              {!token && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/reset-password">
                    Neuen Link anfordern
                  </Link>
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          HofZeit Zeiterfassung © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordConfirmContent />
    </Suspense>
  )
}
