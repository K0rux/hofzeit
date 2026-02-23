'use client'

import { Badge } from '@/components/ui/badge'
import type { Abwesenheit } from './types'
import { typLabel } from './types'

interface AbwesenheitBannerProps {
  abwesenheiten: Abwesenheit[]
}

export function AbwesenheitBanner({ abwesenheiten }: AbwesenheitBannerProps) {
  if (abwesenheiten.length === 0) return null

  return (
    <div className="space-y-2">
      {abwesenheiten.map((a) => (
        <div
          key={a.id}
          className={
            a.typ === 'urlaub'
              ? 'rounded-md bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2'
              : 'rounded-md bg-red-50 border border-red-200 p-3 flex items-center gap-2'
          }
        >
          <Badge
            variant="secondary"
            className={
              a.typ === 'urlaub'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                : 'bg-red-100 text-red-700 hover:bg-red-100'
            }
          >
            {typLabel(a.typ)}
          </Badge>
          <span
            className={
              a.typ === 'urlaub'
                ? 'text-sm text-emerald-800'
                : 'text-sm text-red-800'
            }
          >
            Für diesen Tag ist {typLabel(a.typ)} eingetragen
            {a.notiz && ` – ${a.notiz}`}
          </span>
        </div>
      ))}
    </div>
  )
}
