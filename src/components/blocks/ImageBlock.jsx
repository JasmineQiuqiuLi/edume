import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

// Deterministic seed from prompt so the same course always shows the same image
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

function pollinationsUrl(prompt, width = 800, height = 450) {
  const seed = hashSeed(prompt);
  return (
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&nologo=true&model=flux&seed=${seed}`
  );
}

export default function ImageBlock({ block }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return null; // silently drop if Pollinations fails

  const src = pollinationsUrl(block.prompt);

  return (
    <Box>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={0}
          sx={{ paddingTop: '56.25%', borderRadius: 2, transform: 'none' }}
        />
      )}
      <Box
        component="img"
        src={src}
        alt={block.alt ?? block.caption ?? 'Image'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sx={{
          width: '100%',
          display: loaded ? 'block' : 'none',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
      {loaded && block.caption && (
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
