'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Zeiteintrag } from './types'
import { formatDauerDE } from './types'

interface ZeiteintragKarteProps {
  eintrag: Zeiteintrag
  onEdit: (eintrag: Zeiteintrag) => void
  onDelete: (eintrag: Zeiteintrag) => void
  readonly?: boolean
}

export function ZeiteintragKarte({ eintrag, onEdit, onDelete, readonly }: ZeiteintragKarteProps) {
  const taetigkeitLabel = eintrag.taetigkeit_name ?? eintrag.taetigkeit_freitext ?? '–'
  const isFreitext = !eintrag.taetigkeit_id

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{taetigkeitLabel}</span>
              {isFreitext && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                  einmalig
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="truncate">{eintrag.kostenstelle_name}</span>
              <span className="shrink-0 font-medium text-foreground">
                {formatDauerDE(eintrag.dauer_stunden)}
              </span>
            </div>
          </div>
          {!readonly && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px]"
                onClick={() => onEdit(eintrag)}
                aria-label="Bearbeiten"
              >
                Bearbeiten
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                onClick={() => onDelete(eintrag)}
                aria-label="Löschen"
              >
                Löschen
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
