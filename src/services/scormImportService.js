import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeRichHtml, richTextToPlainText } from '../utils/richText.js';

const RISE_INDEX_PATH = 'scormcontent/index.html';

function textFromHtml(value) {
  if (value && typeof value === 'object') {
    return textFromHtml(value.description ?? value.paragraph ?? value.title ?? '');
  }
  return richTextToPlainText(value);
}

function htmlFromRise(value) {
  if (value && typeof value === 'object') {
    return htmlFromRise(value.description ?? value.paragraph ?? value.title ?? '');
  }
  return sanitizeRichHtml(value);
}

function decodeBase64Json(encoded) {
  try {
    if (typeof atob === 'function') {
      const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    }
  } catch {
    // Fall through to Node-compatible decoding below.
  }

  if (globalThis.Buffer) {
    return JSON.parse(globalThis.Buffer.from(encoded, 'base64').toString('utf8'));
  }

  throw new Error('Unable to decode Rise course payload.');
}

function extractManifestTitle(manifestXml) {
  if (!manifestXml) return '';
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(manifestXml, 'application/xml');
    return doc.querySelector('organization > title')?.textContent?.trim()
      || doc.querySelector('title')?.textContent?.trim()
      || '';
  }

  return manifestXml.match(/<organization[\s\S]*?<title>([\s\S]*?)<\/title>/i)?.[1]?.trim()
    || manifestXml.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim()
    || '';
}

function extractRisePayload(indexHtml) {
  const match = indexHtml.match(/deserialize\("([^"]+)"\)/);
  if (!match) {
    throw new Error('This SCORM package was not recognized as a Rise 360 export.');
  }

  try {
    const payload = decodeBase64Json(match[1]);
    if (!payload?.course?.lessons) {
      throw new Error('Missing Rise course data.');
    }
    return payload.course;
  } catch (err) {
    throw new Error(`The embedded Rise course payload could not be read. ${err.message}`);
  }
}

function mimeFromPath(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function mediaKey(item) {
  const image = item?.media?.image;
  return image?.crushedKey || image?.originalUrl || image?.key || '';
}

function normalizeAssetName(value) {
  const raw = String(value ?? '').split('/').pop() ?? '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function resolveImageDataUrl(zip, item, warnings) {
  const key = mediaKey(item);
  if (!key) return null;

  const assetName = normalizeAssetName(key);
  const candidates = [
    `scormcontent/assets/${assetName}`,
    `scormcontent/assets/${key}`,
  ];

  let filePath = candidates.find((candidate) => zip.file(candidate));
  if (!filePath) {
    const lowerName = assetName.toLowerCase();
    filePath = Object.keys(zip.files).find((path) =>
      path.toLowerCase().startsWith('scormcontent/assets/')
      && normalizeAssetName(path).toLowerCase() === lowerName
    );
  }

  if (!filePath) {
    warnings.push(`Missing image asset: ${assetName || key}`);
    return null;
  }

  const base64 = await zip.file(filePath).async('base64');
  return {
    src: `data:${mimeFromPath(filePath)};base64,${base64}`,
    name: assetName,
  };
}

function blockId(sourceId) {
  return sourceId ? `rise_${sourceId}` : uuidv4();
}

function compactBlocks(blocks) {
  return blocks.filter(Boolean).filter((block) => {
    if (block.type === 'divider') return true;
    if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'statement') {
      return String(block.content ?? '').trim();
    }
    if (block.type === 'image') return block.src || block.prompt;
    if (block.type === 'rise-image-text') return block.imageSrc || block.content;
    if (block.type === 'flashcard') return block.cards?.length;
    if (block.type === 'tabs') return block.items?.length;
    if (block.type === 'process' || block.type === 'rise-process') return block.steps?.length;
    return true;
  });
}

function placeholder(riseBlock, reason) {
  const kind = [riseBlock.type, riseBlock.family, riseBlock.variant].filter(Boolean).join(' / ') || 'unknown';
  return {
    id: blockId(riseBlock.id),
    type: 'statement',
    variant: 'warning',
    content: `Unsupported Rise block: ${kind}. ${reason}`,
    sourceBlock: {
      id: riseBlock.id,
      type: riseBlock.type,
      family: riseBlock.family,
      variant: riseBlock.variant,
    },
  };
}

