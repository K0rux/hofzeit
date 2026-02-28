# PROJ-12: Benutzerprofil-Selbstverwaltung

## Status: In Progress
**Created:** 2026-02-28
**Last Updated:** 2026-02-28

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Nutzer muss eingeloggt sein
- Requires: PROJ-2 (Benutzerverwaltung Admin) – Admin verwaltet Benutzerkonten
- Requires: PROJ-11 (Admin-Bereich Überarbeitung) – Admin-Bereich als Ausgangspunkt

## Beschreibung
Mitarbeiter können ihre eigenen Profildaten (Vorname, Nachname, E-Mail) auf einer dedizierten Profilseite selbst bearbeiten. Admins können die Profildaten aller Mitarbeiter im Admin-Bereich ändern (z.B. bei Schreibfehlern). Die Profilseite ist über die Navigation erreichbar: Desktop als eigener Menüpunkt „Profil", mobil unter „Mehr".

## User Stories
- Als Mitarbeiter möchte ich meinen Vornamen und Nachnamen ändern können, damit mein Profil korrekt ist (z.B. nach Heirat oder Tippfehler).
- Als Mitarbeiter möchte ich meine E-Mail-Adresse ändern können, damit ich mich weiterhin einloggen und Benachrichtigungen erhalten kann.
- Als Mitarbeiter möchte ich die Profilseite über die Navigation leicht finden (Desktop: Menüpunkt „Profil", Mobil: unter „Mehr").
- Als Mitarbeiter möchte ich eine Bestätigung sehen, wenn meine Profildaten erfolgreich gespeichert wurden.
- Als Admin möchte ich den Vornamen, Nachnamen und die E-Mail eines Mitarbeiters im Admin-Bereich bearbeiten können, damit ich Fehler korrigieren kann.
- Als Admin möchte ich die Profilbearbeitung direkt aus der Benutzerverwaltungsliste heraus starten können.

## Acceptance Criteria

### Profilseite Mitarbeiter (/profil)
- [ ] Neue Seite `/profil` ist nur für eingeloggte Nutzer zugänglich
- [ ] Die Seite zeigt ein Formular mit Vorname (Pflicht), Nachname (Pflicht), E-Mail (Pflicht)
- [ ] Die Felder sind mit den aktuellen Daten des eingeloggten Nutzers vorausgefüllt
- [ ] Beim Speichern wird Vorname, Nachname und E-Mail in der `profiles`-Tabelle aktualisiert
- [ ] Bei E-Mail-Änderung wird die E-Mail auch in Supabase Auth aktualisiert
- [ ] Nach erfolgreichem Speichern erscheint eine Erfolgsmeldung (Toast oder Inline-Alert)
- [ ] Bei ungültiger E-Mail (Format) erscheint eine Fehlermeldung
- [ ] Leere Pflichtfelder (Vorname, Nachname, E-Mail) werden verhindert
- [ ] Vorname und Nachname: max. 100 Zeichen

### Navigation zur Profilseite
- [ ] Desktop-Navigation enthält den Punkt „Profil" (für alle eingeloggten Nutzer sichtbar)
- [ ] Mobile „Mehr"-Sheet listet „Profil" zusammen mit Stammdaten auf
- [ ] Der Menüpunkt „Profil" ist für Admin und Mitarbeiter gleichermaßen sichtbar

### Admin: Nutzerprofil bearbeiten
- [ ] Im Admin-Bereich (Benutzerverwaltungsliste) gibt es pro Nutzer im Dropdown-Menü den Punkt „Profil bearbeiten"
- [ ] Es öffnet sich ein Dialog mit den Feldern Vorname, Nachname, E-Mail (vorausgefüllt mit aktuellen Daten)
- [ ] Admin kann Vorname, Nachname und E-Mail eines Mitarbeiters ändern und speichern
- [ ] Änderungen werden in der `profiles`-Tabelle gespeichert
- [ ] Bei E-Mail-Änderung durch Admin wird die E-Mail auch in Supabase Auth aktualisiert (via Admin-API)
- [ ] Erfolgsmeldung nach Speichern, Fehlermeldung bei ungültiger E-Mail
- [ ] Validierung: Pflichtfelder, E-Mail-Format, max. 100 Zeichen für Namen

## Edge Cases
- Was passiert, wenn die neue E-Mail bereits von einem anderen Konto verwendet wird? → Fehlermeldung: „Diese E-Mail-Adresse ist bereits vergeben."
- Was passiert, wenn der Mitarbeiter eine E-Mail eingibt, die bereits seine eigene ist? → Formular speichert ohne Fehler; keine doppelte Verarbeitung.
- Was passiert, wenn Vorname oder Nachname leer gelassen wird? → Pflichtfeld-Validierung, Speichern nicht möglich.
- Was passiert, wenn die E-Mail-Adresse geändert wird – muss der Nutzer sich neu anmelden? → Nach E-Mail-Änderung bleibt die Session bestehen; ein Hinweis informiert, dass die neue E-Mail beim nächsten Login verwendet wird.
- Was passiert, wenn ein Admin die eigene E-Mail ändert (Admin bearbeitet sich selbst)? → Gleiche Logik wie Mitarbeiter; Admin bleibt eingeloggt.
- Was passiert, wenn die Supabase-Auth-Aktualisierung der E-Mail fehlschlägt? → Nur die `profiles`-Tabelle wurde aktualisiert; Fehler wird angezeigt und `profiles` wird zurückgesetzt.

