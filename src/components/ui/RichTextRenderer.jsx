import Box from '@mui/material/Box';
import { sanitizeRichHtml, plainTextToHtml } from '../../utils/richText';

export default function RichTextRenderer({ html, text, component = 'div', sx }) {
  const safeHtml = sanitizeRichHtml(html) || plainTextToHtml(text);

  return (
    <Box
      component={component}
      sx={{
        '& p': { m: 0, mb: 1 },
        '& p:last-child': { mb: 0 },
        '& ul, & ol': { mt: 0.5, mb: 1, pl: 3 },
        '& li': { mb: 0.5 },
        '& a': { color: 'primary.main' },
        ...sx,
      }}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
