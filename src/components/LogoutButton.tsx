'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Hard redirect to login page after logout
        window.location.href = '/login'
      } else {
        console.error('Logout failed')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Wird abgemeldet...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </>
      )}
    </Button>
  )
}
