import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import RichTextRenderer from '../ui/RichTextRenderer';

export default function ScenarioBlock({ block }) {
  const [chosen, setChosen] = useState(null);

  const choice = chosen !== null ? block.choices[chosen] : null;

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2, mb: 2 }}>
        <Typography variant="body1" fontStyle="italic">
          <RichTextRenderer html={block.setupHtml} text={block.setup} />
        </Typography>
      </Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        What do you do?
      </Typography>
      <Stack spacing={1}>
        {block.choices.map((c, i) => (
          <Paper
            key={i}
            variant="outlined"
            onClick={() => setChosen(i)}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              borderColor: chosen === i ? 'primary.main' : 'divider',
              borderWidth: chosen === i ? 2 : 1,
              transition: 'all 0.15s',
              '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
            }}
          >
            <RichTextRenderer html={c.labelHtml} text={c.label} />
          </Paper>
        ))}
      </Stack>
      <Collapse in={chosen !== null}>
        {choice && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: choice.isCorrect ? 'success.light' : 'error.light',
              border: 1,
              borderColor: choice.isCorrect ? 'success.main' : 'error.main',
            }}
          >
            <Typography fontWeight={600} gutterBottom>
              {choice.isCorrect ? '✓ Good choice!' : '✗ Not quite'}
            </Typography>
            <RichTextRenderer html={choice.consequenceHtml} text={choice.consequence} />
          </Box>
        )}
      </Collapse>
      {chosen !== null && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => setChosen(null)}>
          Try Another Choice
        </Button>
      )}
    </Box>
  );
}
