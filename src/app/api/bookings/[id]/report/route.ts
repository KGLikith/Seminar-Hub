import { generateBookingPDF } from "@/actions/report/bookingReports"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  {params}: { params: Promise<{ id: string }>}
) {
  try {
    const id = (await params).id
    const pdfBuffer = await generateBookingPDF(id)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking-${id}.pdf"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    )
  }
}