## Technical Requirements
- `profiles`-Tabelle muss Felder `vorname`, `nachname` enthalten (bereits vorhanden aus PROJ-2/PROJ-9)
- E-Mail-Änderung in Supabase Auth: `supabase.auth.updateUser({ email })` für Selbst-Änderung; Admin-Client für Fremdänderung
- RLS: Nutzer kann nur eigenes Profil aktualisieren; Admin-API-Route nutzt Service-Role-Client für Fremdänderungen
- Neue API-Route: `PATCH /api/profile/me` für Mitarbeiter-Selbständerung
- Erweiterung der Admin-Route: `PATCH /api/admin/users/[id]` um Vorname/Nachname/E-Mail
- Neue Seite: `src/app/profil/page.tsx`
- Neuer Admin-Dialog: `src/components/admin/profil-bearbeiten-dialog.tsx`

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
Navigation (bestehende Dateien, erweitert)
├── Desktop-Nav (app-layout.tsx)
│   ├── Mitarbeiter-Links: + "Profil"
│   └── Admin-Links: + "Profil"
└── Mobile Bottom-Nav (bottom-nav.tsx)
    └── Mehr-Sheet
        └── + "Profil" (für alle eingeloggten Nutzer)

Neue Seite: /profil
└── ProfilForm  [NEU: src/components/profil/profil-form.tsx]
    ├── Feld: Vorname (Pflicht, max 100 Zeichen)
    ├── Feld: Nachname (Pflicht, max 100 Zeichen)
    ├── Feld: E-Mail (Pflicht, E-Mail-Format)
    ├── Info-Hinweis: "Neue E-Mail gilt ab dem nächsten Login"
    └── Button: Speichern

Admin-Seite: /admin (bestehend, erweitert)
└── DropdownMenu pro Nutzer (bestehend)
    └── + Menüpunkt "Profil bearbeiten"  [NEU]
        └── ProfilBearbeitenDialog  [NEU: src/components/admin/profil-bearbeiten-dialog.tsx]
            ├── Feld: Vorname (Pflicht, max 100)
            ├── Feld: Nachname (Pflicht, max 100)
            ├── Feld: E-Mail (Pflicht, E-Mail-Format)
            └── Buttons: Abbrechen / Speichern
```

### Datenspeicherung

| Was | Wo | Vorhanden? |
|---|---|---|
| Vorname / Nachname | `profiles`-Tabelle (`first_name`, `last_name`) | ✅ Ja |
| E-Mail-Adresse | Supabase Auth (`auth.users`) | ✅ Ja |

**Keine Schemaänderungen nötig** — alle Felder existieren bereits.

### API-Endpunkte

| Route | Methode | Wer | Was |
|---|---|---|---|
| `/api/profile/me` | PATCH | Eingeloggter Nutzer | Eigenen Vor-/Nachnamen und E-Mail aktualisieren |
| `/api/admin/users/[id]/profile` | PATCH | Admin | Profildaten eines anderen Nutzers aktualisieren |

Der bestehende `PATCH /api/admin/users/[id]` (Reaktivierung) bleibt unverändert.

### Datenfluss

**Mitarbeiter (Selbst-Update):**
1. `/profil` lädt → Auth + `profiles` lesen → Formular vorausfüllen
2. Nutzer ändert Felder → clientseitige Validierung
3. Speichern → `PATCH /api/profile/me`
4. Server: `profiles` aktualisieren + bei E-Mail-Änderung Auth-Update via Service-Role-Client
5. Erfolg → Toast „Profil gespeichert"

**Admin (Fremdänderung):**
1. „Profil bearbeiten" im Dropdown → Dialog öffnet vorausgefüllt (aus bereits geladenem Users-Array, kein Extra-Request)
2. Admin ändert Felder → Validierung
3. Speichern → `PATCH /api/admin/users/[id]/profile`
4. Server: `profiles` + Auth-E-Mail via Admin-API aktualisieren
5. Erfolg → Toast + Benutzerliste neu laden

### Tech-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| E-Mail-Update serverseitig via Service-Role-Client | Vermeidet Supabase-Bestätigungs-E-Mail; E-Mail sofort geändert |
| Neuer Unterendpunkt `/profile` statt Erweiterung des PATCH | Bestehender PATCH macht Reaktivierung — gemischte Verantwortung birgt Bugs |
| Dialog für Admin (keine eigene Seite) | Konsistent mit allen anderen Admin-Aktionen (Passwort, Rolle, Arbeitszeitprofil) |
| Vorausfüllung aus bestehendem `users`-Array | Daten bereits geladen, kein Extra-Request nötig |

### Neue/geänderte Dateien

| Datei | Aktion |
|---|---|
| `src/app/profil/page.tsx` | NEU |
| `src/components/profil/profil-form.tsx` | NEU |
| `src/components/admin/profil-bearbeiten-dialog.tsx` | NEU |
| `src/app/api/profile/me/route.ts` | NEU |
| `src/app/api/admin/users/[id]/profile/route.ts` | NEU |
| `src/components/app-layout.tsx` | ÄNDERUNG — „Profil"-Link in Desktop-Nav |
| `src/components/bottom-nav.tsx` | ÄNDERUNG — „Profil"-Link im Mehr-Sheet |
| `src/app/admin/page.tsx` | ÄNDERUNG — neuer Dialog-State + Dropdown-Eintrag |

### Abhängigkeiten

Keine neuen Pakete — alle benötigten Komponenten (Dialog, Input, Button, Alert, Sonner, Zod) sind bereits installiert.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
