import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function RiseProcessBlock({ block }) {
  const steps = block.steps ?? [];
  const [index, setIndex] = useState(0);
  const step = steps[index] ?? steps[0];

  if (!step) return null;

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      {step.imageSrc && (
        <Box
          component="img"
          src={step.imageSrc}
          alt={step.alt ?? step.title ?? 'Process step image'}
          sx={{
            display: 'block',
            width: '100%',
            maxHeight: 420,
            objectFit: 'contain',
            bgcolor: 'grey.50',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        />
      )}

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="caption" color="primary" fontWeight={800}>
          Step {index + 1} of {steps.length}
        </Typography>
        <Box>
          <Typography variant="h6" fontWeight={800} gutterBottom>
            {step.title}
          </Typography>
          {step.content && (
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {step.content}
            </Typography>
          )}
        </Box>

        {steps.length > 1 && (
          <Stack direction="row" spacing={1.5} justifyContent="space-between">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIosNewIcon fontSize="small" />}
              disabled={index === 0}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIosIcon fontSize="small" />}
              disabled={index === steps.length - 1}
              onClick={() => setIndex((current) => Math.min(steps.length - 1, current + 1))}
            >
              Next
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
