import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Simple JSON editor for block types that don't have a custom form
function JsonEditor({ value, onChange }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState(null);

  const handleChange = (raw) => {
    setText(raw);
    try {
      onChange(JSON.parse(raw));
      setError(null);
    } catch {
      setError('Invalid JSON');
    }
  };

  return (
    <>
      <TextField
        multiline
        minRows={8}
        maxRows={20}
        fullWidth
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        error={!!error}
        helperText={error}
        sx={{ fontFamily: 'monospace' }}
        inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
      />
    </>
  );
}

// Custom editor for simple text-content blocks
function ContentEditor({ block, onChange }) {
  return (
    <TextField
      label="Content"
      multiline
      minRows={3}
      fullWidth
      value={block.content ?? ''}
      onChange={(e) => onChange({ ...block, content: e.target.value })}
    />
  );
}

function getEditorFor(block, onChange) {
  const textBlocks = ['heading', 'paragraph', 'statement', 'quote'];
  if (textBlocks.includes(block.type)) {
    return <ContentEditor block={block} onChange={onChange} />;
  }
  return <JsonEditor value={block} onChange={onChange} />;
}

export default function EditBlockModal({ block, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...block });

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Block
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          ({block.type})
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          {getEditorFor(draft, setDraft)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(draft)}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
