import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

const SUGGESTIONS = [
  'Make this more concise',
  'Add more detail',
  'Simplify the language',
  'Add a real-world example',
  'Make it more engaging',
];

export default function RefineBlockModal({ block, loading, onRefine, onClose }) {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = () => {
    if (instruction.trim()) onRefine(instruction.trim());
  };

  return (
    <Dialog open onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        AI Refine Block
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          ({block.type})
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Describe how you want Claude to improve this block:
          </Typography>
          <TextField
            autoFocus
            multiline
            minRows={3}
            fullWidth
            placeholder='e.g. "Make this more concise and add a real-world example"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
            }}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {SUGGESTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outlined"
                clickable
                disabled={loading}
                onClick={() => setInstruction(s)}
              />
            ))}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!instruction.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Refining…' : 'Refine'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
