// lib/claude.js
// 4-Layer Claude Prompting Technique:
//   Layer 1 - ROLE:     Who Claude is (persona + authority)
//   Layer 2 - CONTEXT:  The resume data + examples of good vs bad
//   Layer 3 - TASK:     Precise instructions with scoring criteria
//   Layer 4 - FORMAT:   Strict JSON schema with no prose allowed

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── LAYER 1: ROLE ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "The Roaster" — a brutally honest, sharp-tongued but deeply caring career coach
who has reviewed over 50,000 resumes for top companies (Google, Meta, Amazon, McKinsey) and helped
thousands of candidates land their dream jobs. You have zero tolerance for:
  - Vague buzzwords ("synergize", "results-driven", "passionate")
  - Responsibilities without metrics ("managed a team", "improved performance")
  - Meaningless skills ("Microsoft Office", "team player", "fast learner")
  - Generic summaries ("innovative professional seeking a challenging role")

Your tone: Stand-up comedian precision + senior hiring manager bluntness + a mentor's heart.
Every criticism you make comes with a concrete, specific fix.
You NEVER make up details that are not present in the resume.`;

// ── LAYER 2 (examples) embedded in context ──────────────────────────
const EXAMPLES = `
EXAMPLES OF GOOD vs BAD BULLETS:

BAD:  "Responsible for managing team deliverables and stakeholder communication"
GOOD: "Led 6-engineer team delivering 4 product features on time; reduced cross-team miscommunication by introducing weekly async updates"

BAD:  "Improved application performance"
GOOD: "Cut API response time from 2.1s to 340ms (84% improvement) by caching hot queries in Redis"

BAD:  "Worked on machine learning projects"
GOOD: "Built XGBoost model predicting customer churn (AUC 0.91), deployed to prod via AWS SageMaker; saved $1.2M ARR"

Use these as reference when giving advice in the 'advice' field of each section.`;

/**
 * Build the full 4-layer prompt
 * @param {string} resumeText - Extracted PDF text
 */
function buildPrompt(resumeText) {
  // LAYER 2: CONTEXT — inject the resume + examples
  const context = `Here is the resume to analyze:
---
${resumeText}
---
${EXAMPLES}`;

  // LAYER 3: TASK — precise scoring + tone rules
  const task = `Analyze this resume and produce a comprehensive roast. Your job:
1. Score the resume overall (0–100) based on clarity, impact, specificity, and ATS-friendliness
2. Evaluate EACH section present (Contact Info, Summary/Objective, Work Experience, Skills, Education, Projects, Certifications, etc.)
3. Quote specific bad lines directly from the resume — do not be generic
4. List 3–6 concrete red flags (things that get resumes rejected)
5. List 2–4 genuine green flags (what actually works)
6. Write a final verdict: 3–5 sentences, honest but ends with encouragement

Scoring guide:
  90–100: Nearly perfect — few hirable candidates achieve this
  70–89:  Good foundation, fixable issues
  50–69:  Mediocre — common red flags, vague bullets
  30–49:  Significant problems — would likely be rejected
  0–29:   Major overhaul needed

Tone rules:
  🔥 = roast (brutal but specific — quote from resume)
  ✅ = advice (concrete fix with a real example)
  ⚠️ = red flag
  ⭐ = green flag`;

  // LAYER 4: FORMAT — strict JSON, no prose outside it
  const format = `CRITICAL: Respond ONLY with a single valid JSON object. No markdown fences. No explanation before or after.
