import { v4 as uuidv4 } from 'uuid';
import { searchYouTubeVideo } from './youtubeService';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

// ── Shared fetch helper ────────────────────────────────────────────────────
async function callClaude(body) {
  const res = await fetch('/api/claude/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Assign stable IDs recursively ─────────────────────────────────────────
function assignIds(course) {
  return {
    ...course,
    id: uuidv4(),
    lessons: (course.lessons ?? []).map((lesson) => ({
      ...lesson,
      id: uuidv4(),
      blocks: (lesson.blocks ?? []).map((block) => ({
        ...block,
        id: uuidv4(),
      })),
    })),
  };
}

// ── Resolve youtube blocks: searchQuery → real videoId ────────────────────
async function resolveYouTubeBlocks(course) {
  const tasks = [];

  for (const lesson of course.lessons) {
    for (const block of lesson.blocks) {
      if (block.type === 'youtube' && block.searchQuery && !block.videoId) {
        tasks.push(
          searchYouTubeVideo(block.searchQuery)
            .then((result) => {
              if (result?.videoId) {
                block.videoId = result.videoId;
                block.caption = result.title;
              } else {
                block._remove = true;
              }
              delete block.searchQuery;
            })
            .catch(() => {
              block._remove = true;
            })
        );
      }
    }
  }

  if (tasks.length > 0) await Promise.all(tasks);

  // Drop any youtube blocks that couldn't be resolved
  for (const lesson of course.lessons) {
    lesson.blocks = lesson.blocks.filter((b) => !b._remove);
  }

  return course;
}

// ── Course generation ──────────────────────────────────────────────────────
const COURSE_TOOL = {
  name: 'save_course',
  description: 'Save the generated course structure',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      lessons: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            blocks: {
              type: 'array',
              items: {
                type: 'object',
                description: 'A content or interactive block',
              },
            },
          },
          required: ['title', 'blocks'],
        },
      },
    },
    required: ['title', 'description', 'lessons'],
  },
};

