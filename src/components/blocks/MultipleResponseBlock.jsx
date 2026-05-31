import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import RichTextRenderer from '../ui/RichTextRenderer';

function sameSelection(selected, correct) {
  const selectedSet = new Set(selected);
  const correctSet = new Set(correct ?? []);
  if (selectedSet.size !== correctSet.size) return false;
  return [...selectedSet].every((value) => correctSet.has(value));
}

export default function MultipleResponseBlock({ block }) {
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const correct = block.correct ?? [];
  const isCorrect = sameSelection(selected, correct);

  const toggle = (index) => {
    if (submitted) return;
    setSelected((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index]
    );
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        <RichTextRenderer html={block.questionHtml} text={block.question} />
      </Typography>
      <Stack spacing={1}>
        {block.options.map((option, i) => {
          let borderColor = 'divider';
          let bgcolor = 'background.paper';
          if (submitted) {
            if (correct.includes(i)) {
              borderColor = 'success.main';
              bgcolor = 'success.light';
            } else if (selected.includes(i)) {
              borderColor = 'error.main';
              bgcolor = 'error.light';
            }
          } else if (selected.includes(i)) {
            borderColor = 'primary.main';
            bgcolor = 'action.selected';
          }

          return (
            <Box
              key={i}
              onClick={() => toggle(i)}
              sx={{
                px: 1.5,
                py: 0.75,
                border: 1,
                borderColor,
                borderRadius: 1.5,
                bgcolor,
                cursor: submitted ? 'default' : 'pointer',
              }}
            >
              <FormControlLabel
                control={<Checkbox checked={selected.includes(i)} disabled={submitted} />}
                label={<RichTextRenderer html={block.optionsHtml?.[i]} text={option} />}
                sx={{ m: 0, width: '100%' }}
              />
            </Box>
          );
        })}
      </Stack>
      {!submitted && selected.length > 0 && (
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
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </Typography>
          {block.explanation && (
            <RichTextRenderer html={block.explanationHtml} text={block.explanation} sx={{ mt: 0.5 }} />
          )}
        </Box>
      </Collapse>
      {submitted && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => { setSelected([]); setSubmitted(false); }}>
          Try Again
        </Button>
      )}
    </Box>
  );
}
