import { generateDecisionPDF } from "@/lib/pdf";
import { NextResponse } from "next/server";

export async function POST(req) {
  const data = await req.json();
  const pdf = await generateDecisionPDF(data);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=decision.pdf",
    },
  });
}
