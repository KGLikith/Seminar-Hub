"use server"

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import prisma from "@/lib/db"

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN_TOP = 60
const MARGIN_BOTTOM = 90
const MARGIN_LEFT = 50
const MARGIN_RIGHT = 50
const LEFT = MARGIN_LEFT
const RIGHT = PAGE_WIDTH - MARGIN_RIGHT
const WIDTH = RIGHT - LEFT
const LINE_GAP = 12
const SECTION_SPACING = 18
const SECTION_HEADER_HEIGHT = 22

async function fetchImageBytes(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Image fetch failed")
  return await res.arrayBuffer()
}

export async function generateBookingPDF(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      hall: true,
      teacher: true,
      logs: { orderBy: { created_at: "asc" } },
      media: true,
    },
  })

  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "completed") {
    throw new Error("Report allowed only for completed bookings")
  }

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN_TOP

  /* ================= HELPERS ================= */

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    y = PAGE_HEIGHT - MARGIN_TOP
  }

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      newPage()
    }
  }

  const drawTextBlock = (
    text: string,
    size = 10,
    isBold = false,
    color = rgb(0.2, 0.2, 0.2),
    spacingAfter = 8
  ) => {
    const paragraphs = String(text)
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue

      const words = paragraph.trim().split(/\s+/)
      let line = ""

      for (const word of words) {
        const testLine = line ? line + " " + word : word
        const measuringFont = isBold ? bold : font
        const width = measuringFont.widthOfTextAtSize(testLine, size)

        if (width > WIDTH) {
          if (line) {
            ensureSpace(LINE_GAP)
            page.drawText(line, {
              x: LEFT,
              y,
              size,
              font: isBold ? bold : font,
              color,
            })
            y -= LINE_GAP
          }
          line = word
        } else {
          line = testLine
        }
      }

      if (line.trim()) {
        ensureSpace(LINE_GAP)
        page.drawText(line, {
          x: LEFT,
          y,
          size,
          font: isBold ? bold : font,
          color,
        })
        y -= LINE_GAP
      }
    }

    y -= spacingAfter
  }

  const sectionHeader = (title: string) => {
    ensureSpace(SECTION_SPACING + SECTION_HEADER_HEIGHT + 10)

    page.drawLine({
      start: { x: LEFT, y },
      end: { x: RIGHT, y },
      thickness: 2,
      color: rgb(0.2, 0.4, 0.8),
    })
    y -= 12

    page.drawRectangle({
      x: LEFT,
      y: y - SECTION_HEADER_HEIGHT,
      width: WIDTH,
      height: SECTION_HEADER_HEIGHT,
      color: rgb(0.95, 0.96, 0.98),
    })

    page.drawText(title.toUpperCase(), {
      x: LEFT + 10,
      y: y - SECTION_HEADER_HEIGHT + 6,
      size: 11,
      font: bold,
      color: rgb(0.2, 0.4, 0.8),
    })

    y -= SECTION_HEADER_HEIGHT + 12
  }

  /* ================= HEADER ================= */

  drawTextBlock(
    "Seminar Hall Booking Report",
    22,
    true,
    rgb(0.15, 0.15, 0.15),
    10
  )

  page.drawLine({
    start: { x: LEFT, y },
    end: { x: RIGHT, y },
    thickness: 1.5,
    color: rgb(0.85, 0.85, 0.85),
  })
  y -= 14

  drawTextBlock(`Report ID: ${booking.id}`, 9, false, rgb(0.5, 0.5, 0.5), 4)
  drawTextBlock(
    `Generated: ${new Date().toLocaleString()}`,
    9,
    false,
    rgb(0.5, 0.5, 0.5),
    18
  )

  sectionHeader("Hall Details")
  drawTextBlock("Hall Name:", 10, true, rgb(0.3, 0.3, 0.3), 2)
  drawTextBlock(booking.hall.name, 10, false, rgb(0.2, 0.2, 0.2), 6)
  drawTextBlock("Location:", 10, true, rgb(0.3, 0.3, 0.3), 2)
  drawTextBlock(booking.hall.location, 10, false, rgb(0.2, 0.2, 0.2), 0)

  sectionHeader("Instructor Information")
  drawTextBlock("Name:", 10, true, rgb(0.3, 0.3, 0.3), 2)
  drawTextBlock(booking.teacher.name, 10, false, rgb(0.2, 0.2, 0.2), 6)
  drawTextBlock("Email:", 10, true, rgb(0.3, 0.3, 0.3), 0)
  drawTextBlock(booking.teacher.email, 10, false, rgb(0.2, 0.2, 0.2), 0)

  if (booking.session_summary) {
    sectionHeader("Session Summary")
    drawTextBlock(booking.session_summary, 10, false, rgb(0.2, 0.2, 0.2), 0)
  }

  if (booking.ai_summary) {
    sectionHeader("AI Generated Summary")
    drawTextBlock(String(booking.ai_summary), 10, false, rgb(0.2, 0.2, 0.2), 0)
  }

  const images = booking.media.filter(
    (m) => typeof m.url === "string" && m.url.startsWith("http")
  )

  if (images.length > 0) {
    sectionHeader("Session Media")

    let imageCounter = 0
    for (const img of images) {
      try {
        const bytes = await fetchImageBytes(img.url)
        const embedded = img.url.endsWith(".png")
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes)

        const maxWidth = WIDTH
        const maxHeight = 200
        const scale = Math.min(
          maxWidth / embedded.width,
          maxHeight / embedded.height
        )

        const imgWidth = embedded.width * scale
        const imgHeight = embedded.height * scale

        ensureSpace(imgHeight + 30)

        page.drawRectangle({
          x: LEFT - 2,
          y: y - imgHeight - 2,
          width: imgWidth + 4,
          height: imgHeight + 4,
          borderWidth: 1,
          borderColor: rgb(0.8, 0.8, 0.8),
        })

        page.drawImage(embedded, {
          x: LEFT,
          y: y - imgHeight,
          width: imgWidth,
          height: imgHeight,
        })

        imageCounter++
        y -= imgHeight + 18

        drawTextBlock(
          `Image ${imageCounter}: Session Documentation`,
          8,
          false,
          rgb(0.6, 0.6, 0.6),
          10
        )
      } catch {
        drawTextBlock(
          "⚠ Image could not be loaded",
          9,
          false,
          rgb(0.8, 0.2, 0.2),
          10
        )
      }
    }
  }

  /* ================= FOOTER ================= */

  const pageCount = pdfDoc.getPageCount()
  for (let i = 0; i < pageCount; i++) {
    const p = pdfDoc.getPage(i)
    const footerY = 40

    p.drawLine({
      start: { x: LEFT, y: footerY + 30 },
      end: { x: RIGHT, y: footerY + 30 },
      thickness: 1.5,
      color: rgb(0.85, 0.85, 0.85),
    })

    p.drawText("Seminar Hall Booking Report", {
      x: LEFT,
      y: footerY + 12,
      size: 8,
      font: bold,
      color: rgb(0.3, 0.3, 0.3),
    })

    p.drawText("Official Document - Confidential", {
      x: LEFT,
      y: footerY - 2,
      size: 7,
      font,
      color: rgb(0.6, 0.6, 0.6),
    })

    p.drawText(`Page ${i + 1} of ${pageCount}`, {
      x: RIGHT - 80,
      y: footerY + 12,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    })

    p.drawText(new Date().toLocaleDateString(), {
      x: RIGHT - 80,
      y: footerY - 2,
      size: 7,
      font,
      color: rgb(0.6, 0.6, 0.6),
    })
  }

  return Buffer.from(await pdfDoc.save())
}
