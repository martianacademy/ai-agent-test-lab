# 🤖 AgentTest Lab — AI Agent Web Testing

A comprehensive, interactive web testing laboratory built specifically for AI agents. AgentTest Lab provides 7 distinct test suites covering every major browser interaction pattern, paired with a live analytics dashboard that tracks scores, response times, and operation success rates across sessions.

---

## ✨ Features

- **7 Test Suites** — Forms, Interactions, Navigation, Dynamic Content, Modals & Overlays, Drag & Drop, Real World scenarios
- **Live Analytics Engine** — Tracks every operation with timing, success rate, and a graded score (S / A / B / C / F)
- **Start & Result Modals** — Each suite has a start prompt and a rich results breakdown with per-operation logs
- **Consistent Design System** — Premium dark sidebar + light main area; Inter font; slate color palette throughout
- **Per-route Metadata** — Full Open Graph, Twitter Card, and title-template SEO for every page
- **Light-mode Enforced** — OS dark mode is intentionally disabled so card/form colors are always predictable for agents

---

## 🧪 Test Suites

| Suite                 | Route                 | What it tests                                                                                                                                                  |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forms**             | `/tests/forms`        | Text inputs, email/phone/URL validation, password toggle, country select, checkboxes, radio groups, range slider, date/time pickers, file drag-and-drop upload |
| **Interactions**      | `/tests/interactions` | Click targets, hover effects, double-click, right-click context menu, long-press, keyboard shortcuts, focus trapping, toggle switches, ripple buttons          |
| **Navigation**        | `/tests/navigation`   | Tab bars, accordions, breadcrumbs, multi-step wizard/stepper, pagination controls, sidebar sub-menus                                                           |
| **Dynamic Content**   | `/tests/dynamic`      | Skeleton loaders, lazy-loaded content, infinite scroll, real-time polling updates, optimistic UI, streaming text                                               |
| **Modals & Overlays** | `/tests/modals`       | Basic dialogs, confirmation dialogs, drawers (bottom/side), toast notifications, tooltips, lightbox, nested/stacked modals                                     |
| **Drag & Drop**       | `/tests/dragdrop`     | Sortable vertical list, Kanban board (multi-column), grid reordering, file drop zone                                                                           |
| **Real World**        | `/tests/realworld`    | Login flow, shopping cart (add/remove/checkout), data table with sort/filter/pagination, chat interface, user settings panel                                   |

---

## 📊 Analytics Dashboard

The dashboard at `/` aggregates metrics across all test sessions:

- **Total Sessions** — number of test runs completed
- **Total Operations** — cumulative interactions tracked
- **Success Rate** — percentage of operations that resolved without errors
- **Avg Response Time** — mean time per operation across all suites

Each test session receives a **letter grade**:

| Grade | Score | Description |
| ----- | ----- | ----------- |
| S     | ≥ 95% | Exceptional |
| A     | ≥ 85% | Great       |
| B     | ≥ 70% | Good        |
| C     | ≥ 50% | Needs work  |
| F     | < 50% | Poor        |

The full session history, per-operation breakdown, and suite-level analytics are available at `/analytics`.

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root server layout — exports metadata + viewport
│   ├── page.tsx                    # Dashboard (session stats + suite cards)
│   ├── globals.css                 # Tailwind v4 + custom animations + form base styles
│   ├── analytics/
│   │   ├── layout.tsx              # Per-route metadata
│   │   └── page.tsx                # Full analytics view with charts
│   └── tests/
│       ├── forms/
│       ├── interactions/
│       ├── navigation/
│       ├── dynamic/
│       ├── modals/
│       ├── dragdrop/
│       └── realworld/
│           ├── layout.tsx          # Per-route title + description
│           └── page.tsx            # Test suite UI
├── components/
│   ├── layout/
│   │   └── AppShell.tsx            # Client component — dark sidebar + mobile nav
│   ├── analytics/
│   │   └── AnalyticsPanel.tsx      # Live session stats bar shown on each test page
│   ├── test/
│   │   └── TestModals.tsx          # TestStartModal + TestResultModal
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── badge.tsx
├── hooks/
│   └── useAnalytics.ts             # Hook wrapping AnalyticsEngine per test page
└── lib/
    ├── analytics.ts                # AnalyticsEngine singleton — stores sessions in memory
    └── utils.ts                    # cn(), formatDuration(), formatNumber()
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)

### Install & run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other commands

```bash
npm run build       # Production build
npm run start       # Start production server
npm run lint        # ESLint
npx tsc --noEmit    # Type-check without emitting
```

---

## 🛠️ Tech Stack

| Layer          | Technology                                                           |
| -------------- | -------------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) — App Router, TypeScript            |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com) — `@import "tailwindcss"` |
| Font           | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts    |
| Icons          | [Lucide React](https://lucide.dev)                                   |
| Drag & Drop    | [@dnd-kit/core + @dnd-kit/sortable](https://dndkit.com)              |
| Charts         | [Recharts](https://recharts.org)                                     |
| UI Primitives  | [Radix UI](https://www.radix-ui.com)                                 |
| Class variants | [class-variance-authority](https://cva.style)                        |

---

## 🎨 Design System

- **Color palette** — Slate family (`#0f172a` headings → `#94a3b8` muted)
- **Cards** — `rounded-2xl`, `bg-white`, subtle `box-shadow + border`
- **Inputs** — `rounded-xl`, `border-slate-200`, blue focus ring
- **Sidebar** — Dark gradient (`#0f172a → #0d1527`), per-suite accent colors
- **Page heroes** — Per-suite gradient banners (blue / violet / indigo / amber / pink / orange / emerald)
- **Dark mode** — Intentionally disabled via `@variant dark (&:where(.dark, .dark *))` so AI agents always see a consistent light UI

---

## 📐 Analytics Engine

`AnalyticsEngine` (`src/lib/analytics.ts`) is a singleton that:

1. **Tracks operations** — type (`input` / `click` / `select` / `checkbox` / `form_submit` / `drag` / etc.), label, status, duration, and optional metadata
2. **Scores sessions** — calculates success rate → letter grade on `endTest()`
3. **Notifies subscribers** — reactive updates via a simple pub/sub so the dashboard and analytics page stay live
4. **Persists in memory** — sessions live for the browser tab lifetime; the analytics page can export or clear all data

```ts
// Basic usage inside a test page
const { session, isRunning, startTest, endTest, track } = useAnalytics(
  "Forms Test",
  "forms"
);

track("input", "Email field", "success", 320);
track("click", "Submit button", "success", 55);

const completedSession = endTest(); // returns TestSession with grade
```

---

## 📄 License

MIT

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
