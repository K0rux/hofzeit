# Product Requirements Document

## Vision
Hofzeit ist ein webbasiertes Zeiterfassungssystem für kommunale Bauhöfe (1–20 Mitarbeiter). Es ermöglicht Mitarbeitern, ihre Arbeitszeiten strukturiert nach Tätigkeiten und Kostenstellen zu erfassen, Abwesenheiten (Urlaub, Krankheit) einzutragen und Auswertungen als PDF zu exportieren. Damit ersetzt Hofzeit papierbasierte Zeiterfassung durch eine einfache, mobile-freundliche Lösung.

## Target Users

### Mitarbeiter (Employee)
- Mitarbeiter eines kommunalen Bauhofs (Ortspflege, Grünflächenpflege, Straßenunterhalt)
- Nutzen hauptsächlich iPhone/Smartphone im Außeneinsatz
- Wollen schnell und unkompliziert Zeiten auf Tätigkeiten und Kostenstellen buchen
- Brauchen eine einfache Möglichkeit, Urlaub und Krankheit zu melden
- Möchten ihre Monatsübersicht als PDF exportieren

### Administrator (Admin)
- Führungskraft oder Verwaltungsmitarbeiter des Bauhofs
- Legt Benutzerkonten an, verwaltet und löscht sie
- Setzt Passwörter zurück bei Bedarf
- Hat Überblick über alle Nutzer des Systems

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | PROJ-1: Benutzerauthentifizierung | Deployed |
| P0 (MVP) | PROJ-2: Benutzerverwaltung (Admin) | Deployed |
| P0 (MVP) | PROJ-3: Tätigkeiten & Kostenstellen verwalten | Deployed |
| P0 (MVP) | PROJ-4: Zeiterfassung | Deployed |
| P1 | PROJ-5: Abwesenheitsverwaltung (Urlaub & Krankheit) | Deployed |
| P1 | PROJ-6: PDF-Export | Deployed |
| P1 | PROJ-7: PWA & Mobile Optimierung | Deployed |
| P1 | PROJ-8: UI/UX Redesign & Branding | Deployed |
| P2 | PROJ-9: Mitarbeiter-Arbeitszeitprofil | Deployed |
| P2 | PROJ-10: Monatsabschluss | Deployed |
| P2 | PROJ-11: Admin-Bereich Überarbeitung | Deployed |
| P2 | PROJ-12: Benutzerprofil-Selbstverwaltung | Planned |
| P2 | PROJ-13: UI/Dashboard-Verbesserungen | Planned |

## Success Metrics
- Alle Mitarbeiter des Bauhofs können sich selbstständig einloggen und Zeiten erfassen
- Zeiterfassung dauert unter 60 Sekunden pro Eintrag
- PDF-Export ist fehlerfrei und vollständig
- Keine Datenverluste (DSGVO-konformer Betrieb)
- App funktioniert zuverlässig auf iPhone (PWA)

## Constraints
- **Budget:** Klein – Open-Source-Stack (Next.js, Supabase Free Tier)
- **Team:** Kleines Entwicklungsteam / Einzelperson
- **Nutzerzahl:** 1–20 gleichzeitige Nutzer
- **Geräte:** Primär iPhone (Safari), PWA-fähig
- **Datenschutz:** DSGVO-konform (Daten verbleiben in EU, keine unnötige Datenweitergabe)
- **Sprache:** Deutsch (UI und Inhalte)

## Non-Goals
- Keine Lohnabrechnung oder Gehaltsberechnung
- Kein Projektmanagement (Gantt-Charts, Aufgaben, Deadlines)
- Keine GPS-/Standortverfolgung der Mitarbeiter
- Kein automatischer Stempeluhr-Modus (Start/Stop in Echtzeit)
- Keine Integration mit externen Lohnsystemen (SAP, DATEV) in v1
- Kein Dark Mode in MVP

---

Use `/requirements` to create detailed feature specifications for each item in the roadmap above.
