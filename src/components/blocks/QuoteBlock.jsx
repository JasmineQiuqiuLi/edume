import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RichTextRenderer from '../ui/RichTextRenderer';

export default function QuoteBlock({ block }) {
  return (
    <Box
      sx={{
        borderLeft: 4,
        borderColor: 'primary.main',
        pl: 3,
        py: 1,
        my: 1,
        bgcolor: 'action.hover',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <RichTextRenderer html={block.contentHtml} text={block.content} sx={{ fontStyle: 'italic', fontSize: '1.1rem' }} />
      {block.attribution && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          — {block.attribution}
        </Typography>
      )}
    </Box>
  );
}
