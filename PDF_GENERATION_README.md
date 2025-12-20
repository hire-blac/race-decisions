# PDF Generation System - Race Decision

## Overview

This project uses a **DOCX-based PDF generation system** for creating professional Stewards Decision documents.

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Template Engine** | `docx-templates` (v4.14.1) | Fills placeholders in DOCX files |
| **PDF Converter** | LibreOffice (headless mode) | Converts DOCX to PDF |
| **Template Creation** | `docx` (v8.5.0) | Creates DOCX templates programmatically |
| **Backend** | Next.js 16 | API routes and server-side logic |
| **Database** | PostgreSQL + Prisma ORM | Stores teams, drivers, and penalties |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│  (React Components - Decision Form)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP POST /api/decision-pdf
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               API ROUTE HANDLER                              │
│  /src/app/api/decision-pdf/route.js                         │
│  - Receives decision data                                    │
│  - Calls PDF generator                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ generateDecisionPDFBuffer()
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          DOCX PDF GENERATOR CLASS                            │
│  /src/lib/docx-pdf-generator.js                             │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │ 1. READ TEMPLATE                                │         │
│  │    templates/decision_template.docx            │         │
│  └──────────────────┬─────────────────────────────┘         │
│                     │                                         │
│                     ▼                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │ 2. PREPARE DATA                                 │         │
│  │    - Format dates                              │         │
│  │    - Format event type                         │         │
│  │    - Format car number                         │         │
│  └──────────────────┬─────────────────────────────┘         │
│                     │                                         │
│                     ▼                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │ 3. FILL TEMPLATE (docx-templates)              │         │
│  │    createReport({                               │         │
│  │      template: Buffer,                          │         │
│  │      data: Object,                              │         │
│  │      cmdDelimiter: ['{{', '}}']                │         │
│  │    })                                            │         │
│  └──────────────────┬─────────────────────────────┘         │
│                     │                                         │
│                     ▼                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │ 4. SAVE FILLED DOCX                             │         │
│  │    temp/decision_*.docx                        │         │
│  └──────────────────┬─────────────────────────────┘         │
│                     │                                         │
│                     ▼                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │ 5. CONVERT TO PDF (LibreOffice)                │         │
│  │    libreoffice --headless --convert-to pdf     │         │
│  └──────────────────┬─────────────────────────────┘         │
│                     │                                         │
│                     ▼                                         │
│  ┌────────────────────────────────────────────────┐         │
│  │ 6. RETURN PDF BUFFER                            │         │
│  │    (for immediate download)                    │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
race-decision/
├── src/
│   ├── lib/
│   │   └── docx-pdf-generator.js          ← PDF generator class
│   └── app/
│       └── api/
│           └── decision-pdf/
│               └── route.js               ← PDF API endpoint
│
├── templates/
│   └── decision_template.docx             ← DOCX template with placeholders
│
├── temp/                                   ← Temporary DOCX files
│   └── decision_*.docx
│
├── public/
│   └── pdfs/
│       └── decisions/                     ← Generated PDF files
│           └── decision_*.pdf
│
└── scripts/
    ├── create-template.js                 ← Template creation script
    └── test-pdf-generation.js             ← Test script
```

---

## Usage

### 1. Generate PDF via API

```javascript
const response = await fetch('/api/decision-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    Driver: "Lewis Hamilton",
    carNumber: 44,
    Team: "Mercedes AMG F1",
    event: "race",
    Cause: "Causing a collision",
    Penalty: "5-second time penalty",
    discretionary: false,
  }),
});

const blob = await response.blob();
window.open(URL.createObjectURL(blob));
```

### 2. Generate PDF Programmatically

```javascript
import { DocxPdfGenerator } from '@/lib/docx-pdf-generator';

const pdfData = {
  driverName: "Max Verstappen",
  carNumber: 33,
  teamName: "Red Bull Racing",
  event: "qualifying",
  cause: "Impeding another driver",
  penalty: "Grid penalty - 3 places",
  discretionary: true,
  createdAt: new Date().toISOString(),
};

// Generate and save to file
const result = await DocxPdfGenerator.generateDecisionPDF(pdfData, 'decision_verstappen');
console.log(`PDF saved to: ${result.pdfPath}`);

