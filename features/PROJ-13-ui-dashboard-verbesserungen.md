# PROJ-13: UI/Dashboard-Verbesserungen

## Status: Planned
**Created:** 2026-02-28
**Last Updated:** 2026-02-28

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Rollenprüfung für Dashboard-Ansichten
- Requires: PROJ-6 (PDF-Export) – PDF-Report wird korrigiert
- Requires: PROJ-8 (UI/UX Redesign & Branding) – bestehende Design-Sprache wird weitergeführt
- Requires: PROJ-9 (Mitarbeiter-Arbeitszeitprofil) – Urlaubskonto- und Stunden-Daten im Dashboard
- Requires: PROJ-10 (Monatsabschluss) – Admin-Dashboard zeigt Monatsabschluss-Status
- Requires: PROJ-11 (Admin-Bereich Überarbeitung) – Admin-Navigation und Stammdaten-Seite

## Beschreibung
Fünf gebündelte Verbesserungen der bestehenden UI: (1) Das Mitarbeiter-Dashboard zeigt mehr relevante Informationen (Wochenstunden, Resturlaub) mit verbessertem Layout. (2) Das Admin-Dashboard bekommt eine Übersicht der Monatsabschlüsse aller Mitarbeiter. (3) Tätigkeiten werden aus der Stammdaten-Ansicht des Admins entfernt (Admins verwalten keine Tätigkeiten); außerdem wird „Abwesenheiten" aus der Admin-Navigation entfernt, da Admins keine eigene Zeiterfassung oder Abwesenheitsverwaltung betreiben. (4) Im PDF-Report wird die E-Mail-Adresse durch Vorname + Nachname ersetzt. (5) Die mobile Bottom-Navigation wird höher gesetzt, damit die iPhone-System-Touchbar (Home Indicator) nicht versehentlich ausgelöst wird.

## User Stories
- Als Mitarbeiter möchte ich auf dem Dashboard auf einen Blick sehen, wie viele Stunden ich diese Woche erfasst habe, damit ich meinen Fortschritt verfolgen kann.
- Als Mitarbeiter möchte ich meinen Resturlaub prominent auf dem Dashboard sehen, damit ich keine separate Seite aufrufen muss.
- Als Mitarbeiter möchte ich ein übersichtlicheres und besser lesbares Dashboard-Layout, damit ich die wichtigsten Informationen schnell erfasse.
- Als Admin möchte ich auf dem Dashboard sehen, welche Mitarbeiter ihren Monatsabschluss bereits eingereicht haben und welche noch ausstehend sind, damit ich den Überblick behalte.
- Als Admin möchte ich im Stammdaten-Bereich nur die Kostenstellen sehen (keine Tätigkeiten-Tab), da Tätigkeiten durch Mitarbeiter selbst verwaltet werden.
- Als Admin möchte ich keinen „Abwesenheiten"-Menüpunkt in meiner Navigation sehen, da ich keine eigenen Abwesenheiten erfasse und dieser Punkt für meine Rolle irrelevant ist.
- Als Mitarbeiter möchte ich im PDF-Bericht meinen Namen (Vorname + Nachname) statt meiner E-Mail-Adresse sehen, damit der Bericht professioneller wirkt.
- Als Mitarbeiter möchte ich die mobile App bedienen, ohne versehentlich die iPhone-Systemleiste (Home Indicator) zu berühren, wenn ich die Navigation nutze.

## Acceptance Criteria

### Dashboard: Mitarbeiter-Ansicht verbessern
- [ ] Die Karte „Wochenstunden" zeigt die bereits erfassten Stunden der aktuellen Woche (Montag–Sonntag) sowie die Soll-Stunden der Woche (aus Arbeitszeitprofil, falls vorhanden)
- [ ] Die Karte „Urlaubskonto" zeigt Resturlaub (verfügbar − genommen) prominent (große Zahl) mit Untertitel „verbleibende Tage"
- [ ] Wenn kein Arbeitszeitprofil hinterlegt ist: Karten zeigen einen Fallback-Hinweis statt falscher Zahlen
- [ ] Das Dashboard-Layout ist auf Mobile (375px) und Desktop (1440px) klar gegliedert (keine überladene Darstellung)
- [ ] Ladezeiten der Dashboard-Karten: Skeleton-Loading-States vorhanden

### Dashboard: Admin-Ansicht – Monatsabschluss-Übersicht
- [ ] Das Admin-Dashboard enthält einen Bereich „Monatsabschlüsse" mit dem aktuell relevanten Monat (Vormonat oder laufender Monat)
- [ ] Für jeden aktiven Mitarbeiter wird angezeigt: Name, Status des Monatsabschlusses (Offen / Eingereicht / Abgeschlossen)
- [ ] Die Liste ist nach Status sortiert (Offene zuerst)
- [ ] Admin kann direkt aus der Liste heraus einen Monatsabschluss für einen Mitarbeiter abschließen (Schnellzugriff ohne Umweg über Admin-Benutzerverwaltung)
- [ ] Wenn alle Mitarbeiter abgeschlossen haben: Erfolgsmeldung „Alle Monatsabschlüsse für [Monat] abgeschlossen"

