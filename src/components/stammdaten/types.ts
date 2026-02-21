export interface Taetigkeit {
  id: string
  name: string
  beschreibung: string | null
  created_at: string
  updated_at: string
}

export interface Kostenstelle {
  id: string
  name: string
  nummer: string | null
  created_at: string
  updated_at: string
}

export type StammdatenTyp = 'taetigkeit' | 'kostenstelle'
