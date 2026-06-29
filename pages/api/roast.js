// pages/api/roast.js
// POST /api/roast
// Security: server-session auth guard, 5 roasts/hour rate limiter, database logging

import { getServerSession } from 'next-auth/next';
import { authOptions }      from './auth/[...nextauth]';
import { roastResume }      from '../../lib/claude';
import { getRecentRoastCount, saveRoastSession, supabase } from '../../lib/db';

const MIN_CHARS = 100;
const MAX_CHARS = 60000;
const MAX_ROASTS_PER_HOUR = 5;

// In-memory rate limiter cache for local development/sandbox mode when Supabase is not configured
const localRateLimiter = new Map();

/**
 * Check local in-memory rate limits (5 requests per hour)
 */
function checkLocalRateLimit(userId) {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!localRateLimiter.has(userId)) {
    localRateLimiter.set(userId, []);
  }

  const history = localRateLimiter.get(userId).filter((timestamp) => now - timestamp < oneHour);

  if (history.length >= MAX_ROASTS_PER_HOUR) {
    return false;
  }

  history.push(now);
  localRateLimiter.set(userId, history);
  return true;
}

export default async function handler(req, res) {
  // ── Method guard ──
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  // ── Auth guard — server-side session check ──
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to roast your resume.' });
  }

  const userId = session.user.id || 'sandbox-user-123';

  // ── Rate Limiter Abuse Protection (5 requests per hour) ──
  if (supabase) {
    // Live Supabase check
    const count = await getRecentRoastCount(userId);
    if (count >= MAX_ROASTS_PER_HOUR) {
      return res.status(429).json({
        error: `Rate limit exceeded. You can only request a maximum of ${MAX_ROASTS_PER_HOUR} resume roasts per hour.`,
      });
    }
  } else {
    // Memory cache fallback for sandbox/local testing
    const allowed = checkLocalRateLimit(userId);
    if (!allowed) {
      return res.status(429).json({
        error: `Rate limit exceeded (Demo Mode). You can only request a maximum of ${MAX_ROASTS_PER_HOUR} resume roasts per hour.`,
      });
    }
  }

  // ── Input validation ──
  const { resumeText, filename } = req.body ?? {};

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

  // ── Call Claude / Generate Roast ──
  try {
    const roast = await roastResume(trimmed);

    // Save roast session to Supabase database (non-blocking so errors don't disrupt user response)
    if (supabase) {
      saveRoastSession({
        userId,
        filename: filename || 'resume.pdf',
        resumeText: trimmed,
        roastResult: roast,
      }).catch((dbErr) => console.error('[roast] Failed to save roast to db:', dbErr.message));
    }

    return res.status(200).json({ success: true, roast });

  } catch (err) {
    console.error('[roast] Claude API error:', err.message);

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
