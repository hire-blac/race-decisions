import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * PDF Generator for Race Decisions using pdf-lib
 *
 * This class generates professional PDF documents using:
 * - pdf-lib for direct PDF creation (no external dependencies)
 * - Works perfectly in serverless environments (Vercel, AWS Lambda, etc.)
 */
export class DocxPdfGenerator {
  /**
   * Generate a Decision PDF and return as Buffer
   * @param {Object} data - Decision data
   * @param {string} data.driverName - Driver name
   * @param {number} data.carNumber - Car number
   * @param {string} data.teamName - Team name
   * @param {string} data.event - Event type (race/qualifying/practice)
   * @param {string} data.trackName - Track/circuit name
   * @param {string} data.competitionName - Competition/championship name
   * @param {string} data.cause - Cause/incident description
   * @param {string} data.penalty - Penalty description
   * @param {boolean} data.discretionary - Is penalty discretionary
   * @param {string} data.createdAt - Date/time of decision
   * @returns {Promise<Buffer>} PDF as Buffer
   */
  static async generateDecisionPDFBuffer(data) {
    // Prepare template data
    const templateData = this.prepareTemplateData(data);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();

    // Embed fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    let yPosition = height - 60;
    const leftMargin = 50;
    const rightMargin = width - 50;
    const contentWidth = rightMargin - leftMargin;

    // Title: "STEWARDS DECISION"
    const titleText = 'STEWARDS DECISION';
    const titleSize = 24;
    const titleWidth = boldFont.widthOfTextAtSize(titleText, titleSize);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: yPosition,
      size: titleSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 50;

    // Decision Details Table
    const drawTableRow = (label, value, y) => {
      const labelX = leftMargin + 10;
      const valueX = leftMargin + 150;
      const rowHeight = 20;

      // Draw row background (alternating for visual clarity)
      page.drawRectangle({
        x: leftMargin,
        y: y - 15,
        width: contentWidth,
        height: rowHeight,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      });

      // Draw label
      page.drawText(label, {
        x: labelX,
        y: y,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Draw value (wrap if needed)
      const maxValueWidth = contentWidth - 160;
      const wrappedValue = this.wrapText(value, regularFont, 11, maxValueWidth);
      page.drawText(wrappedValue, {
        x: valueX,
        y: y,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      return y - rowHeight;
    };

    // Table header
    page.drawRectangle({
      x: leftMargin,
      y: yPosition - 15,
      width: contentWidth,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
    });
    page.drawText('DECISION DETAILS', {
      x: leftMargin + 10,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Table rows
    yPosition = drawTableRow('Driver:', templateData.driverName, yPosition);
    yPosition = drawTableRow('Car Number:', templateData.carNumber, yPosition);
    yPosition = drawTableRow('Team:', templateData.teamName, yPosition);
    yPosition = drawTableRow('Event:', templateData.eventType, yPosition);
    yPosition = drawTableRow('Track:', templateData.trackName, yPosition);
    yPosition = drawTableRow('Competition:', templateData.competitionName, yPosition);

    yPosition -= 30;

    // INCIDENT DETAILS Section
    page.drawText('INCIDENT DETAILS', {
      x: leftMargin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;

    page.drawText('Cause:', {
      x: leftMargin,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Wrap cause text
    const causeLines = this.wrapTextMultiline(templateData.cause, regularFont, 11, contentWidth);
    for (const line of causeLines) {
      page.drawText(line, {
        x: leftMargin,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }

    yPosition -= 20;

    // PENALTY Section
    page.drawText('PENALTY', {
      x: leftMargin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 25;

    page.drawText('Penalty Imposed:', {
      x: leftMargin,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Wrap penalty text
    const penaltyLines = this.wrapTextMultiline(templateData.penalty, regularFont, 11, contentWidth);
    for (const line of penaltyLines) {
      page.drawText(line, {
        x: leftMargin,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }

    yPosition -= 10;

    // Discretionary Penalty
    const discretionaryText = `Discretionary Penalty: ${templateData.discretionary}`;
    page.drawText(discretionaryText, {
      x: leftMargin,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Footer - Signature Line
    const signatureLine = '_'.repeat(50);
    const signatureLineWidth = regularFont.widthOfTextAtSize(signatureLine, 11);
    page.drawText(signatureLine, {
      x: (width - signatureLineWidth) / 2,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Stewards Signature
    const signatureText = 'Stewards Signature';
    const signatureTextWidth = italicFont.widthOfTextAtSize(signatureText, 11);
    page.drawText(signatureText, {
      x: (width - signatureTextWidth) / 2,
      y: yPosition,
      size: 11,
      font: italicFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Date & Time
    const dateTimeText = `Date & Time: ${templateData.createdAt}`;
    const dateTimeWidth = regularFont.widthOfTextAtSize(dateTimeText, 11);
    page.drawText(dateTimeText, {
      x: (width - dateTimeWidth) / 2,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Legacy method for compatibility - now just calls generateDecisionPDFBuffer
   * @deprecated Use generateDecisionPDFBuffer instead
   */
  static async generateDecisionPDF(data, outputFilename) {
    const buffer = await this.generateDecisionPDFBuffer(data);
    return {
      pdfPath: `/pdfs/decisions/${outputFilename}.pdf`,
      docxPath: null, // No DOCX in pdf-lib approach
    };
  }

  /**
   * Prepare template data from decision data
   * @private
   */
  static prepareTemplateData(data) {
    // Format date
    const createdDate = data.createdAt
      ? new Date(data.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

    return {
      driverName: data.driverName || 'N/A',
      carNumber: data.carNumber ? `#${data.carNumber}` : 'N/A',
      teamName: data.teamName || 'N/A',
      event: data.event || 'Race',
      trackName: data.trackName || 'N/A',
      competitionName: data.competitionName || 'N/A',
      cause: data.cause || 'N/A',
      penalty: data.penalty || 'N/A',
      discretionary: data.discretionary ? 'Yes' : 'No',
      createdAt: createdDate,
      eventType: this.formatEventType(data.event),
    };
  }

  /**
   * Format event type for display
   * @private
   */
  static formatEventType(event) {
    const eventMap = {
      'race': 'Race',
      'qualifying': 'Qualifying',
      'practice': 'Practice',
      'sprint': 'Sprint',
    };
    return eventMap[event?.toLowerCase()] || event || 'Race';
  }

  /**
   * Helper: Generate filename from decision data
   * @param {Object} data - Decision data
   * @returns {string} Sanitized filename
   */
  static generateFilename(data) {
    const driverName = (data.driverName || 'unknown')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    const timestamp = Date.now();
    return `decision_${driverName}_${timestamp}`;
  }

  /**
   * Wrap text to fit within a max width (single line)
   * @private
   */
  static wrapText(text, font, size, maxWidth) {
    const words = text.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && line) {
        return line + '...';
      }
      line = testLine;
    }

    return line;
  }

  /**
   * Wrap text to fit within a max width (multiple lines)
   * @private
   */
  static wrapTextMultiline(text, font, size, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
