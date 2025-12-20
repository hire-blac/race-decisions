import { DocxPdfGenerator } from '../src/lib/docx-pdf-generator.js';

/**
 * Test script for PDF generation
 * Run with: node scripts/test-pdf-generation.js
 */
async function testPDFGeneration() {
  console.log('🧪 Testing DOCX-based PDF Generation...\n');

  const testData = {
    driverName: "Lewis Hamilton",
    carNumber: 44,
    teamName: "Mercedes AMG F1",
    event: "race",
    trackName: "Monza",
    competitionName: "Formula 1 World Championship",
    cause: "Causing a collision with another car",
    penalty: "5-second time penalty",
    discretionary: false,
    createdAt: new Date().toISOString(),
  };

  try {
    console.log('📄 Test Data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('\n🔄 Generating PDF...\n');

    const filename = `test_${Date.now()}`;
    const result = await DocxPdfGenerator.generateDecisionPDF(testData, filename);

    console.log('✅ PDF Generation Successful!\n');
    console.log('📁 Files created:');
    console.log(`   DOCX: ${result.docxPath}`);
    console.log(`   PDF:  ${result.pdfPath}`);
    console.log('\n💡 You can find the generated PDF in: public/pdfs/decisions/');
    console.log('💡 You can find the temporary DOCX in: temp/');

  } catch (error) {
    console.error('\n❌ PDF Generation Failed!');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

testPDFGeneration();
