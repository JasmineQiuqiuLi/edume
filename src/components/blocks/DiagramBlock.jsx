import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DiagramBlock({ block }) {
  // Render SVG as a data-URI image — safe (no script execution) and works in SCORM
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(block.svg)}`;

  return (
    <Box>
      <Box
        component="img"
        src={src}
        alt={block.caption ?? 'Diagram'}
        sx={{
          width: '100%',
          display: 'block',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
        }}
      />
      {block.caption && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block', textAlign: 'center', fontStyle: 'italic' }}
        >
          {block.caption}
        </Typography>
      )}
    </Box>
  );
}