// Or generate as buffer for download
const pdfBuffer = await DocxPdfGenerator.generateDecisionPDFBuffer(pdfData);
```

---

## Template Variables

The DOCX template uses the following placeholders:

| Variable | Type | Example | Description |
|----------|------|---------|-------------|
| `{{driverName}}` | string | "Lewis Hamilton" | Driver's full name |
| `{{carNumber}}` | string | "#44" | Car number |
| `{{teamName}}` | string | "Mercedes AMG F1" | Team name |
| `{{eventType}}` | string | "Race" | Event type (formatted) |
| `{{cause}}` | string | "Causing a collision" | Incident description |
| `{{penalty}}` | string | "5-second time penalty" | Penalty imposed |
| `{{discretionary}}` | string | "Yes" / "No" | Is discretionary penalty |
| `{{createdAt}}` | string | "December 20, 2025, 05:00 PM" | Decision date/time |

---

## Editing the Template

1. Open the template in Microsoft Word or LibreOffice Writer:
   ```bash
   libreoffice templates/decision_template.docx
   ```

2. Edit the layout, styling, and text as needed

3. Keep the `{{placeholders}}` intact where you want data inserted

4. Save the file

5. Test the changes:
   ```bash
   node scripts/test-pdf-generation.js
   ```

---

## Creating a New Template

To regenerate the template from scratch:

```bash
node scripts/create-template.js
```

This will create a new `decision_template.docx` in the `templates/` directory.

---

## Testing

Run the test script to verify PDF generation:

```bash
node scripts/test-pdf-generation.js
```

This will:
- Generate a test PDF with sample data
- Save it to `public/pdfs/decisions/`
- Display the file paths

---

## LibreOffice Installation

The system requires LibreOffice for DOCX → PDF conversion.

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y libreoffice
```

### Verify Installation
```bash
libreoffice --version
```

---

## API Reference

### POST /api/decision-pdf

Generate a decision PDF.

**Request Body:**
```json
{
  "Driver": "Lewis Hamilton",
  "carNumber": 44,
  "Team": "Mercedes AMG F1",
  "event": "race",
  "Cause": "Causing a collision",
  "Penalty": "5-second time penalty",
  "discretionary": false
}
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="decision_Lewis_Hamilton_1734712800000.pdf"
[PDF Binary Data]
```

---

## Troubleshooting

### Template Not Found
```bash
# Verify template exists
ls -la templates/decision_template.docx

# Recreate template
node scripts/create-template.js
```

### LibreOffice Not Installed
```bash
# Check if installed
which libreoffice

# Install
sudo apt-get install -y libreoffice
```

### PDF Conversion Timeout
- Increase timeout in `docx-pdf-generator.js` (default: 60 seconds)
- Check system resources (RAM, CPU)
- Kill hung processes: `pkill -9 soffice.bin`

### Placeholders Not Filled
- Ensure placeholder syntax is `{{variableName}}`
- Check that variable names match exactly
- Verify data is being passed correctly

---

## Dependencies

```json
{
  "docx-templates": "^4.14.1",  // Template filling
  "docx": "^8.5.0"               // Template creation (dev)
}
```

System requirements:
- LibreOffice 7.x or higher
- Node.js 18.x or higher

---

## Best Practices

1. **Clean up temp files** - The generator automatically deletes temp DOCX files after PDF generation
2. **Error handling** - Always wrap PDF generation in try-catch blocks
3. **Filename sanitization** - Use `generateFilename()` helper for safe filenames
4. **Performance** - LibreOffice conversion takes 2-5 seconds per PDF
5. **Concurrent requests** - Consider implementing a queue for high-volume scenarios

---

## Benefits Over pdf-lib

✅ **Template-based** - Non-developers can edit templates in Word
✅ **Professional formatting** - Rich text, tables, images, headers/footers
✅ **Maintainable** - Templates are separate from code
✅ **High-fidelity** - LibreOffice ensures perfect PDF conversion
✅ **Extensible** - Easy to add logos, signatures, complex layouts

---

**Last Updated:** December 20, 2025