The JSON must exactly match this schema:
{
  "overallScore": <integer 0-100>,
  "overallGrade": <"S"|"A"|"B"|"C"|"D"|"F">,
  "tldr": "<one brutal sentence, max 20 words>",
  "sections": [
    {
      "name": "<section name>",
      "score": <integer 0-100>,
      "roast": "<specific criticism — quote exact text from the resume and explain why it fails>",
      "advice": "<actionable fix with a concrete rewritten example>"
    }
  ],
  "redFlags": ["<specific red flag with quoted evidence>"],
  "greenFlags": ["<specific green flag — what works and why>"],
  "finalVerdict": "<3-5 sentence closing assessment>",
  "hireable": <true|false>,
  "roastLevel": <"mild"|"medium"|"spicy"|"nuclear">
}`;

  return {
    system:      SYSTEM_PROMPT,
    userMessage: `${context}\n\n${task}\n\n${format}`,
  };
}

/**
 * Send resume text to Claude and get back a structured roast.
 * @param {string} resumeText - Extracted resume text from the PDF
 * @returns {Promise<Object>} Parsed roast JSON
 * @throws {Error} With a user-friendly message
 */
export async function roastResume(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    throw new Error('Resume text must be a non-empty string.');
  }
  const trimmed = resumeText.trim();
  if (trimmed.length < 50) {
    throw new Error('Resume text is too short. Please upload a proper PDF resume.');
  }
  if (trimmed.length > 60000) {
    throw new Error('Resume text is too long. Please use a resume that is 2 pages or less.');
  }

  // ── MOCK ROASTER MODE ──
  // Checks if ANTHROPIC_API_KEY is missing, placeholder, or invalid format
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isMockMode = !apiKey ||
                     apiKey.includes('your_anthropic') ||
                     apiKey.includes('placeholder') ||
                     apiKey.trim() === '';

  if (isMockMode) {
    console.log('[roast] ANTHROPIC_API_KEY is not configured. Running in Mock Sandbox Roaster Mode.');
    // Simulate a brief delay to feel authentic
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Detect section keywords in resume text to make mock roasts look smart
    const hasExp = trimmed.toLowerCase().includes('experience') || trimmed.toLowerCase().includes('work');
    const hasEdu = trimmed.toLowerCase().includes('education') || trimmed.toLowerCase().includes('university') || trimmed.toLowerCase().includes('college');
    const hasSkills = trimmed.toLowerCase().includes('skills') || trimmed.toLowerCase().includes('languages');

    const sections = [];
    if (hasExp) {
      sections.push({
        name: 'Work Experience',
        score: 45,
        roast: 'You wrote "responsible for managing tasks" instead of stating actual metrics. A hiring manager doesn\'t want a list of chores; they want to see what you actually delivered.',
        advice: 'Quantify your accomplishments: "Led a team of 4 to deliver a product feature on schedule, reducing operational delays by 18%."'
      });
    }
    if (hasSkills) {
      sections.push({
        name: 'Skills & Tools',
        score: 55,
        roast: 'Listing "Microsoft Word", "Time Management", and "Critical Thinking" isn\'t a technical inventory; it\'s just a list of basic human traits and standard office utilities.',
        advice: 'Remove basic soft skills. Instead, list specific languages, tools, frameworks, or database technologies you actually wrote code in.'
      });
    }
    if (hasEdu) {
      sections.push({
        name: 'Education',
        score: 70,
        roast: 'Your education section occupies a huge portion of the page. Unless you\'re a fresh graduate, your GPA and coursework from years ago aren\'t going to land you a mid-level job.',
        advice: 'Reduce the space taken by education. Highlight graduation year, degree, and university, and move the focus back to your real projects.'
      });
    }

    // Default section fallback
    if (sections.length === 0) {
      sections.push({
        name: 'General Structure',
        score: 40,
        roast: 'Your resume text looks extremely unformatted or scanned. It has very few technical bullet points or structure.',
        advice: 'Use a clean, single-column design with distinct sections for Work Experience, Projects, Skills, and Education.'
      });
    }

    return {
      overallScore: 48,
      overallGrade: 'D',
      tldr: 'A fine collection of buzzwords that manages to convey absolutely zero actual metrics.',
      sections,
      redFlags: [
        'Vague, non-quantifiable bullets (no metrics or percentages)',
        'Lists standard soft skills (e.g., team player, fast learner) instead of real abilities'
      ],
      greenFlags: [
        'Decent layout structure with clear headings'
      ],
      finalVerdict: 'This resume has a good layout foundation, but it is deeply hidden behind standard corporate fluff. Rewrite every single bullet point to start with an active verb and end with a metric.',
      hireable: false,
      roastLevel: 'spicy'
    };
  }

  const { system, userMessage } = buildPrompt(trimmed);

  let rawContent;
  try {
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-5',
      max_tokens: 4096,
      system,
      messages:   [{ role: 'user', content: userMessage }],
    });
    rawContent = message.content[0]?.text ?? '';
  } catch (apiErr) {
    throw apiErr;
  }

  // ── Parse JSON (Layer 4 should ensure clean output) ──
  try {
    // Strip accidental markdown fences just in case
    const cleaned = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const result = JSON.parse(cleaned);

    // Validate required shape
    if (
      typeof result.overallScore !== 'number' ||
      !Array.isArray(result.sections)         ||
      !result.tldr                            ||
      !result.finalVerdict
    ) {
      throw new Error('Response missing required fields');
    }

    // Clamp score to 0–100
    result.overallScore = Math.max(0, Math.min(100, Math.round(result.overallScore)));
    result.sections.forEach((s) => {
      s.score = Math.max(0, Math.min(100, Math.round(s.score ?? 50)));
    });

    return result;
  } catch (parseErr) {
    console.error('Claude response parse failure. Raw:', rawContent.slice(0, 500));
    throw new Error('Claude returned an unexpected format. Please try again.');
  }
}
