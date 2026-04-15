import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Mood configuration — colour + label + emoji convey the expression
// (DiceBear avatars are consistent identity; visual expression comes from the bubble style)
const MOODS = {
  introducing: { label: 'Let me introduce…', emoji: '👋', bg: '#EEF2FF', border: '#A5B4FC', accent: '#4F46E5' },
  explaining:  { label: "Here's how it works", emoji: '💡', bg: '#F0F9FF', border: '#7DD3FC', accent: '#0284C7' },
  questioning: { label: 'Think about this', emoji: '🤔', bg: '#FFFBEB', border: '#FCD34D', accent: '#B45309' },
  bridging:    { label: 'Connecting the dots', emoji: '🔗', bg: '#F0FDF4', border: '#86EFAC', accent: '#16A34A' },
  encouraging: { label: 'Keep it up!', emoji: '⭐', bg: '#FFF7ED', border: '#FDBA74', accent: '#EA580C' },
  cautioning:  { label: 'Watch out for this', emoji: '⚠️', bg: '#FEF3C7', border: '#FDE68A', accent: '#D97706' },
};

// Moods where the character appears on the right (bubble left)
const RIGHT_MOODS = new Set(['questioning', 'bridging']);

// DiceBear fallback — used when no approved character image has been resolved for this block
function diceBearFallback(persona) {
  return `https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(persona ?? 'teacher')}&backgroundColor=transparent`;
}

export default function CharacterBlock({ block }) {
  const persona = block.persona ?? 'teacher';
  const mood    = block.mood ?? 'explaining';
  const colors  = MOODS[mood] ?? MOODS.explaining;
  const isRight = RIGHT_MOODS.has(mood);
  const src = block.imageUrl ?? diceBearFallback(persona);

  const avatar = (
    <Box
      component="img"
      src={src}
      alt={`${persona} instructor`}
      sx={{
        width: 88,
        height: 88,
        flexShrink: 0,
        alignSelf: 'flex-end',
        // round base with a soft coloured ring that matches the bubble
        borderRadius: '50%',
        border: '2.5px solid',
        borderColor: colors.border,
        bgcolor: colors.bg,
        p: '4px',
        boxSizing: 'border-box',
      }}
    />
  );

  const bubble = (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        position: 'relative',
        bgcolor: colors.bg,
        borderRadius: 3,
        border: '1.5px solid',
        borderColor: colors.border,
        // thick accent stripe on the side closest to the character
        ...(!isRight
          ? { borderLeft: `4px solid ${colors.accent}` }
          : { borderRight: `4px solid ${colors.accent}` }),
        px: 2.5,
        py: 2,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: colors.accent,
          fontWeight: 700,
          fontSize: '0.7rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          mb: 0.75,
        }}
      >
        <span>{colors.emoji}</span>
        {colors.label}
      </Typography>
      <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
        {block.message}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
      {!isRight && avatar}
      {bubble}
      {isRight && avatar}
    </Box>
  );
}
