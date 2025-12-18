import { PDFDocument, StandardFonts } from "pdf-lib";

export async function generateDecisionPDF(data) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  let y = 750;

  page.drawText("Stewards Decision", {
    x: 50,
    y,
    size: 18,
    font,
  });

  y -= 50;

  Object.entries(data).forEach(([key, value]) => {
    page.drawText(`${key}: ${value}`, {
      x: 50,
      y,
      size: 12,
      font,
    });
    y -= 25;
  });

  return pdf.save();
}
