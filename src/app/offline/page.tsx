'use client'

import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <WifiOff className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Keine Internetverbindung</h1>
        <p className="text-muted-foreground">
          Bitte stellen Sie eine Verbindung zum Internet her und versuchen Sie es erneut.
        </p>
        <Button onClick={() => window.location.reload()}>
          Erneut versuchen
        </Button>
      </div>
    </div>
  )
}
