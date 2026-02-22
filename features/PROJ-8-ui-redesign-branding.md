# PROJ-8: UI/UX Redesign & Branding

## Status: In Progress
**Created:** 2026-02-22
**Last Updated:** 2026-02-22

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Login-Seite wird redesigned
- Requires: PROJ-6 (PDF-Export) – PDF-Design wird überarbeitet
- Empfohlen: PROJ-7 (PWA & Mobile Optimierung) – Mobile Layouts werden parallel überarbeitet

## Beschreibung
Die gesamte App erhält ein modernes, professionelles Erscheinungsbild basierend auf den Farben des Hofzeit-Logos (`/public/hofzeit_logo.png`). Alle Seiten, Komponenten und das PDF-Export-Layout werden einheitlich und konsistent überarbeitet. Subtile Animationen und Übergänge verbessern die Nutzererfahrung.

## User Stories
- Als Mitarbeiter möchte ich eine App sehen, die professionell und modern aussieht, damit ich das System gerne benutze.
- Als Mitarbeiter möchte ich, dass die App-Farben zum Hofzeit-Logo passen, damit die App wie eine einheitliche Marke wirkt.
- Als Mitarbeiter möchte ich sanfte Animationen beim Öffnen von Dialogen und beim Seitenwechsel sehen, damit die App sich hochwertig anfühlt.
- Als Mitarbeiter möchte ich, dass das exportierte PDF professionell gestaltet ist (Logo, Farben, klares Layout), damit es offiziellen Dokumenten entspricht.
- Als Admin möchte ich eine übersichtliche, klare Benutzeroberfläche haben, damit ich schnell die gewünschten Informationen finde.

## Acceptance Criteria
- [ ] Logo-Farben aus `hofzeit_logo.png` werden extrahiert und als CSS-Custom-Properties / Tailwind-Theme definiert (Primärfarbe, Sekundärfarbe, Akzentfarbe)
- [ ] Alle Seiten verwenden das neue Farbschema konsistent (Buttons, Links, Badges, Statusfarben, Navigations-Highlights)
- [ ] Login-Seite ist optisch überarbeitet (Logo prominent, modernes Card-Layout)
- [ ] Alle Dialoge und Sheets haben Einblend-Animationen (fade-in, slide-in)
- [ ] Seitenübergänge haben subtile Animationen (kein abruptes Flackern beim Laden)
- [ ] Tabellen, Cards und Listen haben ein konsistentes, aufgeräumtes Design
- [ ] Leere Zustände (keine Daten vorhanden) haben ansprechende Illustrationen oder Icons mit erklärendem Text
- [ ] Lade-Zustände (Skeleton/Spinner) sind konsistent und modern gestaltet
- [ ] PDF-Export enthält das Hofzeit-Logo in der Kopfzeile
- [ ] PDF-Farbschema entspricht den Logo-Farben (Header-Hintergrundfarbe, Tabellenstreifen, Akzente)
- [ ] PDF-Layout ist klar gegliedert, professionell und druckfreundlich (saubere Abstände, Schriftgrößen, Hierarchie)
- [ ] Alle UI-Änderungen sind responsive und funktionieren auf 375px (Mobile) und 1440px (Desktop)
- [ ] Animationen respektieren `prefers-reduced-motion` (keine Animationen bei eingeschränkter Bewegungswahrnehmung)

## Edge Cases
- Was passiert, wenn das Logo sehr viele Farben hat? → Maximal 3 Farben werden als Theme definiert (Primär, Sekundär, Neutral).
- Was passiert, wenn Animationen die Performance auf älteren Geräten beeinträchtigen? → Animationen sind leichtgewichtig (CSS-Transitions, kein JavaScript-Animationsframework).
- Was passiert mit bestehenden Nutzern, die sich an das alte Design gewöhnt haben? → Alle Funktionen bleiben identisch, nur das Erscheinungsbild ändert sich.
- Was passiert, wenn eine Farbe aus dem Logo keinen ausreichenden Kontrast für Text bietet? → Es wird eine kontraststarke Variante gewählt (WCAG AA: 4.5:1 für normalen Text).
- Was passiert beim PDF-Druck auf Schwarz-Weiß-Druckern? → Farben sind als Graustufen noch lesbar (keine rein farbliche Information).