const COURSE_SYSTEM = `You are an expert instructional designer. Given a topic or source text, produce a course using the save_course tool.

## Lesson count — scale to the actual content depth
- Single concept or quick explainer → 1 lesson
- Focused topic with a few sub-sections → 2–3 lessons
- Medium-depth subject → 3–5 lessons
- Comprehensive, multi-faceted subject → 5–8 lessons
NEVER pad lessons to reach a minimum. Every lesson must earn its place with distinct content.

## Block count per lesson — also proportional
- Short lesson: 3–5 blocks
- Medium lesson: 5–8 blocks
- Deep lesson: 8–12 blocks
Only add blocks that add value. Do not repeat the same information in different block types.

## Block types available
Content:
  heading (level: 1|2|3, content: string)
  paragraph (content: string)
  statement (variant: "note"|"tip"|"warning", content: string)
  quote (content: string, attribution?: string)
  bullet-list (items: string[])
  numbered-list (items: string[])
  accordion (items: [{label, content}])
  tabs (items: [{label, content}])
  process (steps: [{title, content}])
  divider

Interactive — include at least 1 per lesson, more for longer lessons:
  multiple-choice (question, options: string[], correct: number, explanation)
  true-false (statement, correct: boolean, explanation)
  fill-in-blank (template: string with ___ placeholder, answer, hint?)
  flashcard (cards: [{front, back}])
  drag-to-match (pairs: [{prompt, answer}])
  scenario (setup, choices: [{label, consequence, isCorrect}])
  reveal (prompt, revealContent)

Diagrams — SVG illustrations generated as code:
  diagram (svg: string, caption?: string)
  — Write a complete inline SVG that visually explains a concept in this lesson
  — When to use: spatial relationships, processes/flows, comparisons, labeled structures,
    timelines, hierarchies, before/after states, data distributions
  — SVG rules:
    • Opening tag: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 N"> (set N to fit)
    • Fonts: font-family="system-ui, sans-serif" — use font-size="13" or "14" for labels
    • Palette: #4F46E5 primary, #818CF8 secondary, #EEF2FF light fill, #F1F5F9 backgrounds,
               #CBD5E1 borders/lines, #0F172A text, #64748B muted text, #22C55E success, #F59E0B warning
    • For arrows: define a <marker id="arrow" ...> arrowhead in <defs> and reference with marker-end
    • No <script> elements, no CSS animations, no external URLs, no event handlers
    • All text must be legible — minimum font-size 12, contrast against background
    • Aim for clarity over complexity — label every key element
  — Use 1–3 diagrams per course total. Only add one where a visual genuinely aids understanding
    more than text alone (e.g. a labeled diagram of a cell is worth it; a diagram of "what is a variable" is not)

Social presence — cartoon instructor character who speaks directly to the learner:
  character (persona: "teacher"|"engineer"|"scientist"|"mentor", mood: "introducing"|"explaining"|"questioning"|"bridging"|"encouraging"|"cautioning", message: string)
  — Choose ONE persona for the entire course and use it consistently in every character block
  — persona: match the subject domain (teacher → general/humanities, engineer → tech/coding, scientist → science/biology/chemistry, mentor → skills/career/personal dev)
  — mood placement rules:
    • introducing  → first block of a lesson, welcoming the learner ("Welcome to this lesson on X…")
    • explaining   → just before a complex concept that benefits from a personal frame ("Let me walk you through…")
    • questioning  → before a knowledge-check or to trigger reflection ("Have you ever wondered…?")
    • bridging     → between major topics to signal a transition ("Now that we've covered X, let's explore Y…")
    • encouraging  → after a demanding section, providing reassurance ("You've just learned something powerful…")
    • cautioning   → before a common mistake or important caveat ("A lot of people get this wrong…")
  — message: 1–3 sentences, conversational first-person voice from the character's perspective
  — Use 1–3 character blocks per lesson MAX; place them where they genuinely add warmth or orientation
  — NEVER place two character blocks back-to-back; always have at least 2 content blocks between them
  — Do NOT use a character block simply to restate what a heading already says

AI Images — photorealistic or illustrative images generated from a text prompt:
  image (prompt: string, caption?: string, alt?: string)
  — The prompt is sent to an image generation model; write it as a detailed visual description
  — When to use: real-world objects/scenes, people/places/things, illustrative photography,
    decorative context images that ground the content in the physical world
  — Do NOT use image when a diagram would be clearer (labeled structure, flow, hierarchy)
  — Prompt writing rules:
    • Be specific and visual: describe subject, style, lighting, mood
    • Good: "A close-up of a human neuron with glowing synaptic connections, digital art, dark background"
    • Good: "A professional presenting to a team in a modern office, warm lighting, photorealistic"
    • Bad: "An image about machine learning" (too vague)
    • Style keywords that work well: "photorealistic", "digital art", "flat illustration", "watercolor",
      "isometric 3D", "minimalist vector"
  — Use at most 1–2 image blocks per course total; only where a real-world visual genuinely enriches understanding

Video — use sparingly, only where a video would genuinely help:
  youtube (searchQuery: string)
  — searchQuery should be a precise search like "how photosynthesis works animation"
  — DO NOT include a youtube block in every lesson; only add one where it meaningfully supports understanding

## Rules
- Every field must have content. Do not output empty strings, empty arrays, or placeholder text.
- Do NOT include an 'id' field — IDs are assigned automatically.
- Make content educational, accurate, and appropriate for self-paced e-learning.`;

export async function generateCourse(inputText) {
  const data = await callClaude({
    model: MODEL,
    max_tokens: 16000,
    system: COURSE_SYSTEM,
    tools: [COURSE_TOOL],
    tool_choice: { type: 'tool', name: 'save_course' },
    messages: [
      {
        role: 'user',
        content: `Generate a course for the following:\n\n${inputText}`,
      },
    ],
  });

  const toolUse = data.content.find((b) => b.type === 'tool_use');
  if (!toolUse) throw new Error('Claude did not return a course structure.');

  // If lessons are empty the response was almost certainly truncated (max_tokens hit)
  if (!toolUse.input?.lessons?.length) {
    const reason = data.stop_reason ?? 'unknown';
    throw new Error(
      `Course was generated with no lessons (stop_reason: ${reason}). ` +
      'The topic may have produced a very large response — try a more focused topic or shorter input.'
    );
  }

  const course = assignIds(toolUse.input);
  return resolveYouTubeBlocks(course);
}

// ── Block refinement ───────────────────────────────────────────────────────
const REFINE_SYSTEM = `You are an expert instructional designer. Given a single course block (JSON) and a user instruction, return a revised version of that block as valid JSON. Preserve the block type. Only output the JSON object, no markdown fences.`;

export async function refineBlock(block, instruction) {
  const data = await callClaude({
    model: MODEL,
    max_tokens: 2000,
    system: REFINE_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Here is the block:\n\n${JSON.stringify(block, null, 2)}\n\nInstruction: ${instruction}\n\nReturn the refined block as JSON.`,
      },
    ],
  });

  const text = data.content.find((b) => b.type === 'text')?.text ?? '';
  const clean = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/m, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse refined block from Claude response.');
  }
}
