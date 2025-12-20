import { createReport } from 'docx-templates';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { tmpdir } from 'os';

/**
 * DOCX-based PDF Generator for Race Decisions
 *
 * This class generates professional PDF documents using:
 * 1. DOCX templates with placeholders
 * 2. docx-templates library to fill data
 * 3. LibreOffice headless mode to convert DOCX → PDF
 */
export class DocxPdfGenerator {
  static TEMPLATE_PATH = join(process.cwd(), 'templates', 'decision_template.docx');
  // Use /tmp for serverless environments (Vercel, AWS Lambda, etc.)
  static TEMP_DIR = join(tmpdir(), 'race-decision-temp');
  static OUTPUT_DIR = join(tmpdir(), 'race-decision-output');

  /**
   * Generate a Decision PDF
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
   * @param {string} outputFilename - Filename for the PDF (without extension)
   * @returns {Promise<{pdfPath: string, docxPath: string}>} Paths to generated files
   */
  static async generateDecisionPDF(data, outputFilename) {
    try {
      // Ensure temp and output directories exist
      this.ensureDirectoriesExist();

      // Validate template exists
      if (!existsSync(this.TEMPLATE_PATH)) {
        throw new Error(`Template not found at: ${this.TEMPLATE_PATH}`);
      }

      // Prepare data for template
      const templateData = this.prepareTemplateData(data);

      // Read DOCX template
      const template = readFileSync(this.TEMPLATE_PATH);

      // Fill template with data
      console.log('Filling DOCX template with data...');
      const filledDocx = await createReport({
        template,
        data: templateData,
        cmdDelimiter: ['{{', '}}'],
        processLineBreaks: true,
      });

      // Save filled DOCX to temp directory
      const tempDocxPath = join(this.TEMP_DIR, `${outputFilename}.docx`);
      writeFileSync(tempDocxPath, filledDocx);
      console.log(`Temporary DOCX created: ${tempDocxPath}`);

      // Convert DOCX to PDF using LibreOffice
      console.log('Converting DOCX to PDF...');
      await this.convertDocxToPdf(tempDocxPath, this.OUTPUT_DIR);

      const pdfPath = join(this.OUTPUT_DIR, `${outputFilename}.pdf`);
      console.log(`PDF generated successfully: ${pdfPath}`);

      return {
        pdfPath: `/pdfs/decisions/${outputFilename}.pdf`,
        docxPath: tempDocxPath,
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate a Decision PDF and return as Buffer (for immediate download)
   * @param {Object} data - Decision data
   * @returns {Promise<Buffer>} PDF as Buffer
   */
  static async generateDecisionPDFBuffer(data) {
    const timestamp = Date.now();
    const filename = `decision_${timestamp}`;

    const result = await this.generateDecisionPDF(data, filename);

    // Read the generated PDF
    const pdfPath = join(this.OUTPUT_DIR, `${filename}.pdf`);
    const pdfBuffer = readFileSync(pdfPath);

    // Clean up temp files
    try {
      if (existsSync(result.docxPath)) unlinkSync(result.docxPath);
      if (existsSync(pdfPath)) unlinkSync(pdfPath);
    } catch (error) {
      console.warn('Could not delete temp files:', error);
    }

    return pdfBuffer;
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
      // Additional computed fields
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
   * Ensure temp and output directories exist
   * @private
   */
  static ensureDirectoriesExist() {
    if (!existsSync(this.TEMP_DIR)) {
      mkdirSync(this.TEMP_DIR, { recursive: true });
    }
    if (!existsSync(this.OUTPUT_DIR)) {
      mkdirSync(this.OUTPUT_DIR, { recursive: true });
    }
  }

  /**
   * Convert DOCX to PDF using LibreOffice headless
   * @private
   */
  static convertDocxToPdf(docxPath, outputDir) {
    return new Promise((resolve, reject) => {
      const process = spawn('libreoffice', [
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', outputDir,
        docxPath,
      ]);

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`PDF conversion failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to start LibreOffice: ${error.message}`));
      });

      // 60 second timeout
      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error('PDF conversion timed out after 60 seconds'));
      }, 60000);

      process.on('close', () => clearTimeout(timeout));
    });
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
}

/**
 * Data interface for Decision PDF
 * @typedef {Object} DecisionPDFData
 * @property {string} driverName - Driver name
 * @property {number} carNumber - Car number
 * @property {string} teamName - Team name
 * @property {string} event - Event type (race/qualifying/practice)
 * @property {string} trackName - Track/circuit name
 * @property {string} competitionName - Competition/championship name
 * @property {string} cause - Cause/incident description
 * @property {string} penalty - Penalty description
 * @property {boolean} discretionary - Is penalty discretionary
 * @property {string} createdAt - Date/time of decision
 */
