import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import useCourseStore from '../store/courseStore';
import DEFAULT_PROFILES from '../data/characterProfiles';

const PERSONA_LABELS = {
  teacher:   'Teacher',
  engineer:  'Engineer',
  scientist: 'Scientist',
  mentor:    'Mentor',
};

const PERSONA_COLORS = {
  teacher:   '#4F46E5',
  engineer:  '#0891B2',
  scientist: '#059669',
  mentor:    '#D97706',
};

// Same loading pattern as ImageBlock — Skeleton as in-flow sibling, not absolutely positioned
function CharacterCard({ character, onDelete, onNotFound }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
        overflow: 'hidden',
      }}
    >
      {/* Skeleton visible while the image is still loading */}
      {!loaded && !error && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={0}
          sx={{ paddingTop: '100%', transform: 'none' }}
        />
      )}

      {/* Error fallback */}
      {error && (
        <Box
          sx={{
            width: '100%',
            paddingTop: '100%',
            position: 'relative',
            bgcolor: 'grey.100',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" color="text.disabled">
              Failed to load
            </Typography>
          </Box>
        </Box>
      )}

      {/* Image — rendered into the DOM immediately so onLoad fires reliably */}
      {!error && (
        <Box
          component="img"
          src={character.url}
          alt={character.label}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); onNotFound?.(character.id); }}
          sx={{
            width: '100%',
            display: loaded ? 'block' : 'none',
            objectFit: 'cover',
            aspectRatio: '1',
          }}
        />
      )}

      <CardContent sx={{ py: 1.5, flex: 1 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {character.label}
        </Typography>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 1.5, pb: 1.5, justifyContent: 'flex-end' }}>
        <IconButton
          size="small"
          onClick={() => onDelete(character.id)}
          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
          title="Remove this character"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}

const PERSONAS = ['teacher', 'engineer', 'scientist', 'mentor'];

export default function CharactersPage() {
  const navigate = useNavigate();
  const approvedCharacters = useCourseStore((s) => s.approvedCharacters);
  const removeCharacter    = useCourseStore((s) => s.removeCharacter);
  const resetCharacters    = useCourseStore((s) => s.resetCharacters);

  // Silently drop any character whose image file was deleted by the user
  const handleNotFound = (id) => removeCharacter(id);

  const handleDelete = (id) => {
    if (window.confirm('Remove this character from the pool?')) removeCharacter(id);
  };

  const handleReset = () => {
    if (window.confirm('Restore all default characters? This will bring back any you removed.'))
      resetCharacters();
  };

  const removedCount = DEFAULT_PROFILES.length - approvedCharacters.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          <IconButton onClick={() => navigate('/courses')} size="small" edge="start">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
            Instructor Characters
          </Typography>
          {removedCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleReset}
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            >
              Restore ({removedCount})
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          These are the AI-generated instructor characters available for your courses.
          Delete any that don't look right — the remaining ones will be used automatically.
          Each course picks one character per persona type and uses it consistently throughout.
        </Alert>

        {PERSONAS.map((persona, i) => {
          const characters = approvedCharacters.filter((c) => c.persona === persona);
          return (
            <Box key={persona}>
              {i > 0 && <Divider sx={{ my: 4 }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Chip
                  label={PERSONA_LABELS[persona]}
                  size="small"
                  sx={{
                    bgcolor: PERSONA_COLORS[persona],
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
                <Typography variant="body2" color="text.disabled">
                  {characters.length} available
                </Typography>
              </Box>

              {characters.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', pl: 1 }}>
                  No characters remaining for this persona — courses will use a generic avatar.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {characters.map((char) => (
                    <Grid key={char.id} size={{ xs: 6, sm: 4, md: 3 }}>
                      <CharacterCard character={char} onDelete={handleDelete} onNotFound={handleNotFound} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          );
        })}
      </Container>
    </Box>
  );
}