## Technical Requirements
- Tailwind CSS Theme Extension für benutzerdefinierte Farben
- CSS `@keyframes` oder Framer Motion für Animationen
- Animationen: max. 300ms Dauer, `ease-in-out`
- WCAG AA Kontrast (4.5:1) für alle Text-Hintergrund-Kombinationen
- PDF-Bibliothek: bestehende Lösung aus PROJ-6 (kein Wechsel der Library)
- `prefers-reduced-motion` Media Query wird berücksichtigt

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Farbpalette aus Logo (`hofzeit_logo.png`)

| Token | Farbe | Verwendung |
|-------|-------|-----------|
| `--primary` | Dunkelblau `#1B4F8A` | Hauptbuttons, aktive Navigation, Überschriften |
| `--secondary` | Grün `#72B832` | Badges, Erfolgs-Zustände, Highlights |
| `--accent` | Orange `#E07832` | Akzent-Icons, Warnhinweise |

### Komponenten-Struktur

```
App Layout (app-layout.tsx) ← überarbeitet
+-- Header
|   +-- Logo Bild (hofzeit_logo.png, 28px Höhe)
|   +-- App-Name "Hofzeit" (fett, Primärfarbe)
|   +-- Desktop Navigation
|   |   +-- Aktiver Link: Primärfarbe + blauer Indikator-Strich
|   |   +-- Inaktiver Link: gedämpft
|   +-- Logout Button (outline, Primärfarbe)
+-- Hauptinhalt (mit sanfter Einblend-Animation)
+-- Bottom-Navigation Mobile ← überarbeitet
    +-- Aktives Icon: Primärfarbe

Login-Seite (login/page.tsx) ← komplett neu gestaltet
+-- Zentrierter Container
    +-- Logo (groß, zentriert, oben)
    +-- Login-Card
        +-- Titel "Anmelden"
        +-- E-Mail-Feld
        +-- Passwort-Feld
        +-- Login-Button (Primärblau, volle Breite)
        +-- "Angemeldet bleiben"-Checkbox

NEU: EmptyState-Komponente (components/ui/empty-state.tsx)
+-- Lucide-Icon (kontextuell: Uhr, Kalender, etc.)
+-- Titel ("Noch keine Einträge")
+-- Beschreibungstext
+-- Optionaler "Jetzt anlegen"-Button

PDF-Template ← überarbeitet (bestehende Bibliothek aus PROJ-6)
+-- Kopfzeile
|   +-- Logo links
|   +-- Berichtstitel rechts
|   +-- Zeitraum (z.B. "März 2026")
+-- Tabelle
|   +-- Header: Dunkelblau Hintergrund, weißer Text
|   +-- Geraden Zeilen: Weißer Hintergrund
|   +-- Ungeraden Zeilen: Sehr helles Blau
+-- Fußzeile: Seitenzahl
```

### Datenhaltung
Keine neuen Daten oder Datenbank-Tabellen. Rein visuelle Änderungen über CSS Custom Properties.

### Technische Entscheidungen

| Entscheidung | Warum |
|---|---|
| **CSS Custom Properties** für Farben | shadcn/ui liest Farben aus CSS-Variablen – einmal in `globals.css` geändert, übernehmen alle 20+ shadcn-Komponenten automatisch das neue Theme |
| **Kein Framer Motion** | Spec fordert max. 300ms CSS-Transitions – natives CSS ist schneller, kleiner, kein zusätzliches Paket |
| **Bestehende PDF-Bibliothek** beibehalten | Kein Bibliothekswechsel – nur Logo-URL und Farb-Werte in bestehender Template-Logik anpassen |
| **`prefers-reduced-motion`** in CSS | Einmalig definiert, wirkt auf alle App-Animationen |

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/app/globals.css` | Neue `--primary`, `--secondary`, `--accent` Farbwerte + Keyframe-Animationen |
| `tailwind.config.ts` | Neue `fade-in` / `slide-up` Animation-Utilities |
| `src/components/app-layout.tsx` | Logo-Bild einfügen, aktive Nav-Farbe auf Primärblau |
| `src/components/bottom-nav.tsx` | Aktives Icon auf Primärblau |
| `src/components/login-form.tsx` | Logo oben, modernes Card-Layout |
| PDF-Template | Logo-Header, Farbstreifen, Tabellenformatierung |
| NEU: `src/components/ui/empty-state.tsx` | Wiederverwendbare Leer-Zustands-Komponente |

### Neue Pakete
Keine – alle benötigten Tools sind bereits installiert (shadcn/ui, Tailwind CSS, Lucide React).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
