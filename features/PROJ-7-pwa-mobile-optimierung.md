# PROJ-7: PWA & Mobile Optimierung

## Status: Planned
**Created:** 2026-02-22
**Last Updated:** 2026-02-22

## Dependencies
- Requires: PROJ-1 (Benutzerauthentifizierung) – Session-Management für "Eingeloggt bleiben"
- Requires: PROJ-4 (Zeiterfassung) – Mobile Bedienbarkeit der Kernfunktion
- Requires: PROJ-5 (Abwesenheitsverwaltung) – Mobile Bedienbarkeit

## Beschreibung
Die App soll als Progressive Web App (PWA) auf dem Homescreen von iPhone/Android installierbar sein und sich wie eine native App anfühlen. Menüführung, Formulare und alle Interaktionen werden für die Touch-Bedienung auf kleinen Displays optimiert. Zusätzlich können Nutzer die "Eingeloggt bleiben"-Funktion aktivieren, um 30 Tage lang ohne erneutes Login zu arbeiten.

## User Stories
- Als Mitarbeiter möchte ich die App auf meinem iPhone-Homescreen installieren, damit ich sie wie eine native App starten kann (kein Browser-UI sichtbar).
- Als Mitarbeiter möchte ich ein für Mobile geeignetes Navigationsmenü haben, damit ich schnell und mit dem Daumen zwischen den Bereichen wechseln kann.
- Als Mitarbeiter möchte ich, dass alle Formulare (Zeiteintrag, Abwesenheit) auf einem 375px-Bildschirm vollständig und komfortabel bedienbar sind.
- Als Mitarbeiter möchte ich beim Login „Eingeloggt bleiben" aktivieren können, damit ich mich auf meinem Smartphone nicht täglich neu anmelden muss.
- Als Mitarbeiter möchte ich, dass Schaltflächen und Eingabefelder groß genug für Fingertipp-Bedienung sind (min. 44×44px Touch-Target).
- Als Admin möchte ich die App ebenfalls auf dem Mobilgerät komfortabel bedienen können, falls ich unterwegs bin.

## Acceptance Criteria
- [ ] PWA-Manifest (`manifest.json`) vorhanden mit App-Name, Icons (192px, 512px), `display: standalone`, `start_url`, `theme_color` passend zum Logo
- [ ] App ist auf iPhone Safari über "Zum Home-Bildschirm hinzufügen" installierbar und startet ohne Browser-Navigation-Leiste
- [ ] Service Worker registriert (minimal: ermöglicht Offline-Fallback-Seite bei fehlender Verbindung)
- [ ] Bestehende Desktop-Seitenleiste wird auf Mobile durch eine Bottom Navigation (Tab Bar) oder ein Hamburger-Menü ersetzt, das mit dem Daumen gut erreichbar ist
- [ ] Alle Menüpunkte und Navigationselemente auf Mobile mit einer Hand erreichbar (unterer Bildschirmbereich)
- [ ] Alle Eingabefelder, Buttons und Selects haben mindestens 44×44px Touch-Target
- [ ] Formulare nutzen mobile-optimierte Input-Typen (`type="date"`, `type="time"`, `inputmode="numeric"`)
- [ ] Kein horizontales Scrollen auf 375px Viewport (iPhone SE)
- [ ] Login-Seite enthält Checkbox „Eingeloggt bleiben (30 Tage)"
- [ ] Bei aktiviertem „Eingeloggt bleiben" bleibt die Session 30 Tage aktiv (Supabase Session-TTL oder persistentes Cookie)
- [ ] "Eingeloggt bleiben" funktioniert nach App-Neustart vom Homescreen (PWA-Modus)
- [ ] Logout löscht die persistente Session sofort

## Edge Cases
- Was passiert, wenn der Service Worker ein Update erhält? → Nutzer wird über neues Update informiert und kann neu laden.
- Was passiert, wenn der Nutzer offline ist? → Offline-Fallback-Seite wird angezeigt mit Hinweis „Keine Internetverbindung".
- Was passiert nach 30 Tagen „Eingeloggt bleiben"? → Session läuft ab, Nutzer wird zur Login-Seite weitergeleitet.
- Was passiert, wenn der Nutzer sich auf einem anderen Gerät ausloggt? → Die persistente Session auf dem Mobilgerät bleibt aktiv (gerätebezogen).
- Was passiert, wenn das Gerät sehr klein ist (320px)? → App muss auch auf 320px ohne horizontales Scrollen funktionieren.
- Was passiert, wenn Safari auf iOS die PWA-Manifest-Features nicht vollständig unterstützt? → Graceful Degradation, App funktioniert als normale Webseite.

## Technical Requirements
- PWA-kompatibel: Safari iOS 16+, Chrome Android 100+
- Offline-Fallback (kein vollständiger Offline-Modus erforderlich)
- Lighthouse PWA-Score ≥ 80
- Touch-Targets ≥ 44×44px (Apple HIG / WCAG 2.5.5)
- Session-TTL für "Eingeloggt bleiben": 30 Tage via Supabase `auth.setSession` oder `persistSession`

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
