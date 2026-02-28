# PROJ-9: Mitarbeiter-Arbeitszeitprofil

## Status: In Progress
**Created:** 2026-02-22
**Last Updated:** 2026-02-28

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-2 (Benutzerverwaltung Admin) – Admin verwaltet Mitarbeiter-Stammdaten
- Requires: PROJ-4 (Zeiterfassung) – Soll-Ist-Vergleich basiert auf erfassten Zeiten
- Requires: PROJ-5 (Abwesenheitsverwaltung) – Urlaubskonsum wird gegen Kontingent gerechnet

## Beschreibung
Der Admin kann für jeden Mitarbeiter ein Arbeitszeitprofil hinterlegen: Jährliches Urlaubskontingent (Tage), reguläre Arbeitstage (z.B. Montag–Freitag) und wöchentliche Sollstunden. Der Mitarbeiter sieht eine Übersicht seines Urlaubskontos (genommen vs. verfügbar) sowie seinen Soll-Ist-Stundenvergleich. Im Zeiterfassungs-Kalender wird ein Tag farblich hervorgehoben, sobald die Tages-Sollstunden erreicht oder überschritten wurden.

## User Stories
- Als Admin möchte ich für jeden Mitarbeiter das jährliche Urlaubskontingent (Tage) festlegen, damit das System den Resturlaub korrekt berechnen kann.
- Als Admin möchte ich die regulären Arbeitstage des Mitarbeiters definieren (Wochentage, z.B. Mo–Fr), damit die Sollstunden korrekt ermittelt werden.
- Als Admin möchte ich die wöchentliche Soll-Stundenzahl pro Mitarbeiter hinterlegen (z.B. 40h/Woche), damit der Soll-Ist-Vergleich möglich ist.
- Als Mitarbeiter möchte ich meinen verbleibenden Resturlaub auf einen Blick sehen (verfügbar, genommen, verbleibend), damit ich meine Urlaube planen kann.
- Als Mitarbeiter möchte ich im Kalender sehen, an welchen Tagen ich meine Sollarbeitszeit erreicht habe (farbliche Markierung), damit ich meinen Fortschritt verfolgen kann.
- Als Mitarbeiter möchte ich eine Monatsübersicht meiner Soll- vs. Ist-Stunden sehen, damit ich erkennen kann, ob ich im Plan liege.

## Acceptance Criteria
- [ ] Admin-Bereich enthält pro Mitarbeiter ein Formular für das Arbeitszeitprofil: Urlaubstage/Jahr (Ganzzahl), Arbeitstage (Mehrfachauswahl Mo–So), Wochenstunden (Dezimalzahl, z.B. 40.0)
- [ ] Das Arbeitszeitprofil ist für jeden Mitarbeiter individuell und unabhängig von anderen Mitarbeitern
- [ ] Admin kann das Profil jederzeit bearbeiten; Änderungen wirken sich sofort auf die Berechnungen aus
- [ ] Mitarbeiter-Übersichtsseite zeigt Urlaubskonto: Jahresanspruch, bereits genommene Tage (aus PROJ-5 Abwesenheiten), verbleibende Tage
- [ ] Mitarbeiter-Übersichtsseite zeigt Stunden-Übersicht für den aktuellen Monat: Soll-Stunden (basierend auf Arbeitstagen im Monat × Tagesstunden), Ist-Stunden (erfasste Zeiteinträge), Differenz (+/−)
- [ ] Im Zeiterfassungs-Kalender (PROJ-4) wird ein Tag grün hinterlegt, wenn die Tages-Sollstunden erreicht oder überschritten wurden
- [ ] Im Zeiterfassungs-Kalender wird ein Tag gelb hinterlegt, wenn Einträge vorhanden, aber Sollstunden noch nicht erreicht
- [ ] Tage ohne jegliche Einträge (an regulären Arbeitstagen) bleiben ohne Markierung oder werden neutral angezeigt
- [ ] Die Kalender-Farbkennzeichnung funktioniert auf Mobile (375px) und ist gut erkennbar
- [ ] Wenn kein Arbeitszeitprofil für einen Mitarbeiter hinterlegt ist, wird keine Farbkennzeichnung angezeigt und keine Berechnung durchgeführt (Fallback: kein Profil vorhanden – Meldung im Admin)
- [ ] Urlaubskonto berücksichtigt nur genehmigte/eingetragene Abwesenheiten vom Typ „Urlaub" (nicht Krankheit)

