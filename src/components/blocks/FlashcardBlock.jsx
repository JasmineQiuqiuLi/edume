import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Slight rotations for ghost cards — gives the "deck of cards" look
const GHOST_ROTATIONS = [-5, 3.5];
const GHOST_COLORS = ['#E0E7FF', '#C7D2FE'];

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Box
      onClick={() => setFlipped((f) => !f)}
      sx={{
        perspective: '1200px',
        cursor: 'pointer',
        userSelect: 'none',
        height: '100%',
        width: '100%',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            bgcolor: '#fff',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 32px rgba(79,70,229,0.10), 0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            gap: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              opacity: 0.55,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.68rem',
            }}
          >
            Tap to flip
          </Typography>
          <Typography variant="h6" align="center" fontWeight={700} color="text.primary">
            {card.front}
          </Typography>
        </Box>

        {/* Back */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(79,70,229,0.22)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            gap: 1.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.68rem',
            }}
          >
            Answer
          </Typography>
          <Typography variant="body1" align="center" color="#fff" fontWeight={500} lineHeight={1.6}>
            {card.back}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function FlashcardBlock({ block }) {
  const [index, setIndex] = useState(0);
  const cards = block.cards ?? [];
  const ghostCount = Math.min(2, cards.length - 1);

  return (
    <Box>
      {/* Row: arrow · card stack · arrow */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          sx={{ flexShrink: 0, color: 'text.secondary' }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>

        {/* Card stack */}
        <Box sx={{ flex: 1, position: 'relative', height: 220 }}>
          {/* Ghost cards behind — show as a tilted deck */}
          {GHOST_ROTATIONS.slice(0, ghostCount).map((angle, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: GHOST_COLORS[i],
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                transform: `rotate(${angle}deg)`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.07)',
                zIndex: ghostCount - i,
              }}
            />
          ))}

          {/* Active card — always on top */}
          <Box sx={{ position: 'absolute', inset: 0, zIndex: ghostCount + 1 }}>
            <Flashcard key={index} card={cards[index]} />
          </Box>
        </Box>

        <IconButton
          onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}
          disabled={index === cards.length - 1}
          sx={{ flexShrink: 0, color: 'text.secondary' }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>
      </Box>

      {/* Counter */}
      {cards.length > 1 && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}
        >
          {index + 1} / {cards.length}
        </Typography>
      )}
    </Box>
  );
}
