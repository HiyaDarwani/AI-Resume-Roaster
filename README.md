# 🔥 AI Resume Roaster

> **Brutally honest AI feedback on your resume.** Upload a PDF, get a Claude-powered roast with section scores, red flags, and actionable rewrites.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** (Pages Router) | Full-stack framework — pages + API routes |
| **@anthropic-ai/sdk** | Claude `claude-sonnet-4-5` AI model |
| **pdf-parse** | Server-side PDF text extraction |
| **NextAuth.js** | Google OAuth authentication |
| **Prisma + Supabase** | Optional data persistence |
| **Tailwind CSS** | UI styling |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-resume-roaster
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...          # from console.anthropic.com
NEXTAUTH_SECRET=<random-32-chars>     # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

### 3. Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create Project → **APIs & Services** → **Credentials**
3. **Create OAuth 2.0 Client ID** (type: Web application)
4. Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy **Client ID** + **Secret** → `.env.local`

### 4. Run

```bash
npm run dev    # http://localhost:3000
```

---

## Architecture

```
pages/
  index.js              ← Landing page
  upload.js             ← Upload + roast flow
  feedback/[id].js      ← Results page
  api/
    auth/[...nextauth].js  ← Google OAuth
    upload.js              ← PDF parse endpoint
    roast.js               ← Claude AI endpoint

lib/
  claude.js             ← 4-layer Claude prompt
  pdfParser.js          ← PDF text extraction + validation
  db.js                 ← Supabase client (optional)

components/
  Header.jsx            ← Glassmorphism nav
  UploadDropzone.jsx    ← Drag-drop file picker
  ScoreCircle.jsx       ← Animated SVG donut chart
  FeedbackCard.jsx      ← Per-section roast + advice
  RoastResults.jsx      ← Full results layout
  LoadingRoaster.jsx    ← Animated loading state
```

---

## The 4-Layer Claude Prompt (`lib/claude.js`)

| Layer | Content |
|-------|---------|
| **Layer 1 — ROLE** | "You are The Roaster — 50,000 resumes reviewed at Google/Meta/Amazon..." |
| **Layer 2 — CONTEXT + EXAMPLES** | Resume text between `---` delimiters + 3 good/bad bullet examples |
| **Layer 3 — TASK** | Scoring guide (0–100 rubric), 6 explicit tasks, tone rules |
| **Layer 4 — FORMAT** | Strict JSON schema — no markdown, no prose outside the object |

Claude returns:
```json
{
  "overallScore": 42,
  "overallGrade": "D",
  "tldr": "A masterpiece of saying nothing with many words.",
  "sections": [{ "name": "Work Experience", "score": 35, "roast": "...", "advice": "..." }],
  "redFlags": ["..."],
  "greenFlags": ["..."],
  "finalVerdict": "...",
  "hireable": false,
  "roastLevel": "spicy"
}
```

---

## Security Measures

| Threat | Mitigation |
|--------|-----------|
| API key exposure | All keys server-side only; `ANTHROPIC_API_KEY` never in client bundle |
| 50 MB PDF attack | `formidable({ maxFileSize: 5MB })` + `fs.statSync` double-check |
| Wrong file type | MIME whitelist + file extension check (defence in depth) |
| Unauthenticated API access | `getServerSession()` in `/api/roast` — 401 if no session |
| Password-protected PDF | Detected and returns user-friendly error |
| Image-only PDF | Text length check + user-friendly error |
| Claude API key leak | Mapped to generic 500; real error logged server-side only |
| `.env.local` in git | `.gitignore` explicitly excludes all `.env*` files |

---

## Error Handling

| Scenario | HTTP | User Message |
|----------|------|-------------|
| File > 5 MB | 400 | "File too large (X MB). Maximum is 5 MB." |
| Non-PDF file | 400 | "Invalid file type. Only PDF accepted." |
| Corrupt PDF | 500 | "PDF appears corrupt or damaged." |
| Password-protected PDF | 500 | "PDF is password-protected. Remove password and retry." |
| Scanned image PDF | 422 | "No text found. Use a text-based PDF." |
| No auth session | 401 | "You must be signed in." |
| Claude rate limit | 429 | "Claude is overwhelmed. Please wait and retry." |
| Claude JSON parse fail | 502 | "Received unexpected response. Please try again." |
| Supabase unavailable | — | Silently degrades; roast still works |
