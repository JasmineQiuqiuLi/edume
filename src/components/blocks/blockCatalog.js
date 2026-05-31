export const BLOCK_CATEGORIES = ['Text', 'Interaction', 'Quiz', 'Media', 'Structure'];

export const BLOCK_CATALOG = [
  { type: 'heading', label: 'Heading', category: 'Text', defaults: { type: 'heading', level: 2, content: 'New heading' } },
  { type: 'paragraph', label: 'Paragraph', category: 'Text', defaults: { type: 'paragraph', content: 'New paragraph text.' } },
  { type: 'statement', label: 'Statement', category: 'Text', defaults: { type: 'statement', variant: 'note', content: 'Important note.' } },
  { type: 'quote', label: 'Quote', category: 'Text', defaults: { type: 'quote', content: 'Quote text.', attribution: '' } },
  { type: 'bullet-list', label: 'Bullet List', category: 'Text', defaults: { type: 'bullet-list', items: ['First item', 'Second item'] } },
  { type: 'numbered-list', label: 'Numbered List', category: 'Text', defaults: { type: 'numbered-list', items: ['First step', 'Second step'] } },
  { type: 'accordion', label: 'Accordion', category: 'Interaction', defaults: { type: 'accordion', items: [{ label: 'Section', content: 'Section content' }] } },
  { type: 'tabs', label: 'Tabs', category: 'Interaction', defaults: { type: 'tabs', items: [{ label: 'Tab 1', content: 'Tab content' }, { label: 'Tab 2', content: 'More content' }] } },
  { type: 'process', label: 'Process', category: 'Interaction', defaults: { type: 'process', steps: [{ title: 'Step 1', content: 'Describe this step' }] } },
  { type: 'flashcard', label: 'Flashcards', category: 'Interaction', defaults: { type: 'flashcard', cards: [{ front: 'Question or term', back: 'Answer or definition' }] } },
  { type: 'scenario', label: 'Scenario', category: 'Interaction', defaults: { type: 'scenario', setup: 'Describe the situation.', choices: [{ label: 'Good choice', isCorrect: true, consequence: 'This is a good outcome.' }, { label: 'Risky choice', isCorrect: false, consequence: 'This could cause issues.' }] } },
  { type: 'reveal', label: 'Reveal', category: 'Interaction', defaults: { type: 'reveal', prompt: 'Prompt text', revealContent: 'Hidden answer or explanation.' } },
  { type: 'multiple-choice', label: 'Multiple Choice', category: 'Quiz', defaults: { type: 'multiple-choice', question: 'Question text?', options: ['Correct answer', 'Incorrect answer'], correct: 0, explanation: '' } },
  { type: 'true-false', label: 'True / False', category: 'Quiz', defaults: { type: 'true-false', statement: 'Statement text.', correct: true, explanation: '' } },
  { type: 'fill-in-blank', label: 'Fill in the Blank', category: 'Quiz', defaults: { type: 'fill-in-blank', template: 'The answer is ___.', answer: 'answer', hint: '' } },
  { type: 'drag-to-match', label: 'Drag to Match', category: 'Quiz', defaults: { type: 'drag-to-match', pairs: [{ prompt: 'Prompt 1', answer: 'Answer 1' }, { prompt: 'Prompt 2', answer: 'Answer 2' }] } },
  { type: 'image', label: 'AI Image', category: 'Media', defaults: { type: 'image', prompt: 'Image prompt', alt: '', caption: '' } },
  { type: 'youtube', label: 'YouTube', category: 'Media', defaults: { type: 'youtube', videoId: '', caption: '' } },
  { type: 'diagram', label: 'Diagram SVG', category: 'Media', defaults: { type: 'diagram', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#ffffff"/><text x="50%" y="50%" text-anchor="middle" font-size="32">Diagram</text></svg>', caption: '' } },
  { type: 'character', label: 'Character', category: 'Media', defaults: { type: 'character', persona: 'Instructor', mood: 'explaining', message: 'Character message.', imageUrl: null } },
  { type: 'divider', label: 'Divider', category: 'Structure', defaults: { type: 'divider' } },
];

export function getBlockDefinition(type) {
  return BLOCK_CATALOG.find((block) => block.type === type);
}

export function createDefaultBlock(type) {
  const definition = getBlockDefinition(type) ?? BLOCK_CATALOG[0];
  return JSON.parse(JSON.stringify(definition.defaults));
}
