import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function RevealBlock({ block }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="body1" fontWeight={500} gutterBottom>
        {block.prompt}
      </Typography>
      {!revealed && (
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => setRevealed(true)}
          size="small"
        >
          Reveal Answer
        </Button>
      )}
      <Collapse in={revealed}>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            borderRadius: 1,
          }}
        >
          <Typography variant="body1">{block.revealContent}</Typography>
        </Box>
      </Collapse>
      {revealed && (
        <Button size="small" sx={{ mt: 1 }} onClick={() => setRevealed(false)}>
          Hide
        </Button>
      )}
    </Box>
  );
}
