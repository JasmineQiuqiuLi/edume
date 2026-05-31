import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { BLOCK_CATALOG, BLOCK_CATEGORIES, createDefaultBlock } from '../blocks/blockCatalog';
import EditBlockModal from './EditBlockModal';

export default function AddBlockModal({ open, onClose, onAdd }) {
  const [selectedType, setSelectedType] = useState(null);

  if (!open) return null;

  if (selectedType) {
    const block = createDefaultBlock(selectedType);
    return (
      <EditBlockModal
        block={block}
        title="Add Block"
        onClose={() => setSelectedType(null)}
        onSave={(draft, options) => {
          onAdd(draft, options);
          setSelectedType(null);
        }}
      />
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Block</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {BLOCK_CATEGORIES.map((category) => {
            const blocks = BLOCK_CATALOG.filter((block) => block.category === category);
            if (!blocks.length) return null;
            return (
              <Box key={category}>
                <Typography variant="caption" fontWeight={800} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {category}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 1,
                    mt: 1,
                  }}
                >
                  {blocks.map((block) => (
                    <Paper
                      key={block.type}
                      variant="outlined"
                      onClick={() => setSelectedType(block.type)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>{block.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{block.type}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
