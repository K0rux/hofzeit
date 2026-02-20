# PROJ-2: Benutzerverwaltung (Admin)

## Status: In Review
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Admin muss eingeloggt sein

## Beschreibung
Administratoren können im Admin-Bereich neue Benutzerkonten anlegen, bestehende Benutzer einsehen und verwalten, Passwörter zurücksetzen und Konten löschen. Reguläre Mitarbeiter haben keinen Zugang zu diesem Bereich.

## User Stories
- Als Admin möchte ich neue Mitarbeiterkonten anlegen (Name, E-Mail, Passwort, Rolle), damit neue Mitarbeiter die App nutzen können.
- Als Admin möchte ich eine Übersicht aller Benutzer sehen (Name, E-Mail, Rolle, letzter Login), damit ich den Überblick über aktive Nutzer behalte.
- Als Admin möchte ich das Passwort eines Mitarbeiters zurücksetzen (neues Passwort setzen), damit der Mitarbeiter sich wieder einloggen kann.
- Als Admin möchte ich einen Benutzer löschen/deaktivieren, wenn ein Mitarbeiter das Unternehmen verlässt, damit kein unbefugter Zugang mehr möglich ist.
- Als Admin möchte ich die Rolle eines Benutzers ändern können (z. B. Mitarbeiter → Admin), damit flexible Rollenverteilung möglich ist.

## Acceptance Criteria
- [ ] Admin-Bereich ist nur für Nutzer mit Admin-Rolle zugänglich (403 für alle anderen)
- [ ] Formular zum Anlegen eines neuen Benutzers: Vorname, Nachname, E-Mail, Passwort, Rolle (Admin/Mitarbeiter)
- [ ] Alle Pflichtfelder werden validiert (E-Mail-Format, Passwort-Mindestlänge 8 Zeichen)
- [ ] Bestehende Benutzer werden in einer Liste angezeigt (Name, E-Mail, Rolle, Status)
- [ ] Admin kann für jeden Benutzer ein neues Passwort setzen (Bestätigungsdialog)
- [ ] Admin kann einen Benutzer löschen (Bestätigungsdialog mit Warnmeldung)
- [ ] Ein Admin kann sich nicht selbst löschen
- [ ] E-Mail-Adressen müssen eindeutig sein (Fehlermeldung bei Duplikat)
- [ ] Alle Aktionen geben Bestätigungs- oder Fehlermeldungen auf Deutsch aus

## Edge Cases
- Was passiert, wenn der letzte Admin gelöscht werden soll? → Löschen verhindern, Fehlermeldung anzeigen
- Was passiert bei doppelter E-Mail-Adresse? → Fehlermeldung „Diese E-Mail-Adresse ist bereits vergeben"
- Was passiert mit den Zeiteinträgen eines gelöschten Mitarbeiters? → Zeiteinträge bleiben erhalten (historische Daten), Benutzer wird deaktiviert (nicht hart gelöscht)
- Was passiert, wenn ein Admin die eigene Rolle ändert? → Eigene Rolle kann nicht geändert werden (Schutz)
- Was passiert bei sehr kurzem Passwort beim Reset? → Validierungsfehler, Mindestlänge 8 Zeichen erzwingen

## Technical Requirements
- Sicherheit: Rollenprüfung server-seitig (nicht nur client-seitig)
- DSGVO: Gelöschte/deaktivierte Benutzer werden als inaktiv markiert, nicht sofort hart gelöscht (Aufbewahrungspflicht für Zeitdaten)
- Passwörter: Nur als Hash gespeichert, niemals im Klartext

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponentenstruktur

```
/admin  (geschützt – nur Admin-Rolle)
└── AdminPage
    ├── Seitentitel "Benutzerverwaltung"
    ├── "Neuer Benutzer"-Button → öffnet NeuerBenutzerDialog
    ├── BenutzerTabelle
    │   ├── Kopfzeile: Name | E-Mail | Rolle | Status | Aktionen
    │   └── BenutzerZeile (pro Nutzer)
    │       ├── Name (Vorname + Nachname)
    │       ├── E-Mail
    │       ├── Rollen-Badge  (Admin / Mitarbeiter)
    │       ├── Status-Badge  (Aktiv / Inaktiv)
    │       └── Aktionen-Dropdown
    │           ├── Passwort zurücksetzen  → PasswortResetDialog
    │           ├── Rolle ändern           → RolleÄndernDialog
    │           └── Benutzer deaktivieren  → DeaktivierenDialog
    └── Dialoge (modale Fenster, jeweils mit Abbrechen-Option)
        ├── NeuerBenutzerDialog
        │   └── Felder: Vorname, Nachname, E-Mail, Passwort, Rolle
        ├── PasswortResetDialog
        │   └── Felder: Neues Passwort, Passwort bestätigen
        ├── RolleÄndernDialog
        │   └── Feld: Neue Rolle auswählen (Dropdown)
        └── DeaktivierenDialog
            └── Warnmeldung (Zeitdaten bleiben erhalten)
```

### Datenspeicherung

**Neue Datenbanktabelle: `profiles`**

Ergänzt die von Supabase verwaltete Auth-Tabelle mit anwendungsspezifischen Daten:

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID (PK) | Identisch mit der Supabase Auth User-ID |
| first_name | Text | Vorname |
| last_name | Text | Nachname |
| role | Text | `'admin'` oder `'employee'` |
| is_active | Boolean | `true` = aktiv, `false` = deaktiviert (Soft-Delete) |
| created_at | Timestamp | Anlagezeitpunkt |
| updated_at | Timestamp | Letzter Änderungszeitpunkt |

**Keine separate Passwort-Speicherung** – Passwörter werden ausschließlich von Supabase Auth verwaltet (bcrypt-Hash).

### Seitenstruktur

| Route | Sichtbarkeit | Beschreibung |
|-------|-------------|--------------|
| `/admin` | Nur Admin-Rolle | Benutzerverwaltung |
| `/api/admin/users` | Nur Admin-Rolle (server) | Benutzer anlegen & auflisten |
| `/api/admin/users/[id]/password` | Nur Admin-Rolle (server) | Passwort zurücksetzen |
| `/api/admin/users/[id]/role` | Nur Admin-Rolle (server) | Rolle ändern |
| `/api/admin/users/[id]` | Nur Admin-Rolle (server) | Benutzer deaktivieren |

### Technische Entscheidungen

| Entscheidung | Warum |
|---|---|
| **`profiles`-Tabelle** für Rollen & Namen | Supabase Auth (`auth.users`) lässt sich nicht direkt um eigene Felder erweitern. Eine eigene Tabelle gibt uns volle Kontrolle. |
| **Supabase Admin API** (Service-Role-Key) für User-Verwaltung | Nur der Server-seitige Admin-Schlüssel darf Auth-Nutzer anlegen, Passwörter ändern und Konten löschen. Läuft ausschließlich in API-Routen – nie im Browser. |
| **Soft-Delete** (`is_active = false`) statt hartem Löschen | DSGVO-Konformität: Zeiteinträge eines Mitarbeiters müssen erhalten bleiben. Benutzer wird gesperrt, nicht gelöscht. |
| **Rollenprüfung in API-Routen** (server-seitig) | Client-seitiger Schutz allein ist unsicher. Jede API-Route liest die Rolle aus der `profiles`-Tabelle und verweigert bei Nicht-Admin den Zugriff. |
| **Erweiterung des Proxy (Routenwächter)** für `/admin` | Der bestehende `src/proxy.ts` wird ergänzt: Bei `/admin/*`-Routen wird zusätzlich zur Login-Prüfung die Admin-Rolle geprüft. Nicht-Admins werden zu `/dashboard` weitergeleitet. |
| **Shadcn/ui Table + Dialog** | Bereits installierte Komponenten werden verwendet – kein Custom-Code nötig. |

### Neue Pakete

Keine – Supabase JS ist bereits installiert und unterstützt die Admin API über den Service-Role-Key.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
