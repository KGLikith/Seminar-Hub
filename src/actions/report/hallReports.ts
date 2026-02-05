"use server"

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import prisma from "@/lib/db"

/* ================= PAGE ================= */

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842

const MARGIN_TOP = 50
const MARGIN_BOTTOM = 70
const MARGIN_LEFT = 40
const MARGIN_RIGHT = 40

const LEFT = MARGIN_LEFT
const RIGHT = PAGE_WIDTH - MARGIN_RIGHT
const WIDTH = RIGHT - LEFT

const FONT_SIZE = 9
const LINE_HEIGHT = 12
const CELL_PADDING = 4

/* ================= COLUMNS ================= */

const COLUMNS = [
  { key: "date", label: "Date", width: 55 },
  { key: "time", label: "Time", width: 90 },
  { key: "teacher", label: "Teacher", width: 70 },
  { key: "email", label: "Email", width: 130 },
  { key: "status", label: "Status", width: 55 },
  { key: "purpose", label: "Purpose", width: 0 }, // Will be calculated
]

// Calculate purpose column width dynamically
COLUMNS[5].width = WIDTH - COLUMNS.slice(0, 5).reduce((sum, col) => sum + col.width, 0)

/* ================= MAIN ================= */

export async function generateHallBookingReportPDF(hallId: string) {
  const hall = await prisma.seminarHall.findUnique({
    where: { id: hallId },
    include: {
      department: true,
      bookings: {
        orderBy: { booking_date: "desc" },
        include: {
          teacher: { select: { name: true, email: true } },
        },
      },
    },
  })

  if (!hall) throw new Error("Hall not found")

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN_TOP

  /* ================= HELPERS ================= */

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    y = PAGE_HEIGHT - MARGIN_TOP
    drawTableHeader()
  }

  const ensureSpace = (h: number) => {
    if (y - h < MARGIN_BOTTOM) newPage()
  }

  const wrapText = (text: string, maxWidth: number) => {
    const words = String(text || "—").split(/\s+/)
    let line = ""
    const lines: string[] = []
    const availableWidth = maxWidth - CELL_PADDING * 2

    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      const testWidth = font.widthOfTextAtSize(test, FONT_SIZE)
      
      if (testWidth > availableWidth) {
        if (line) lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    return lines.length > 0 ? lines : ["—"]
  }

  /* ================= HEADER ================= */

  page.drawText("Hall Booking Report", {
    x: LEFT,
    y,
    size: 20,
    font: bold,
  })
  y -= 24

  page.drawText(`Hall: ${hall.name}`, {
    x: LEFT,
    y,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })
  y -= 14

  page.drawText(
    `Location: ${hall.location} | Department: ${hall.department?.name ?? "N/A"} | Capacity: ${hall.seating_capacity}`,
    {
      x: LEFT,
      y,
      size: 9,
      font,
      color: rgb(0.45, 0.45, 0.45),
    }
  )
  y -= 12

  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: LEFT,
    y,
    size: 9,
    font,
    color: rgb(0.55, 0.55, 0.55),
  })
  y -= 24

  /* ================= TABLE HEADER ================= */

  const drawTableHeader = () => {
    ensureSpace(40)

    let x = LEFT

    page.drawText("Booking History", {
      x: LEFT,
      y,
      size: 13,
      font: bold,
      color: rgb(0.1, 0.3, 0.8),
    })
    y -= 14

    page.drawLine({
      start: { x: LEFT, y },
      end: { x: RIGHT, y },
      thickness: 2,
    })
    y -= 10

    for (const col of COLUMNS) {
      page.drawText(col.label, {
        x: x + CELL_PADDING,
        y,
        size: FONT_SIZE,
        font: bold,
      })
      x += col.width
    }

    y -= 10

    page.drawLine({
      start: { x: LEFT, y },
      end: { x: RIGHT, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    })
    y -= 12
  }

  drawTableHeader()

  /* ================= TABLE ROWS ================= */

  for (const booking of hall.bookings) {
    const rowData = {
      date: booking.booking_date.toLocaleDateString(),
      time: `${booking.start_time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} – ${booking.end_time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      teacher: booking.teacher?.name ?? "—",
      email: booking.teacher?.email ?? "—",
      status: booking.status,
      purpose: booking.purpose ?? "—",
    }

    // Pre-calculate wrapped lines for each column
    const cellLines = COLUMNS.map((col) => {
      const isWrapColumn = col.key === "purpose" || col.key === "email"
      const text = rowData[col.key as keyof typeof rowData]
      return isWrapColumn ? wrapText(text, col.width) : [text]
    })

    // Calculate row height based on max lines in any cell
    const maxLines = Math.max(...cellLines.map((l) => l.length))
    const rowHeight = maxLines * LINE_HEIGHT + 8

    ensureSpace(rowHeight)

    // Draw each cell
    let cellX = LEFT
    const rowStartY = y

    for (let colIdx = 0; colIdx < COLUMNS.length; colIdx++) {
      const col = COLUMNS[colIdx]
      const lines = cellLines[colIdx]
      
      // Draw cell lines vertically
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        page.drawText(lines[lineIdx], {
          x: cellX + CELL_PADDING,
          y: rowStartY - CELL_PADDING - lineIdx * LINE_HEIGHT,
          size: FONT_SIZE,
          font: col.key === "status" ? bold : font,
          color: col.key === "status" ? rgb(0.2, 0.4, 0.8) : rgb(0.2, 0.2, 0.2),
        })
      }
      
      cellX += col.width
    }

    // Move down and draw row separator
    y -= rowHeight

    page.drawLine({
      start: { x: LEFT, y },
      end: { x: RIGHT, y },
      thickness: 0.6,
      color: rgb(0.9, 0.9, 0.9),
    })

    y -= 6
  }

  /* ================= FOOTER ================= */

  const pageCount = pdfDoc.getPageCount()

  for (let i = 0; i < pageCount; i++) {
    const p = pdfDoc.getPage(i)
    p.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: RIGHT - 80,
      y: 30,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    })
  }

  return Buffer.from(await pdfDoc.save())
}
