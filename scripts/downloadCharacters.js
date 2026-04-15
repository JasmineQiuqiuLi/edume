/**
 * Downloads all instructor character profile SVGs from DiceBear (avataaars style)
 * and saves them as SVG files in public/characters/.
 *
 * Run once with:  npm run download:characters
 *
 * After running, open public/characters/ in your file explorer,
 * review the images, and delete any you don't want.
 * The app will automatically stop using deleted images on next load.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/characters');

mkdirSync(OUT_DIR, { recursive: true });

// ── DiceBear avataaars URL builder ────────────────────────────────────────
// Valid top values:    bob, bun, curly, curvy, dreads, frida, fro, froBand,
//   longButNotTooLong, miaWallace, shavedSides, straight01, straight02,
//   straightAndStrand, dreads01, dreads02, frizzle, shaggy, shaggyMullet,
//   shortCurly, shortFlat, shortRound, shortWaved, sides, theCaesar,
//   theCaesarAndSidePart, bigHair
// Valid skinColor:     614335, d08b5b, ae5d29, edb98a, ffdbb4, f8d25c
// Valid hairColor:     a55728, 2c1b18, b58143, d6b370, 724133, 4a312c, e8e1e1
// Valid mouth (happy): smile, twinkle
// Valid facialHair:    beardLight, beardMajestic, beardMedium, moustacheFancy
function avatarUrl({ seed, skin, hair, top, facialHair, accessory, bg = 'f8fafc' }) {
  const p = new URLSearchParams({ seed, backgroundColor: bg, backgroundType: 'solid' });
  // Lock mouth to happy expressions only
  p.append('mouth[]', 'smile');
  p.append('mouth[]', 'twinkle');
  // Open/happy eyes only
  p.append('eyes[]', 'default');
  p.append('eyes[]', 'happy');
  if (skin)      p.append('skinColor[]', skin);
  if (hair)      p.append('hairColor[]', hair);
  if (top)       p.append('top[]', top);
  if (facialHair) {
    p.append('facialHair[]', facialHair);
  } else {
    p.set('facialHairProbability', '0');  // no beard unless requested
  }
  if (accessory) p.append('accessories[]', accessory);
  return `https://api.dicebear.com/9.x/avataaars/svg?${p}`;
}

// ── 12 diverse professional characters ───────────────────────────────────
const CHARACTERS = [
  // Teachers
  { id: 'teacher_1',   url: avatarUrl({ seed: 'T1', skin: 'f8d25c', hair: '4a312c', top: 'longButNotTooLong', bg: 'faf5ff' }) },
  { id: 'teacher_2',   url: avatarUrl({ seed: 'T2', skin: 'ae5d29', hair: '2c1b18', top: 'theCaesar',          bg: 'eff6ff' }) },
  { id: 'teacher_3',   url: avatarUrl({ seed: 'T3', skin: '614335', hair: '2c1b18', top: 'curly',              bg: 'fdf4ff' }) },
  // Engineers
  { id: 'engineer_1',  url: avatarUrl({ seed: 'E1', skin: 'd08b5b', hair: '4a312c', top: 'straight02',         bg: 'f0f9ff' }) },
  { id: 'engineer_2',  url: avatarUrl({ seed: 'E2', skin: 'edb98a', hair: '724133', top: 'shortWaved',          bg: 'ecfdf5' }) },
  { id: 'engineer_3',  url: avatarUrl({ seed: 'E3', skin: 'ffdbb4', hair: 'b58143', top: 'shortFlat', facialHair: 'beardMedium', bg: 'fff7ed' }) },
  // Scientists
  { id: 'scientist_1', url: avatarUrl({ seed: 'S1', skin: 'f8d25c', hair: '2c1b18', top: 'bun',    accessory: 'prescription01', bg: 'f0fdf4' }) },
  { id: 'scientist_2', url: avatarUrl({ seed: 'S2', skin: 'ae5d29', hair: '2c1b18', top: 'dreads01',            bg: 'fefce8' }) },
  { id: 'scientist_3', url: avatarUrl({ seed: 'S3', skin: 'edb98a', hair: 'b58143', top: 'straight01',          bg: 'f0fdf4' }) },
  // Mentors
  { id: 'mentor_1',    url: avatarUrl({ seed: 'M1', skin: 'ffdbb4', hair: 'e8e1e1', top: 'shortFlat', facialHair: 'beardLight', bg: 'fefce8' }) },
  { id: 'mentor_2',    url: avatarUrl({ seed: 'M2', skin: 'd08b5b', hair: 'e8e1e1', top: 'bob',                 bg: 'fff1f2' }) },
  { id: 'mentor_3',    url: avatarUrl({ seed: 'M3', skin: '614335', hair: '2c1b18', top: 'theCaesarAndSidePart', bg: 'fefce8' }) },
];

// ── Download helper ────────────────────────────────────────────────────────
async function downloadOne(id, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  writeFileSync(join(OUT_DIR, `${id}.svg`), text, 'utf8');
}

// ── Main ──────────────────────────────────────────────────────────────────
console.log(`\nDownloading ${CHARACTERS.length} character SVGs to public/characters/\n`);

let ok = 0;
let fail = 0;

for (const { id, url } of CHARACTERS) {
  process.stdout.write(`[${ok + fail + 1}/${CHARACTERS.length}] ${id} … `);
  try {
    await downloadOne(id, url);
    console.log('✓');
    ok++;
  } catch (err) {
    console.log(`✗  ${err.message}`);
    fail++;
  }
}

console.log(`\nDone — ${ok} saved, ${fail} failed.`);
if (ok > 0) {
  console.log(`\nOpen public/characters/ in your file explorer and delete any`);
  console.log(`images you don't want. The app will stop using them automatically.\n`);
}
