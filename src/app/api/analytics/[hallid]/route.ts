import { generateHallBookingReportPDF } from "@/actions/report/hallReports"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ hallid: string }> }
) {
  try {
    const hallId = (await params).hallid
    const pdfBuffer = await generateHallBookingReportPDF(hallId)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hall-booking-report.pdf"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    )
  }
}
