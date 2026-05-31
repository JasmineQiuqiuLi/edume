import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function RiseImageTextBlock({ block }) {
  const imageFirst = block.imagePosition !== 'right';

  const image = block.imageSrc ? (
    <Box>
      <Box
        component="img"
        src={block.imageSrc}
        alt={block.alt ?? block.caption ?? 'Imported Rise image'}
        sx={{
          display: 'block',
          width: '100%',
          maxHeight: 360,
          objectFit: 'contain',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      />
      {block.caption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center', fontStyle: 'italic' }}>
          {block.caption}
        </Typography>
      )}
    </Box>
  ) : null;

  const text = (
    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
      {block.content}
    </Typography>
  );

  return (
    <Stack
      direction={{ xs: 'column', md: imageFirst ? 'row' : 'row-reverse' }}
      spacing={3}
      alignItems="center"
      sx={{
        '& > *': {
          flex: 1,
          minWidth: 0,
          width: '100%',
        },
      }}
    >
      {image}
      {text}
    </Stack>
  );
}
