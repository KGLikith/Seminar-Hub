import { generateHallBookingReportPDF } from "@/actions/report/hallReports"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: { hallid: string } }
) {
  try {
    const pdfBuffer = await generateHallBookingReportPDF(params.hallid)

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
