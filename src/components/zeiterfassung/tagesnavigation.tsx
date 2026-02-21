'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { formatDateDE, formatDateDECompact, addDays, getTodayStr } from './types'

interface TagesnavigationProps {
  datum: string // YYYY-MM-DD
  onDatumChange: (datum: string) => void
}

export function Tagesnavigation({ datum, onDatumChange }: TagesnavigationProps) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const today = getTodayStr()
  const isToday = datum === today

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDatumChange(addDays(datum, -1))}
        aria-label="Vorheriger Tag"
        className="min-h-[44px] px-3"
      >
        ←
      </Button>

      {/* Clickable date that opens native date picker */}
      <div className="relative">
        <button
          type="button"
          className="text-sm font-semibold px-2 py-2 min-h-[44px] rounded-md hover:bg-muted transition-colors cursor-pointer"
          onClick={() => dateInputRef.current?.showPicker()}
          aria-label="Datum wählen"
        >
          <span className="sm:hidden">{formatDateDECompact(datum)}</span>
          <span className="hidden sm:inline">{formatDateDE(datum)}</span>
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={datum}
          onChange={(e) => {
            if (e.target.value) onDatumChange(e.target.value)
          }}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDatumChange(addDays(datum, 1))}
        aria-label="Nächster Tag"
        className="min-h-[44px] px-3"
      >
        →
      </Button>

      {!isToday && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDatumChange(today)}
          className="min-h-[44px]"
        >
          Heute
        </Button>
      )}
    </div>
  )
}
