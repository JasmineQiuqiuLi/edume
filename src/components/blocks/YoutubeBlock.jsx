import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function YoutubeBlock({ block }) {
  const { videoId, caption } = block;
  // Use youtube-nocookie.com to avoid embedding third-party cookies
  const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#000',
          boxShadow: 2,
        }}
      >
        <Box
          component="iframe"
          src={src}
          title={caption || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </Box>
      {caption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {caption}
        </Typography>
      )}
    </Box>
  );
}
