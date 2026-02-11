'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // TODO: Implement actual password reset request with API call
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })

      // Simulate API call
      console.log('Password reset requested for:', email)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Show success message (same message regardless if user exists - security)
      setIsSuccess(true)

    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    } finally {
      setIsLoading(false)
    }
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
                  <Mail className="h-8 w-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">E-Mail versendet</CardTitle>
              <CardDescription className="text-center">
                Falls ein Account mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen geschickt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Nächste Schritte:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Überprüfe dein E-Mail-Postfach</li>
                  <li>Klicke auf den Link in der E-Mail</li>
                  <li>Der Link ist 1 Stunde gültig</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Keine E-Mail erhalten? Überprüfe deinen Spam-Ordner.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zum Login
                </Link>
              </Button>
            </CardFooter>
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

        {/* Reset Password Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Passwort zurücksetzen</CardTitle>
            <CardDescription className="text-center">
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Link wird gesendet...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Link senden
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Zurück zum Login
            </Link>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          HofZeit Zeiterfassung © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