async function convertImageBlock(zip, riseBlock, warnings) {
  if (riseBlock.variant === 'text aside') {
    const item = riseBlock.items?.[0];
    if (!item) return [];
    const image = await resolveImageDataUrl(zip, item, warnings);
    return [{
      id: blockId(item.id || riseBlock.id),
      type: 'rise-image-text',
      imageSrc: image?.src ?? '',
      alt: textFromHtml(item.caption) || image?.name || 'Imported Rise image',
      caption: textFromHtml(item.caption),
      captionHtml: htmlFromRise(item.caption),
      content: textFromHtml(item.paragraph),
      contentHtml: htmlFromRise(item.paragraph),
      imagePosition: riseBlock.settings?.imagePosition === 'right' ? 'right' : 'left',
    }];
  }

  const output = [];
  for (const item of riseBlock.items ?? []) {
    const image = await resolveImageDataUrl(zip, item, warnings);
    const caption = textFromHtml(item.caption);
    const paragraph = textFromHtml(item.paragraph);

    if (image) {
      output.push({
        id: blockId(item.id),
        type: 'image',
        prompt: `Imported Rise image: ${image.name}`,
        src: image.src,
        alt: caption || image.name,
        caption,
        captionHtml: htmlFromRise(item.caption),
      });
    } else {
      output.push({
        id: blockId(item.id),
        type: 'statement',
        variant: 'warning',
        content: `Imported Rise image could not be found: ${mediaKey(item) || 'unknown image'}`,
      });
    }

    if (paragraph) {
      output.push({
        id: uuidv4(),
        type: 'paragraph',
        content: paragraph,
      });
    }
  }
  return output;
}

function convertTextBlock(riseBlock) {
  const output = [];
  for (const item of riseBlock.items ?? []) {
    const heading = textFromHtml(item.heading);
    const paragraph = textFromHtml(item.paragraph);
    const headingHtml = htmlFromRise(item.heading);
    const paragraphHtml = htmlFromRise(item.paragraph);

    if (heading) {
      output.push({
        id: blockId(item.id),
        type: 'heading',
        level: 2,
        content: heading,
        contentHtml: headingHtml,
      });
    }

    if (paragraph) {
      output.push({
        id: heading ? uuidv4() : blockId(item.id),
        type: 'paragraph',
        content: paragraph,
        contentHtml: paragraphHtml,
      });
    }
  }
  return output;
}

function convertFlashcards(riseBlock) {
  const cards = (riseBlock.items ?? [])
    .map((item) => ({
      front: textFromHtml(item.front),
      back: textFromHtml(item.back),
      frontHtml: htmlFromRise(item.front),
      backHtml: htmlFromRise(item.back),
    }))
    .filter((card) => card.front && card.back);

  return cards.length ? [{
    id: blockId(riseBlock.id),
    type: 'flashcard',
    cards,
  }] : [];
}

function convertTabs(riseBlock, warnings) {
  const items = (riseBlock.items ?? [])
    .map((item) => {
      const label = textFromHtml(item.title) || 'Tab';
      const content = textFromHtml(item.description || item.paragraph);
      const contentHtml = htmlFromRise(item.description || item.paragraph);
      if (mediaKey(item)) {
        warnings.push(`Tab image was not imported inside tab "${label}" because this app's tab block only supports text.`);
      }
      return { label, content: content || 'Imported Rise tab content was empty.', contentHtml };
    })
    .filter((item) => item.label && item.content);

  return items.length ? [{
    id: blockId(riseBlock.id),
    type: 'tabs',
    items,
  }] : [];
}

async function convertProcess(zip, riseBlock, warnings) {
  const orderedItems = (riseBlock.items ?? [])
    .filter((item) => !item.isHidden)
    .sort((a, b) => {
      const rank = (item) => {
        if (item.type === 'intro') return 0;
        if (item.type === 'summary') return 2;
        return 1;
      };
      return rank(a) - rank(b);
    });

  const steps = [];
  for (const item of orderedItems) {
    if (item.isHidden) continue;
    const title = textFromHtml(item.title) || 'Step';
    const content = textFromHtml(item.description || item.paragraph);
    const image = await resolveImageDataUrl(zip, item, warnings);
    steps.push({
      title,
      content: content || '',
      contentHtml: htmlFromRise(item.description || item.paragraph),
      imageSrc: image?.src ?? '',
      alt: image?.name ?? title,
    });
  }

  return steps.length ? [{
    id: blockId(riseBlock.id),
    type: 'rise-process',
    steps,
  }] : [];
}

function convertImpactNote(riseBlock) {
  const content = (riseBlock.items ?? [])
    .map((item) => textFromHtml(item.paragraph))
    .filter(Boolean)
    .join('\n\n');
  const contentHtml = (riseBlock.items ?? [])
    .map((item) => htmlFromRise(item.paragraph))
    .filter(Boolean)
    .join('');

  return content ? [{
    id: blockId(riseBlock.id),
    type: 'statement',
    variant: 'note',
    content,
    contentHtml,
  }] : [];
}

function convertKnowledgeCheck(riseBlock) {
  const item = riseBlock.items?.[0];
  if (!item) return [];

  const question = textFromHtml(item.title || item.question);
  const answers = item.answers ?? [];
  const options = answers.map((answer) => textFromHtml(answer.title || answer.text)).filter(Boolean);
  const optionsHtml = answers.map((answer) => htmlFromRise(answer.title || answer.text));
  const correctIndexes = answers
    .map((answer, index) => (answer.correct === true || answer.isCorrect === true ? index : -1))
    .filter((index) => index >= 0);

  if (!question || options.length < 2 || correctIndexes.length === 0) return [];

  if (item.type === 'MULTIPLE_RESPONSE' || correctIndexes.length > 1) {
    return [{
      id: blockId(item.id || riseBlock.id),
      type: 'multiple-response',
      question,
      questionHtml: htmlFromRise(item.title || item.question),
      options,
      optionsHtml,
      correct: correctIndexes,
      explanation: textFromHtml(item.feedback),
      explanationHtml: htmlFromRise(item.feedback),
    }];
  }

  return [{
    id: blockId(item.id || riseBlock.id),
    type: 'multiple-choice',
    question,
    questionHtml: htmlFromRise(item.title || item.question),
    options,
    optionsHtml,
    correct: correctIndexes[0],
    explanation: textFromHtml(item.feedback),
    explanationHtml: htmlFromRise(item.feedback),
  }];
}

