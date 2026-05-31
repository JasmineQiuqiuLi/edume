import RichTextRenderer from '../ui/RichTextRenderer';

export default function ParagraphBlock({ block }) {
  return (
    <RichTextRenderer html={block.contentHtml} text={block.content} sx={{ lineHeight: 1.8 }} />
  );
}