### Admin-Navigation: Tätigkeiten und Abwesenheiten ausblenden
- [ ] Admins sehen auf der Stammdaten-Seite (`/stammdaten`) nur den Tab „Kostenstellen" – der Tab „Tätigkeiten" wird für Admin-Rollen nicht angezeigt
- [ ] Mitarbeiter sehen weiterhin beide Tabs (Tätigkeiten + Kostenstellen, wobei Kostenstellen readonly bleibt gemäß PROJ-11)
- [ ] Der Navigationspunkt „Abwesenheiten" ist im Admin-Menü (Desktop-Nav und Mobile-Sheet) nicht sichtbar
- [ ] Mitarbeiter sehen „Abwesenheiten" weiterhin in ihrer Navigation
- [ ] Die `/abwesenheiten`-Route ist für Admins über die URL weiterhin erreichbar (kein 403), aber nicht aktiv verlinkt
- [ ] Keine API-Änderungen notwendig (Tätigkeiten- und Abwesenheiten-APIs sind bereits nutzer-spezifisch)

### PDF-Report: Name statt E-Mail
- [ ] Im generierten PDF-Bericht (Mitarbeiter-Export und Admin-Bericht) steht bei der Mitarbeiter-Identifikation: „Vorname Nachname" statt der E-Mail-Adresse
- [ ] Die E-Mail-Adresse erscheint im PDF nicht mehr im Kopfbereich oder der Zusammenfassung
- [ ] Wenn Vorname/Nachname nicht vorhanden sind (Edge Case): Fallback auf E-Mail

### PWA: Mobile Navigation höher (iPhone Home Indicator)
- [ ] Die Bottom-Navigation hat ausreichend `padding-bottom`, damit keine Schaltfläche im Bereich des iPhone Home Indicators (≈ 34px) liegt
- [ ] Auf iPhones mit Home Indicator (iPhone X und neuer) wird der Navigationsbereich durch `env(safe-area-inset-bottom)` nach oben verschoben
- [ ] Auf Geräten ohne Home Indicator bleibt die Navigation unverändert
- [ ] Die Anpassung ist als PWA (vollbild, ohne Browser-Chrome) wie im normalen Browser-Modus korrekt

## Edge Cases
- Was passiert, wenn ein Mitarbeiter kein Arbeitszeitprofil hat und das Dashboard die Wochenstunden anzeigen soll? → Statt Soll-Stunden wird nur „Ist-Stunden diese Woche" angezeigt, ohne Soll-Vergleich.
- Was passiert, wenn ein Mitarbeiter in der Admin-Monatsabschluss-Übersicht deaktiviert ist? → Deaktivierte Nutzer erscheinen nicht in der Übersicht.
- Was passiert, wenn für den aktuellen Monat noch keine Monatsabschluss-Einträge existieren? → Admin sieht alle aktiven Mitarbeiter mit Status „Offen".
- Was passiert mit dem Tätigkeiten-Tab für Admins, wenn ein Admin auch als Mitarbeiter Zeiteinträge erstellt (Dual-Role)? → In MVP gibt es keine Dual-Role; ein Nutzer ist entweder Admin oder Mitarbeiter. Admins sehen den Tätigkeiten-Tab nicht.
- Was passiert, wenn ein Admin direkt `/abwesenheiten` aufruft (ohne Navigationslink)? → Die Seite ist erreichbar, zeigt aber keine eigenen Einträge (leerer Zustand). Kein aktiver Schutz nötig, da keine sensiblen Fremddaten sichtbar sind.
- Was passiert im PDF wenn ein Nutzer noch keinen Vor-/Nachnamen hat? → Fallback auf E-Mail-Adresse.
- Was passiert mit `env(safe-area-inset-bottom)` auf Nicht-iOS-Geräten? → Der Wert ist 0, kein visueller Unterschied.

