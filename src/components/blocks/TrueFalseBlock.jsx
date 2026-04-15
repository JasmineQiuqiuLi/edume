import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';

export default function TrueFalseBlock({ block }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === block.correct;

  const getVariant = (value) => {
    if (!submitted) return selected === value ? 'contained' : 'outlined';
    if (value === block.correct) return 'contained';
    if (value === selected) return 'contained';
    return 'outlined';
  };

  const getColor = (value) => {
    if (!submitted) return selected === value ? 'primary' : 'inherit';
    if (value === block.correct) return 'success';
    if (value === selected) return 'error';
    return 'inherit';
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {block.statement}
      </Typography>
      <Stack direction="row" spacing={2}>
        {[true, false].map((value) => (
          <Button
            key={String(value)}
            variant={getVariant(value)}
            color={getColor(value)}
            onClick={() => !submitted && setSelected(value)}
            sx={{ minWidth: 100, textTransform: 'none' }}
          >
            {value ? 'True' : 'False'}
          </Button>
        ))}
      </Stack>
      {!submitted && selected !== null && (
        <Button variant="contained" onClick={() => setSubmitted(true)} sx={{ mt: 2 }} size="small">
          Check Answer
        </Button>
      )}
      <Collapse in={submitted}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: isCorrect ? 'success.light' : 'error.light',
          }}
        >
          <Typography fontWeight={600}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</Typography>
          {block.explanation && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {block.explanation}
            </Typography>
          )}
        </Box>
      </Collapse>
      {submitted && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => { setSelected(null); setSubmitted(false); }}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
