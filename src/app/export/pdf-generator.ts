import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Zeiteintrag } from '@/components/zeiterfassung/types'
import type { Abwesenheit } from '@/components/abwesenheiten/types'
import { berechneAnzahlTage } from '@/components/abwesenheiten/types'

interface PdfParams {
  userName: string
  zeitraum: string
  monat: string
  jahr: string
  eintraege: Zeiteintrag[]
  abwesenheiten: Abwesenheit[]
  filename: string
}

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

function formatDateDE(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`
}

function getWochentag(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return WOCHENTAGE[date.getDay()]
}

function formatDauer(dauer: number): string {
  const h = Math.floor(dauer)
  const min = Math.round((dauer - h) * 60)
  return `${h}:${String(min).padStart(2, '0')}`
}

export function generatePdf(params: PdfParams) {
  const { userName, zeitraum, eintraege, abwesenheiten, filename } = params

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14

  // --- Header ---
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Hofzeit \u2013 Zeiterfassung', margin, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mitarbeiter: ${userName}`, margin, 28)
  doc.text(`Zeitraum: ${zeitraum}`, margin, 34)

  const erstelltAm = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  doc.text(`Erstellt am: ${erstelltAm}`, pageWidth - margin, 28, { align: 'right' })

  let yPos = 42

  // --- Zeiteintraege Tabelle ---
  if (eintraege.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Zeiteintr\u00e4ge', margin, yPos)
    yPos += 2

    const zeitRows = eintraege.map((e) => [
      formatDateDE(e.datum),
      getWochentag(e.datum),
      formatDauer(e.dauer_stunden),
      e.taetigkeit_name ?? e.taetigkeit_freitext ?? '\u2013',
      e.kostenstelle_name || '\u2013',
      e.notiz ?? '\u2013',
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Datum', 'Wochentag', 'Dauer (Std.)', 'T\u00e4tigkeit', 'Kostenstelle', 'Notiz']],
      body: zeitRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 37, 36], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 24 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 8
  }

  // --- Abwesenheiten Tabelle ---
  if (abwesenheiten.length > 0) {
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Abwesenheiten', margin, yPos)
    yPos += 2

    const abwRows = abwesenheiten.map((a) => [
      a.typ === 'urlaub' ? 'Urlaub' : 'Krankheit',
      formatDateDE(a.startdatum),
      formatDateDE(a.enddatum),
      String(berechneAnzahlTage(a.startdatum, a.enddatum)),
      a.notiz ?? '\u2013',
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Typ', 'Von', 'Bis', 'Tage', 'Notiz']],
      body: abwRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 37, 36], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 22 },
        2: { cellWidth: 22 },
        3: { cellWidth: 15, halign: 'right' },
        4: { cellWidth: 'auto' },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 8
  }

  // --- Zusammenfassung ---
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Zusammenfassung', margin, yPos)
  yPos += 6

  const summaryRows: string[][] = []

  // Gesamtstunden
  const gesamtStunden = eintraege.reduce((sum, e) => sum + e.dauer_stunden, 0)
  summaryRows.push(['Gesamtarbeitsstunden', formatDauer(gesamtStunden)])

  // Stunden je Tätigkeit
  const stundenProTaetigkeit = new Map<string, number>()
  for (const e of eintraege) {
    const name = e.taetigkeit_name ?? e.taetigkeit_freitext ?? 'Ohne T\u00e4tigkeit'
    stundenProTaetigkeit.set(name, (stundenProTaetigkeit.get(name) ?? 0) + e.dauer_stunden)
  }
  if (stundenProTaetigkeit.size > 0) {
    summaryRows.push(['', ''])
    summaryRows.push(['Stunden je T\u00e4tigkeit', ''])
    for (const [name, stunden] of stundenProTaetigkeit) {
      summaryRows.push([`  ${name}`, formatDauer(stunden)])
    }
  }

  // Stunden je Kostenstelle
  const stundenProKostenstelle = new Map<string, number>()
  for (const e of eintraege) {
    const name = e.kostenstelle_name || 'Ohne Kostenstelle'
    stundenProKostenstelle.set(name, (stundenProKostenstelle.get(name) ?? 0) + e.dauer_stunden)
  }
  if (stundenProKostenstelle.size > 0) {
    summaryRows.push(['', ''])
    summaryRows.push(['Stunden je Kostenstelle', ''])
    for (const [name, stunden] of stundenProKostenstelle) {
      summaryRows.push([`  ${name}`, formatDauer(stunden)])
    }
  }

  // Urlaubs- und Krankheitstage
  const urlaubTage = abwesenheiten
    .filter((a) => a.typ === 'urlaub')
    .reduce((sum, a) => sum + berechneAnzahlTage(a.startdatum, a.enddatum), 0)
  const krankheitTage = abwesenheiten
    .filter((a) => a.typ === 'krankheit')
    .reduce((sum, a) => sum + berechneAnzahlTage(a.startdatum, a.enddatum), 0)

  summaryRows.push(['', ''])
  summaryRows.push(['Urlaubstage', String(urlaubTage)])
  summaryRows.push(['Krankheitstage', String(krankheitTage)])

  autoTable(doc, {
    startY: yPos,
    body: summaryRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'right' },
    },
    theme: 'plain',
  })

  // --- Save ---
  doc.save(filename)
}