## Technical Requirements
- Dashboard-Daten: Wochenstunden werden über eine neue oder bestehende API-Route abgefragt (Zeiteinträge der aktuellen Woche aggregieren)
- Admin-Dashboard Monatsabschlüsse: Neue oder angepasste Query auf `monatsabschluesse`-Tabelle (alle Nutzer, aktueller/vorheriger Monat)
- PDF-Generator: `src/lib/pdf-generator.ts` – Felder für Mitarbeitername anpassen
- Bottom-Nav: `src/components/bottom-nav.tsx` – CSS `padding-bottom: env(safe-area-inset-bottom)` oder `pb-safe` mit Tailwind-Plugin
- Stammdaten: `src/app/stammdaten/page.tsx` – Tätigkeiten-Tab nur für Mitarbeiter anzeigen
- Navigation: `src/components/app-layout.tsx` + `src/components/bottom-nav.tsx` – „Abwesenheiten" aus Admin-Navlinks entfernen
- Keine neuen Tabellen erforderlich

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Scope & Approach
Rein frontend-seitige Änderungen. Keine neuen API-Endpunkte, keine neuen Datenbanktabellen, keine RLS-Änderungen.

### Komponentenstruktur

```
A) Employee Dashboard (dashboard/page.tsx) – CHANGE
   +-- WochenstundenKarte (NEW component)
   |   +-- Skeleton (loading)
   |   +-- "X / Y Std. diese Woche" (Ist vs. Soll)
   |   +-- Fallback-Hinweis (wenn kein Arbeitszeitprofil)
   +-- UrlaubskontoKarte (existing, unchanged)
   +-- MonatsuebersichtKarte (existing, unchanged)

B) Admin Dashboard (dashboard/page.tsx) – CHANGE
   +-- AdminMonatsabschlussUebersicht (NEW component)
       +-- Monat-Überschrift ("Offene Monatsabschlüsse – Januar 2026")
       +-- Tabelle: Name | Status | Aktion
       |   +-- Badge "Offen" (rot)
       |   +-- Badge "Abgeschlossen" (grün)
       |   +-- Button "Abschließen" → bestehenden AbschliessenDialog
       +-- Erfolgsmeldung (wenn alle abgeschlossen)
       +-- Skeleton Loading State

C) Stammdaten-Seite (stammdaten/page.tsx) – CHANGE
   +-- Tabs (role-aware)
       +-- "Tätigkeiten" Tab → nur für Mitarbeiter (hidden für Admin)
       +-- "Kostenstellen" Tab → für alle (Default für Admin)

D) Navigation – CHANGE
   +-- AppLayout (app-layout.tsx)
   |   +-- Desktop navLinks: "Abwesenheiten" aus Admin-Liste entfernt
   +-- BottomNav (bottom-nav.tsx)
       +-- adminTabs: "Abwesend" aus Tab-Leiste entfernt
       +-- Safe-area padding via CSS env(safe-area-inset-bottom)

E) PDF-Export (export/page.tsx) – CHANGE
   +-- first_name + last_name aus Profil zusammensetzen
   +-- Fallback: E-Mail wenn kein Name hinterlegt
```

### Datenflüsse

| Datenquelle | Verwendet für |
|---|---|
| `/api/zeiteintraege?von=…&bis=…` | Wochenstunden-Karte: Zeiteinträge Mo–So summieren |
| `/api/arbeitszeitprofile/me` | Soll-Stunden pro Woche berechnen (existing) |
| `/api/admin/monatsabschluesse` | Admin-Dashboard: Status aller Mitarbeiter für einen Monat |
| `/api/admin/users` | Admin-Dashboard: Mitarbeiternamen zur UserId aufschlüsseln |
| Supabase `profiles.first_name` + `last_name` | PDF: Namen statt E-Mail |

### Technische Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Keine neuen API-Endpunkte | Alle Daten über bestehende Routen abrufbar |
| Neue `WochenstundenKarte`-Komponente | Eigene Karte hält Dashboard-Grid symmetrisch |
| Neue `AdminMonatsabschlussUebersicht`-Komponente | Wiederverwendet bestehenden `AbschliessenDialog`; trennt Admin/Employee-Dashboard |
| `env(safe-area-inset-bottom)` CSS | Webstandard für iPhone Home Indicator; kein Plugin nötig |
| `defaultValue="kostenstellen"` für Admin im Stammdaten-Tab | Wenn Tätigkeiten-Tab ausgeblendet, muss Default auf Kostenstellen gesetzt sein |

### Betroffene Dateien

| Datei | Art |
|---|---|
| `src/app/dashboard/page.tsx` | Wochenstunden-Fetch + WochenstundenKarte + Admin-Dashboard-Sektion |
| `src/components/dashboard/wochenstunden-karte.tsx` | **Neue Komponente** |
| `src/components/dashboard/admin-monatsabschluss-uebersicht.tsx` | **Neue Komponente** |
| `src/components/app-layout.tsx` | "Abwesenheiten" aus Admin-navLinks entfernen |
| `src/components/bottom-nav.tsx` | "Abwesend" aus adminTabs entfernen + safe-area padding |
| `src/app/stammdaten/page.tsx` | Tätigkeiten-Tab für Admin ausblenden + defaultValue anpassen |
| `src/app/export/page.tsx` | first_name + last_name statt Email für `userName` |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
