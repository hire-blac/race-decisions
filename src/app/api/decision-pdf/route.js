export const runtime = "nodejs";
import { DocxPdfGenerator } from "@/lib/docx-pdf-generator";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // Prepare data for DOCX PDF generator
    const pdfData = {
      driverName: body.Driver || body.driverName || 'N/A',
      carNumber: body.carNumber || body.CarNumber,
      teamName: body.Team || body.teamName || '',
      event: body.event || body.Event || 'race',
      trackName: body.trackName || body.TrackName,
      competitionName: body.competitionName || body.CompetitionName,
      cause: body.Cause || body.cause || 'N/A',
      penalty: body.Penalty || body.penalty || 'N/A',
      discretionary: body.discretionary || false,
      createdAt: new Date().toISOString(),
    };

    // Generate PDF as buffer (for immediate download)
    const pdfBuffer = await DocxPdfGenerator.generateDecisionPDFBuffer(pdfData);

    // Generate filename
    const filename = DocxPdfGenerator.generateFilename(pdfData);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate PDF', details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