## Edge Cases
- Was passiert, wenn ein Mitarbeiter noch kein Arbeitszeitprofil hat? → Admin-Bereich zeigt Hinweis „Kein Profil hinterlegt", Mitarbeiter sieht keine Urlaubskonto-Übersicht.
- Was passiert, wenn der Mitarbeiter mehr Urlaub nimmt als das Kontingent erlaubt? → System zeigt negativen Resturlaub (Überschreitung wird angezeigt, aber nicht technisch blockiert).
- Was passiert bei Teilzeit-Mitarbeitern mit ungleichmäßigen Arbeitstagen? → Admin kann beliebige Wochentage als Arbeitstage wählen (z.B. Mo, Mi, Fr).
- Was passiert, wenn Arbeitszeitprofil mitten im Jahr geändert wird? → Neue Werte gelten ab dem Zeitpunkt der Änderung; historische Berechnungen werden nicht rückwirkend neu berechnet.
- Was passiert, wenn ein Mitarbeiter an einem Nicht-Arbeitstag Stunden einträgt? → Einträge werden gespeichert, der Tag wird aber nicht als Soll-Tag gewertet.
- Was passiert bei Feiertagen? → Feiertage werden in MVP nicht automatisch berücksichtigt (kein Feiertagskalender).
- Was passiert, wenn Stunden aus einem laufenden Tag noch nicht vollständig eingetragen sind? → Partiell erfasste Stunden werden bei der Tages-Berechnung berücksichtigt.

## Technical Requirements
- Neue DB-Tabelle `arbeitszeitprofile` (Mitarbeiter-ID, Urlaubstage, Arbeitstage als Array, Wochenstunden)
- RLS: Admin kann alle Profile lesen/schreiben; Mitarbeiter kann nur das eigene Profil lesen
- Soll-Stunden-Berechnung: serverseitig oder im Client (basierend auf Profildaten)
- Kalender-Farbkennzeichnung: muss auf Mobile performant sein (kein Layout-Shift)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick: 3 Bereiche

#### 1. Admin – Arbeitszeitprofil-Verwaltung

Neuer Menüpunkt „Arbeitszeitprofil bearbeiten" im bestehenden Dropdown pro Benutzer in der Admin-Tabelle. Öffnet einen Dialog zum Anlegen/Bearbeiten des Profils.

```
Admin-Seite (existing)
+-- Benutzertabelle (existing)
    +-- Dropdown per Benutzer (existing)
        +-- "Arbeitszeitprofil bearbeiten"  ← NEU
+-- ArbeitszeitprofilDialog                ← NEU
    +-- Urlaubstage/Jahr (Zahl, z.B. 30)
    +-- Arbeitstage (Checkboxen: Mo Di Mi Do Fr Sa So)
    +-- Wochenstunden (Dezimalzahl, z.B. 40.0)
    +-- Status: "Kein Profil vorhanden" wenn noch keines hinterlegt
    +-- Speichern / Abbrechen
```

#### 2. Dashboard – Mitarbeiter-Übersicht

Die leere `/dashboard`-Seite (aktuell Platzhalter) wird zur Übersichtsseite mit zwei Karten.

```
DashboardPage (existing, jetzt befüllt)
+-- UrlaubskontoKarte                      ← NEU
|   +-- Jahresanspruch: 30 Tage
|   +-- Genommen: 5 Tage (aus Urlaub-Abwesenheiten)
|   +-- Verbleibend: 25 Tage (grün / rot bei Überschreitung)
|   ODER: "Kein Arbeitszeitprofil hinterlegt"
+-- MonatsübersichtKarte                   ← NEU
    +-- Soll-Stunden: 160h (Arbeitstage im Monat × Tagesstunden)
    +-- Ist-Stunden: 128h (aus erfassten Zeiteinträgen)
    +-- Differenz: −32h
    ODER: "Kein Arbeitszeitprofil hinterlegt"
```

