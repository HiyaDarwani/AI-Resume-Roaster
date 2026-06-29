// pages/api/upload.js
// Handles multipart PDF upload → extracts text via pdf-parse
// Security: file type whitelist, size limit, no API keys in client bundle

import formidable from 'formidable';
import fs         from 'fs';
import path       from 'path';
import { extractTextFromPDF } from '../../lib/pdfParser';

// Disable Next.js body parser — formidable handles the stream directly
export const config = { api: { bodyParser: false } };

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME  = ['application/pdf', 'application/x-pdf'];
const ALLOWED_EXT   = ['.pdf'];

/**
 * Parse the incoming multipart request with formidable.
 * Returns { file } or throws on error.
 */
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize:   MAX_FILE_SIZE,
      maxFields:     1,
      maxFiles:      1,
      keepExtensions: true,
      filter:        ({ mimetype }) => {
        // Allow only PDF MIME types at the formidable level
        return ALLOWED_MIME.includes(mimetype?.toLowerCase() ?? '');
      },
    });

    form.parse(req, (err, _fields, files) => {
      if (err) {
        // formidable's size-exceeded error code
        if (err.code === 1009 || err.message?.includes('maxFileSize')) {
          return reject(new Error(`File too large. Maximum allowed size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`));
        }
        return reject(new Error('Upload failed: ' + (err.message || 'unknown error')));
      }
      const file = files.resume?.[0] ?? files.resume;
      if (!file) return reject(new Error('No file uploaded. Please select a PDF.'));
      resolve({ file });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let tmpPath;
  try {
    // ── 1. Parse upload ──
    const { file } = await parseForm(req);
    tmpPath         = file.filepath;

    // ── 2. Validate extension (defence in depth) ──
    const ext = path.extname(file.originalFilename ?? '').toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return res.status(400).json({
        error: `Invalid file type "${ext || 'none'}". Only PDF files are accepted.`,
      });
    }

    // ── 3. Validate MIME type ──
    const mime = (file.mimetype ?? '').toLowerCase();
    if (!ALLOWED_MIME.includes(mime)) {
      return res.status(400).json({
        error: 'File does not appear to be a valid PDF. Check your file and try again.',
      });
    }

    // ── 4. Check actual file size (double-check after parse) ──
    const { size } = fs.statSync(tmpPath);
    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `File size (${(size / 1024 / 1024).toFixed(1)} MB) exceeds the ${MAX_FILE_SIZE / 1024 / 1024} MB limit.`,
      });
    }

    // ── 5. Read buffer & extract text ──
    const buffer     = fs.readFileSync(tmpPath);
    const resumeText = await extractTextFromPDF(buffer);

    return res.status(200).json({
      success:    true,
      resumeText,
      characterCount: resumeText.length,
      fileSize:   size,
    });

  } catch (err) {
    console.error('[upload] Error:', err.message);

    // Map known error types to friendly responses
    const msg = err.message ?? '';

    if (msg.includes('too large') || msg.includes('maxFileSize')) {
      return res.status(400).json({ error: msg });
    }
    if (msg.includes('No text found') || msg.includes('too short') || msg.includes('Image-only')) {
      return res.status(422).json({
        error: 'Could not extract text from this PDF. It may be a scanned image — please use a text-based PDF.',
      });
    }
    if (msg.includes('No file uploaded') || msg.includes('Invalid file type') || msg.includes('not appear')) {
      return res.status(400).json({ error: msg });
    }

    return res.status(500).json({
      error: 'Something went wrong while processing your file. Please try again.',
    });
  } finally {
    // ── 6. Always clean up temp file ──
    if (tmpPath) {
      try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
  }
}
