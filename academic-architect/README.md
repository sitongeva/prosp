# Academic Architect — MVP Slice

A working end-to-end slice of the Academic Architect product:
landing page → 4-step audit form → results page with the live
Academics scoring function.

## What's in here

```
academic-architect/
├── app/
│   ├── page.tsx              # Landing page
│   ├── audit/page.tsx        # The 4-step form
│   ├── results/page.tsx      # Score display
│   ├── layout.tsx            # Root layout + fonts
│   └── globals.css           # Tailwind + brand styles
├── components/
│   ├── Sidebar.tsx           # Left nav (from mockups)
│   └── ProgressBar.tsx       # Green progress bar
├── lib/
│   ├── scoring/academics.ts  # The v1.0 scoring function
│   └── types/scoring.ts      # Shared TypeScript types
├── tailwind.config.ts        # Brand palette (navy/green/cream)
├── package.json
└── ...
```

## How to run it

You need **Node.js 18.17+** installed. Check with `node -v`.

```bash
# 1. Install dependencies (one-time, ~1 minute)
npm install

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

That's it. Hot-reload is on; edit any file and it'll refresh.

## What works

- Landing page → click "Start Audit" goes to /audit
- /audit walks through 4 steps with the green progress bar
- Inputs are validated (can't advance without selecting required fields)
- /results runs the real scoring function and displays the score

## What doesn't work yet (intentional)

- Only the **Academics** category is scored. The other 4 categories
  (Activities, Testing, Leadership, Research) come next.
- No account creation, no database, no persistence. Results live in the URL.
- No mobile sidebar (it hides on mobile — main content still works).
- No production deployment config — just `npm run dev` for now.

## Brand palette (in tailwind.config.ts)

| Token              | Value     | Used for                  |
|--------------------|-----------|---------------------------|
| `navy`             | `#0F1F4C` | Headers, primary buttons  |
| `accent-green`     | `#39D77B` | Step pill, progress fill  |
| `accent-mint`      | `#A8F0C8` | Step pill background      |
| `accent-deep`      | `#0F4E3A` | Dark green callouts       |
| `cream`            | `#F4F4EF` | Page background           |

## Fonts

- **Display:** Fraunces (serif, opsz variable) — for headlines
- **Body:** Inter Tight — for everything else

Loaded from Google Fonts in `app/layout.tsx`.

## Next moves (in suggested order)

1. **Get it running locally** (this is the first milestone — see your score)
2. **Add the other 4 scoring functions** in `lib/scoring/`
3. **Combine them** into a `calculateOverallScore()` that returns the full 5-bar breakdown from Image 11
4. **Add Supabase** for accounts + saving submissions
5. **Deploy to Vercel** so you can share a link

## Scoring function — quick reference

```ts
import { calculateAcademicsScore } from '@/lib/scoring/academics';

const result = calculateAcademicsScore({
  path: 'competitive',
  gpaBucket: 'gpa_3_8_to_4_0',
  apIbHonorsCount: 6,
  dualEnrollmentCount: 0,
  courseOfferings: 'robust',
  isIbDiplomaCandidate: false,
  hasCteCredential: false,
});

// result.score          → 100
// result.gpaSubScore    → 100
// result.rigorMultiplier → 1.10
// result.signal         → "Excellent academic foundation for top-tier pathways."
```

That function is pure — no side effects. You can unit-test it,
swap it server-side, or even compute scores client-side. Same
inputs → same outputs every time.
