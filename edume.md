# EduMe — AI Tutorial Builder

## Project Overview

EduMe is a fully working, browser-only AI course authoring tool that transforms a plain-text topic or an uploaded PDF into a complete, interactive, multi-lesson e-learning course in seconds. There is no backend, no database, no build pipeline to run — just a Vite dev server, an Anthropic API key in `.env.local`, and a browser. That constraint is itself a stability guarantee: there are no servers to go down, no auth flows to break, and no network hops between the UI and the intelligence layer beyond the direct API call.

The prototype is stable because every generated course is immediately serialised to `localStorage` via Zustand's persist middleware, surviving hard refreshes, closed tabs, and browser restarts. Generation failures are caught, surfaced with a human-readable message, and never leave the store in a corrupt state. Block-level AI refinement is decoupled from course generation — a single block can be rewritten by Claude without touching the rest of the document.

---

## Shattering UI Conventions

Most AI tools put intelligence behind a chat window. EduMe makes the **rendered document itself** the interface for AI interaction. Every content block — paragraph, diagram, flashcard, scenario — is a first-class UI element that surfaces a floating action toolbar on hover. From that toolbar the author can:

- **Edit** the block directly via a pre-filled modal form
- **Refine with AI** — type a natural-language instruction ("make this more Socratic", "add a Python code example") and Claude rewrites just that block in place, preserving type and structure
- **Delete** the block with a single click

This is a fundamentally different mental model from prompt-then-paste. The author never leaves the course view. The document and the AI editor are the same surface.

### Playful, Novel Interaction Patterns

**Flashcard deck** — Cards render as a physical stacked deck with two ghost cards visible beneath, rotated at slight angles. Navigation is via left/right arrows flanking the deck, mimicking the spatial muscle memory of flipping paper cards. The flip animation uses a CSS `rotateY` transform. The deck state is maintained per-card so navigating resets the flip.

**Drag-to-match** — Answer chips live in a "bank" below the prompt list. The learner drags a chip to a dashed drop zone next to its matching prompt. Chips can be swapped between slots or returned to the bank. A "Check" button reveals correct/incorrect states with colour feedback. Built on dnd-kit with a `PointerSensor` (activation distance 6 px) so the dragged chip tracks exactly under the cursor even inside a scrollable container.

**Social presence characters** — A curated pool of illustrated instructor avatars (DiceBear avataaars) appears as speech-bubble callouts at pedagogically significant moments: introducing a lesson, bridging between topics, cautioning against a common mistake, encouraging after a hard section. Claude chooses the persona (teacher / engineer / scientist / mentor) and the mood (`introducing`, `explaining`, `questioning`, `bridging`, `encouraging`, `cautioning`) — the UI renders the matching bubble colour, accent stripe, emoji badge, and avatar, all without the author writing a single line of character dialogue.

**Scroll-triggered animations** — Every block fades up from 18 px below its resting position as it enters the viewport, using an `IntersectionObserver` (threshold 0.08) that fires once and disconnects. Heading blocks receive extra top margin to breathe. The result is a reading experience that feels editorial rather than utilitarian.

**Inline SVG diagrams** — Claude writes complete `<svg>` markup inside the JSON response. DiagramBlock renders it verbatim inside a responsive container. No third-party diagramming library, no round-trip to a rendering service — the diagram is part of the document from the moment generation completes.

**Scenario branching** — A narrative setup is followed by 2–4 labelled choices. Selecting a choice reveals the consequence inline; a subtle colour ring distinguishes the correct path. The learner can explore wrong choices to understand why they fail before seeing the right answer.

**SCORM export** — The entire course (including base64-encoded AI images and inlined DiceBear SVGs) is packaged into a SCORM 1.2 ZIP file by `scormService.js` using JSZip, with no server involvement. This lets the author publish directly to any LMS that accepts SCORM.

---

## How Claude's Reasoning Drives the Experience

EduMe does not use Claude as a text generator. It uses Claude as a **document architect**.

Course generation uses the [tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) API with a single `save_course` tool whose JSON schema encodes the full block type system. Claude is forced to return a valid, typed document — not a prose response that the app must parse. The schema is expressive enough to describe 20 distinct block types, each with its own field shape, so Claude reasons about *what kind of knowledge representation best serves each piece of content* rather than just what to say.

The system prompt encodes explicit pedagogical rules that Claude applies at inference time:

- Lesson count scales with actual content depth (no padding)
- At least one interactive block per lesson
- Diagrams only where a visual genuinely outperforms text
- Character blocks never placed back-to-back; never used to restate a heading
- One persona chosen for the entire course and held consistent throughout
- YouTube search queries written as precise, findable phrases

This means Claude is doing instructional design, not just summarisation. The output of a single API call is a fully structured, pedagogically considered course that a human author can then tune block by block.

Block refinement is a second, smaller Claude call: the existing block JSON plus a free-text instruction. Claude returns a revised block of the same type. Because the block schema is small and the call is focused, refinement is fast and surgical — it does not require regenerating the course.

---

## Technology Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 (JSX, no TypeScript) |
| Build tool | Vite 7 with dev proxy (`/api/claude → https://api.anthropic.com`) |
| Component library | MUI v7 (`@mui/material`, `@mui/icons-material`) |
| State management | Zustand v5 with `persist` middleware (localStorage) |
| Drag and drop | dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) |
| AI reasoning | Anthropic Claude (`claude-sonnet-4-6`) via tool use (structured JSON output) |
| PDF ingestion | `pdfjs-dist` — client-side text extraction, no upload required |
| Image generation | Pollinations.ai (free, no API key) via `fetch` |
| Avatar generation | DiceBear avataaars v9 API — deterministic, seed-based illustrated characters |
| YouTube integration | YouTube Data API v3 — block search queries resolved to real video IDs |
| SCORM packaging | JSZip — assembles SCORM 1.2 manifest + HTML + assets entirely in the browser |
| Routing | React Router v7 (`BrowserRouter`) |
| Animations | Native `IntersectionObserver` + CSS transitions (no animation library) |

### Why This Stack Enables Intelligence-Driven UI

**Vite proxy** eliminates the need for a backend server while keeping the API key out of the network tab — the browser sends requests to `/api/claude`, Vite rewrites them to `api.anthropic.com` during development.

**Tool use + JSON schema** means the entire block type system is the API contract. Adding a new block type is a matter of adding it to the schema and writing a React component — Claude will use it in future courses automatically.

**Zustand partialize** persists only `courses` and `removedCharacterIds` to localStorage. `approvedCharacters` is always derived from `characterProfiles.js` at runtime, so updating the character image pool never leaves stale URLs in storage.

**dnd-kit PointerSensor** with `activationConstraint: { distance: 6 }` correctly tracks drag coordinates inside scrollable containers, resolving the classic offset bug that plagues simpler drag implementations.

**DiceBear avataaars** generates consistent, professional illustrated characters from a string seed — the same seed always produces the same face, enabling the social presence system to maintain a single instructor identity across an entire course without storing any images server-side.
