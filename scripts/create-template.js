import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Create a DOCX template for Stewards Decision
 * This template uses {{placeholders}} that will be filled by docx-templates
 */
async function createDecisionTemplate() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: 'STEWARDS DECISION',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Decision Information Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'DECISION DETAILS', bold: true })],
                    columnSpan: 2,
                  }),
                ],
              }),
              // Driver Name
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Driver:', bold: true })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '{{driverName}}' })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              // Car Number
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Car Number:', bold: true })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '{{carNumber}}' })],
                  }),
                ],
              }),
              // Team
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Team:', bold: true })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '{{teamName}}' })],
                  }),
                ],
              }),
              // Event
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Event:', bold: true })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '{{eventType}}' })],
                  }),
                ],
              }),
              // Track Name
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Track:', bold: true })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '{{trackName}}' })],
                  }),
                ],
              }),
              // Competition Name
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Competition:', bold: true })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '{{competitionName}}' })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 300 } }),

          // Incident Details
          new Paragraph({
            text: 'INCIDENT DETAILS',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Cause: ', bold: true }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: '{{cause}}',
            spacing: { after: 300 },
          }),

          // Penalty Section
          new Paragraph({
            text: 'PENALTY',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Penalty Imposed: ', bold: true }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: '{{penalty}}',
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Discretionary Penalty: ', bold: true }),
              new TextRun({ text: '{{discretionary}}' }),
            ],
            spacing: { after: 400 },
          }),

          // Footer
          new Paragraph({ text: '', spacing: { after: 400 } }),

          new Paragraph({
            text: '___________________________________',
            alignment: AlignmentType.CENTER,
          }),

          new Paragraph({
            text: 'Stewards Signature',
            alignment: AlignmentType.CENTER,
            italics: true,
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Date & Time: ', bold: true }),
              new TextRun({ text: '{{createdAt}}' }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  // Save the document
  const buffer = await Packer.toBuffer(doc);
  const outputPath = join(process.cwd(), 'templates', 'decision_template.docx');

  writeFileSync(outputPath, buffer);

  console.log(`✅ Template created successfully at: ${outputPath}`);
  console.log(`
📝 Template Placeholders:
  - {{driverName}}   - Driver's full name
  - {{carNumber}}    - Car number (e.g., #44)
  - {{teamName}}        - Team name
  - {{eventType}}       - Event type (Race/Qualifying/Practice)
  - {{trackName}}       - Track/circuit name (e.g., Monza)
  - {{competitionName}} - Competition name (e.g., F1 World Championship)
  - {{cause}}           - Incident cause/description
  - {{penalty}}      - Penalty imposed
  - {{discretionary}}- Whether penalty is discretionary (Yes/No)
  - {{createdAt}}    - Date and time of decision

You can now edit this template in Microsoft Word or LibreOffice Writer to customize the layout!
  `);
}

createDecisionTemplate().catch(console.error);
