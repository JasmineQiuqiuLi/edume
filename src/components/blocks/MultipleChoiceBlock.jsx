import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';

export default function MultipleChoiceBlock({ block }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === block.correct;

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {block.question}
      </Typography>
      <Stack spacing={1}>
        {block.options.map((option, i) => {
          let color = 'inherit';
          let variant = 'outlined';
          if (submitted) {
            if (i === block.correct) { color = 'success'; variant = 'contained'; }
            else if (i === selected) { color = 'error'; variant = 'contained'; }
          } else if (i === selected) {
            color = 'primary'; variant = 'contained';
          }
          return (
            <Button
              key={i}
              variant={variant}
              color={color}
              onClick={() => !submitted && setSelected(i)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
              fullWidth
            >
              {option}
            </Button>
          );
        })}
      </Stack>
      {!submitted && selected !== null && (
        <Button
          variant="contained"
          onClick={() => setSubmitted(true)}
          sx={{ mt: 2 }}
          size="small"
        >
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
          <Typography fontWeight={600}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </Typography>
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