async function convertRiseBlock(zip, riseBlock, warnings) {
  const kind = [riseBlock.type, riseBlock.family, riseBlock.variant].join('|');

  if (riseBlock.type === 'text' && riseBlock.family === 'text') {
    return convertTextBlock(riseBlock);
  }

  if (riseBlock.type === 'text' && riseBlock.family === 'impact' && riseBlock.variant === 'note') {
    return convertImpactNote(riseBlock);
  }

  if (riseBlock.type === 'image' && riseBlock.family === 'image') {
    return convertImageBlock(zip, riseBlock, warnings);
  }

  if (riseBlock.type === 'interactive' && riseBlock.family === 'flashcard') {
    return convertFlashcards(riseBlock);
  }

  if (kind === 'interactive|interactive|tabs') {
    return convertTabs(riseBlock, warnings);
  }

  if (kind === 'interactive|interactive-fullscreen|process') {
    return convertProcess(zip, riseBlock, warnings);
  }

  if (riseBlock.type === 'knowledgeCheck' || riseBlock.family === 'knowledgeCheck') {
    const converted = convertKnowledgeCheck(riseBlock);
    if (converted.length) return converted;
    return [placeholder(riseBlock, 'This knowledge check could not be converted into an editable quiz block.')];
  }

  if (kind === 'divider|continue|continue') {
    return [{ id: blockId(riseBlock.id), type: 'divider' }];
  }

  return [placeholder(riseBlock, 'A matching editable block is not available yet.')];
}

export async function importRiseScormPackage(file) {
  let zip;
  try {
    const source = typeof file?.arrayBuffer === 'function' ? await file.arrayBuffer() : file;
    zip = await JSZip.loadAsync(source);
  } catch {
    throw new Error('Invalid ZIP file. Please choose a SCORM package exported from Rise 360.');
  }

  const manifestFile = zip.file('imsmanifest.xml');
  if (!manifestFile) {
    throw new Error('This ZIP is missing imsmanifest.xml, so it does not look like a SCORM package.');
  }

  const indexFile = zip.file(RISE_INDEX_PATH);
  if (!indexFile) {
    throw new Error('This SCORM package was not recognized as a Rise 360 export.');
  }

  const [manifestXml, indexHtml] = await Promise.all([
    manifestFile.async('string'),
    indexFile.async('string'),
  ]);
  const manifestTitle = extractManifestTitle(manifestXml);
  const riseCourse = extractRisePayload(indexHtml);
  const warnings = [];

  const lessons = [];
  let convertedBlockCount = 0;
  let placeholderCount = 0;

  for (const [lessonIndex, riseLesson] of (riseCourse.lessons ?? []).entries()) {
    const blocks = [];
    for (const riseBlock of riseLesson.items ?? []) {
      const converted = await convertRiseBlock(zip, riseBlock, warnings);
      const compacted = compactBlocks(converted);
      placeholderCount += compacted.filter((block) => block.type === 'statement' && block.variant === 'warning').length;
      convertedBlockCount += compacted.length;
      blocks.push(...compacted);
    }

    lessons.push({
      id: riseLesson.id || uuidv4(),
      title: textFromHtml(riseLesson.title) || `Lesson ${lessonIndex + 1}`,
      blocks: blocks.length ? blocks : [placeholder(riseLesson, 'No convertible Rise blocks were found in this lesson.')],
    });
  }

  const title = textFromHtml(riseCourse.title) || manifestTitle || file.name?.replace(/\.zip$/i, '') || 'Imported Rise Course';
  const description = textFromHtml(riseCourse.description) || `Imported from Rise 360 SCORM package ${file.name ?? ''}`.trim();

  return {
    id: uuidv4(),
    title,
    description,
    lessons: lessons.length ? lessons : [{
      id: uuidv4(),
      title: 'Lesson 1',
      blocks: [{
        id: uuidv4(),
        type: 'statement',
        variant: 'warning',
        content: 'No Rise lessons were found in this package.',
      }],
    }],
    source: 'scorm-import',
    sourceTool: 'rise360',
    sourceFilename: file.name ?? '',
    importWarnings: warnings,
    unsupportedBlockCount: placeholderCount,
    importSummary: {
      lessonsImported: lessons.length,
      blocksConverted: convertedBlockCount,
      placeholdersCreated: placeholderCount,
      missingAssets: warnings.filter((warning) => warning.startsWith('Missing image asset:')).length,
    },
  };
}
