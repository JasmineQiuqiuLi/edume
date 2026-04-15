// Pre-defined instructor character profile images.
// Images are downloaded locally via `npm run download:characters` and stored in public/characters/.
// Users can delete image files they don't like; CharactersPage auto-removes missing entries.

const PROFILES = [
  // ── Teachers ──────────────────────────────────────────────────────────────
  { id: 'teacher_1',   persona: 'teacher',   label: 'Teacher — Warm & Professional',       url: '/characters/teacher_1.svg' },
  { id: 'teacher_2',   persona: 'teacher',   label: 'Teacher — Casual & Approachable',      url: '/characters/teacher_2.svg' },
  { id: 'teacher_3',   persona: 'teacher',   label: 'Teacher — Energetic & Expressive',     url: '/characters/teacher_3.svg' },
  // ── Engineers ─────────────────────────────────────────────────────────────
  { id: 'engineer_1',  persona: 'engineer',  label: 'Engineer — Modern Tech',               url: '/characters/engineer_1.svg' },
  { id: 'engineer_2',  persona: 'engineer',  label: 'Engineer — Casual Developer',          url: '/characters/engineer_2.svg' },
  { id: 'engineer_3',  persona: 'engineer',  label: 'Engineer — Senior & Thoughtful',       url: '/characters/engineer_3.svg' },
  // ── Scientists ────────────────────────────────────────────────────────────
  { id: 'scientist_1', persona: 'scientist', label: 'Scientist — Enthusiastic Researcher',  url: '/characters/scientist_1.svg' },
  { id: 'scientist_2', persona: 'scientist', label: 'Scientist — Thoughtful Analyst',       url: '/characters/scientist_2.svg' },
  { id: 'scientist_3', persona: 'scientist', label: 'Scientist — Curious & Friendly',       url: '/characters/scientist_3.svg' },
  // ── Mentors ───────────────────────────────────────────────────────────────
  { id: 'mentor_1',    persona: 'mentor',    label: 'Mentor — Wise & Experienced',          url: '/characters/mentor_1.svg' },
  { id: 'mentor_2',    persona: 'mentor',    label: 'Mentor — Confident Coach',             url: '/characters/mentor_2.svg' },
  { id: 'mentor_3',    persona: 'mentor',    label: 'Mentor — Approachable Guide',          url: '/characters/mentor_3.svg' },
];

export default PROFILES;
