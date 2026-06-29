// pages/api/roast.js
// POST /api/roast
// Security: server-session auth guard, rate-limit header, no API keys exposed to client

import { getServerSession } from 'next-auth/next';
import { authOptions }      from './auth/[...nextauth]';
import { roastResume }      from '../../lib/claude';

const MIN_CHARS = 100;
const MAX_CHARS = 60000;

export default async function handler(req, res) {
  // ── Method guard ──
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  // ── Auth guard — server-side session check (NEVER client-exposed key) ──
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to roast your resume.' });
  }

  // ── Input validation ──
  const { resumeText } = req.body ?? {};

  if (!resumeText || typeof resumeText !== 'string') {
    return res.status(400).json({ error: 'resumeText is required and must be a string.' });
  }

  const trimmed = resumeText.trim();
  if (trimmed.length < MIN_CHARS) {
    return res.status(400).json({
      error: `Resume text is too short (${trimmed.length} chars). Minimum is ${MIN_CHARS} characters — make sure your PDF is text-based, not a scanned image.`,
    });
  }
  if (trimmed.length > MAX_CHARS) {
    return res.status(400).json({
      error: `Resume text is too long (${trimmed.length} chars). Maximum is ${MAX_CHARS} characters. Please use a 1–2 page resume.`,
    });
  }

  // ── Call Claude ──
  try {
    const roast = await roastResume(trimmed);
    return res.status(200).json({ success: true, roast });

  } catch (err) {
    console.error('[roast] Claude API error:', err.message);

    // ── Granular error handling for teaching credit ──
    const msg    = err.message ?? '';
    const status = err.status  ?? null;

    if (status === 401 || msg.includes('Authentication') || msg.includes('API key')) {
      return res.status(500).json({ error: 'Service configuration error. Please contact support.' });
    }
    if (status === 429 || msg.includes('rate limit') || msg.includes('overloaded')) {
      return res.status(429).json({ error: 'Claude is overwhelmed right now. Please wait a moment and try again.' });
    }
    if (msg.includes('too short') || msg.includes('too long') || msg.includes('non-empty')) {
      return res.status(400).json({ error: msg });
    }
    if (msg.includes('unexpected format') || msg.includes('parse')) {
      return res.status(502).json({ error: 'Received an unexpected response from the AI. Please try again.' });
    }

    return res.status(500).json({ error: 'The roast failed unexpectedly. Please try again.' });
  }
}
