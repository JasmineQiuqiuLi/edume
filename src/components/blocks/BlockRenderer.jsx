import HeadingBlock from './HeadingBlock';
import ParagraphBlock from './ParagraphBlock';
import StatementBlock from './StatementBlock';
import QuoteBlock from './QuoteBlock';
import ListBlock from './ListBlock';
import AccordionBlock from './AccordionBlock';
import TabsBlock from './TabsBlock';
import ProcessBlock from './ProcessBlock';
import DividerBlock from './DividerBlock';
import MultipleChoiceBlock from './MultipleChoiceBlock';
import TrueFalseBlock from './TrueFalseBlock';
import FillInBlankBlock from './FillInBlankBlock';
import FlashcardBlock from './FlashcardBlock';
import DragToMatchBlock from './DragToMatchBlock';
import ScenarioBlock from './ScenarioBlock';
import RevealBlock from './RevealBlock';
import YoutubeBlock from './YoutubeBlock';
import DiagramBlock from './DiagramBlock';
import ImageBlock from './ImageBlock';
import CharacterBlock from './CharacterBlock';
import Typography from '@mui/material/Typography';

const BLOCK_MAP = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  statement: StatementBlock,
  quote: QuoteBlock,
  'bullet-list': ListBlock,
  'numbered-list': ListBlock,
  accordion: AccordionBlock,
  tabs: TabsBlock,
  process: ProcessBlock,
  divider: DividerBlock,
  'multiple-choice': MultipleChoiceBlock,
  'true-false': TrueFalseBlock,
  'fill-in-blank': FillInBlankBlock,
  flashcard: FlashcardBlock,
  'drag-to-match': DragToMatchBlock,
  scenario: ScenarioBlock,
  reveal: RevealBlock,
  youtube: YoutubeBlock,
  diagram: DiagramBlock,
  image: ImageBlock,
  character: CharacterBlock,
};

// Returns false for blocks with missing required content so they are silently skipped
function hasContent(block) {
  const text = (s) => typeof s === 'string' && s.trim().length > 0;
  const arr = (a, min = 1) => Array.isArray(a) && a.length >= min;

  switch (block.type) {
    case 'divider':
      return true;
    case 'heading':
    case 'paragraph':
      return text(block.content);
    case 'statement':
      return text(block.variant) && text(block.content);
    case 'quote':
      return text(block.content);
    case 'bullet-list':
    case 'numbered-list':
      return arr(block.items) && block.items.some((i) => text(i));
    case 'accordion':
    case 'tabs':
      return arr(block.items) && block.items.every((i) => text(i.label) && text(i.content));
    case 'process':
      return arr(block.steps) && block.steps.every((s) => text(s.title));
    case 'multiple-choice':
      return text(block.question) && arr(block.options, 2) && typeof block.correct === 'number';
    case 'true-false':
      return text(block.statement) && typeof block.correct === 'boolean';
    case 'fill-in-blank':
      return text(block.template) && text(block.answer);
    case 'flashcard':
      return arr(block.cards) && block.cards.every((c) => text(c.front) && text(c.back));
    case 'drag-to-match':
      return arr(block.pairs, 2) && block.pairs.every((p) => text(p.prompt) && text(p.answer));
    case 'scenario':
      return text(block.setup) && arr(block.choices, 2);
    case 'reveal':
      return text(block.prompt) && text(block.revealContent);
    case 'youtube':
      return text(block.videoId);
    case 'diagram':
      return typeof block.svg === 'string' && block.svg.trim().length > 20;
    case 'image':
      return text(block.prompt);
    case 'character':
      return text(block.message);
    default:
      return true;
  }
}

export default function BlockRenderer({ block }) {
  if (!hasContent(block)) return null;

  const Component = BLOCK_MAP[block.type];
  if (!Component) {
    return (
      <Typography color="error" variant="body2">
        Unknown block type: {block.type}
      </Typography>
    );
  }
  return <Component block={block} />;
}