#### 3. Zeiterfassung – Tages-Farbkennzeichnung

Das bestehende Datum im Tagesnavigator erhält einen zweiten farbigen Dot – konsistent mit dem bestehenden Abwesenheits-Dot-Design.

```
Tagesnavigation (existing, erweitert)
+-- ← / → Navigation
+-- Datum-Button
    +-- Datum-Text (existing)
    +-- Abwesenheits-Dot (existing: grün/rot)
    +-- Stunden-Dot (NEU: grün = Soll erreicht, gelb = Einträge vorhanden aber unter Soll)
+-- Heute-Button
```

Kein Dot bei: kein Profil vorhanden, kein regulärer Arbeitstag, oder keine Einträge.

---

### Datenmodell

**Neue Tabelle: `arbeitszeitprofile`**

| Feld | Typ | Beispiel |
|------|-----|---------|
| `id` | UUID | auto |
| `user_id` | UUID (unique) | → Mitarbeiter |
| `urlaubstage_jahr` | Ganzzahl | 30 |
| `arbeitstage` | Text-Array | `['Mo','Di','Mi','Do','Fr']` |
| `wochenstunden` | Dezimalzahl | 40.0 |
| `created_at` / `updated_at` | Timestamp | auto |

**RLS:**
- Admin: alle Profile lesen & schreiben
- Mitarbeiter: nur eigenes Profil lesen (kein Schreiben)

---

### API Routes (neu)

| Route | Zweck |
|-------|-------|
| `GET /api/arbeitszeitprofile/me` | Mitarbeiter lädt eigenes Profil |
| `GET /api/admin/arbeitszeitprofile/[userId]` | Admin lädt Profil eines Nutzers |
| `PUT /api/admin/arbeitszeitprofile/[userId]` | Admin erstellt / aktualisiert Profil (UPSERT) |

**Bestehende APIs wiederverwendet:**
- `GET /api/zeiteintraege?von=...&bis=...` – Monatsstunden (bereits vorhanden)
- `GET /api/abwesenheiten` – Urlaub-Tage für Urlaubskonto

---

### Tech-Entscheidungen

| Entscheidung | Wahl | Warum |
|---|---|---|
| Stunden-Berechnung | Client-seitig | Einfache Mathematik aus Profildaten, kein extra Server-Round-Trip |
| Übersichtsseite | Dashboard (`/dashboard`) | Aktuell leerer Platzhalter, idealer Ort für Mitarbeiter-Kennzahlen |
| Farbkennzeichnung | Dot im Tages-Button | Konsistent mit Abwesenheits-Dot, kein Layout-Shift, mobile-freundlich |
| Profil anlegen/aktualisieren | UPSERT | Max. 1 Profil pro Nutzer, create und update in einem Schritt |
| Neue Packages | Keine | Checkbox, Card, Input bereits via shadcn/ui vorhanden |

---

### Betroffene Dateien

**Neu:**
- `src/app/api/arbeitszeitprofile/me/route.ts`
- `src/app/api/admin/arbeitszeitprofile/[userId]/route.ts`
- `src/components/admin/arbeitszeitprofil-dialog.tsx`
- `src/components/dashboard/urlaubskonto-karte.tsx`
- `src/components/dashboard/monatsuebersicht-karte.tsx`

**Geändert:**
- `src/app/admin/page.tsx` – neuer Dropdown-Eintrag + Dialog einbinden
- `src/app/dashboard/page.tsx` – von Platzhalter zu Übersicht
- `src/components/zeiterfassung/tagesnavigation.tsx` – zweiter Stunden-Dot
- Supabase: neue Tabelle `arbeitszeitprofile` + RLS-Policies

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
