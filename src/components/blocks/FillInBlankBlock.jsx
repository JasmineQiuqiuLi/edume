import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';

export default function FillInBlankBlock({ block }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isCorrect =
    answer.trim().toLowerCase() === block.answer.trim().toLowerCase();

  const parts = block.template.split('___');

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Fill in the blank:
      </Typography>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        {parts.map((part, i) => (
          <Stack key={i} direction="row" alignItems="center" gap={1}>
            <Typography>{part}</Typography>
            {i < parts.length - 1 && (
              <TextField
                size="small"
                value={answer}
                onChange={(e) => !submitted && setAnswer(e.target.value)}
                disabled={submitted}
                placeholder={block.hint ?? 'Your answer'}
                sx={{ width: 180 }}
                onKeyDown={(e) => e.key === 'Enter' && !submitted && setSubmitted(true)}
              />
            )}
          </Stack>
        ))}
      </Stack>
      {!submitted && (
        <Button
          variant="contained"
          onClick={() => setSubmitted(true)}
          sx={{ mt: 2 }}
          size="small"
          disabled={!answer.trim()}
        >
          Check
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
            {isCorrect ? '✓ Correct!' : `✗ The answer is: ${block.answer}`}
          </Typography>
        </Box>
      </Collapse>
      {submitted && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => { setAnswer(''); setSubmitted(false); }}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
