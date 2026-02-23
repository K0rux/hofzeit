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

// Brand colors from Hofzeit logo
const COLOR_PRIMARY: [number, number, number] = [27, 79, 138]   // #1B4F8A
const COLOR_PRIMARY_LIGHT: [number, number, number] = [234, 241, 249] // very light blue for alternating rows
const COLOR_WHITE: [number, number, number] = [255, 255, 255]

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

async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/hofzeit_logo.png')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function addPageFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150)
    doc.text(`Seite ${i} von ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
  }
  // Reset text color
  doc.setTextColor(0)
}

export async function generatePdf(params: PdfParams) {
  const { userName, zeitraum, eintraege, abwesenheiten, filename } = params

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14

  // Load logo
  const logoBase64 = await loadLogoBase64()

  // --- Header ---
  let headerY = 16
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', margin, headerY - 4, 12, 12)
  }

  const titleX = logoBase64 ? margin + 15 : margin
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLOR_PRIMARY)
  doc.text('Hofzeit \u2013 Zeiterfassung', titleX, headerY + 4)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80)
  doc.text(`Mitarbeiter: ${userName}`, margin, headerY + 14)
  doc.text(`Zeitraum: ${zeitraum}`, margin, headerY + 20)

  const erstelltAm = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  doc.text(`Erstellt am: ${erstelltAm}`, pageWidth - margin, headerY + 14, { align: 'right' })

  // Separator line
  doc.setDrawColor(...COLOR_PRIMARY)
  doc.setLineWidth(0.5)
  doc.line(margin, headerY + 24, pageWidth - margin, headerY + 24)

  doc.setTextColor(0)
  let yPos = headerY + 30

  // --- Zeiteintraege Tabelle ---
  if (eintraege.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLOR_PRIMARY)
    doc.text('Zeiteintr\u00e4ge', margin, yPos)
    doc.setTextColor(0)
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
      headStyles: { fillColor: COLOR_PRIMARY, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: COLOR_PRIMARY_LIGHT },
      bodyStyles: { fillColor: COLOR_WHITE },
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
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLOR_PRIMARY)
    doc.text('Abwesenheiten', margin, yPos)
    doc.setTextColor(0)
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
      headStyles: { fillColor: COLOR_PRIMARY, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: COLOR_PRIMARY_LIGHT },
      bodyStyles: { fillColor: COLOR_WHITE },
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
  doc.setTextColor(...COLOR_PRIMARY)
  doc.text('Zusammenfassung', margin, yPos)
  doc.setTextColor(0)
  yPos += 6

  const summaryRows: string[][] = []

  // Gesamtstunden
  const gesamtStunden = eintraege.reduce((sum, e) => sum + e.dauer_stunden, 0)
  summaryRows.push(['Gesamtarbeitsstunden', formatDauer(gesamtStunden)])

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

  // --- Page Footer ---
  addPageFooter(doc)

  // --- Save ---
  doc.save(filename)
}
