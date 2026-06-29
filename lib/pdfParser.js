// lib/pdfParser.js
// Server-side PDF text extraction using pdf-parse.
// Handles: corrupt PDFs, image-only PDFs, empty PDFs, password-protected PDFs.
// IMPORTANT: This module runs only on the server (API routes).

import pdfParse from 'pdf-parse';

const MIN_MEANINGFUL_CHARS = 100; // A real resume has at least this much text

/**
 * Normalise extracted text:
 *  - Collapse multiple blank lines
 *  - Remove control characters (except newlines)
 *  - Trim
 */
function normaliseText(raw) {
  return raw
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\uFFFF]/g, ' ')  // strip control chars
    .replace(/[ \t]+/g, ' ')                                   // collapse spaces
    .replace(/\n{3,}/g, '\n\n')                               // max 2 blank lines
    .trim();
}

/**
 * Extract readable text from a PDF buffer.
 * @param {Buffer} buffer — raw bytes from the uploaded PDF
 * @returns {Promise<string>} Extracted, normalised text
 * @throws {Error} With a descriptive, user-friendly message
 */
export async function extractTextFromPDF(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty file received. Please upload a valid PDF.');
  }

  // Quick magic-bytes check — PDFs start with %PDF
  const magic = buffer.slice(0, 5).toString('ascii');
  if (!magic.startsWith('%PDF')) {
    throw new Error('File does not appear to be a valid PDF. Please upload a .pdf file.');
  }

  let data;
  try {
    data = await pdfParse(buffer, {
      // Disable test-file auto-loading (avoids the pdf-parse fs.readFileSync quirk)
      max: 0,
    });
  } catch (parseErr) {
    const msg = parseErr.message ?? '';
    if (msg.includes('password') || msg.includes('encrypted')) {
      throw new Error('This PDF is password-protected. Please remove the password and re-upload.');
    }
    if (msg.includes('Invalid PDF') || msg.includes('bad XRef') || msg.includes('Unexpected')) {
      throw new Error('The PDF appears to be corrupt or damaged. Please try exporting a fresh copy.');
    }
    // Generic parse failure
    throw new Error('Failed to read the PDF. Please make sure it is a valid, text-based PDF file.');
  }

  const raw  = data?.text ?? '';
  const text = normaliseText(raw);

  // Image-only scanned PDF — the parser returns blank text
  if (text.length < MIN_MEANINGFUL_CHARS) {
    throw new Error(
      'No text found in this PDF. It may be a scanned image rather than a text-based document. ' +
      'Please export your resume as a text-based PDF from your editor (Word, Google Docs, etc.).'
    );
  }

  return text;
}
