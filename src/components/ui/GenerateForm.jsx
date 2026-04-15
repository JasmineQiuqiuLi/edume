import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FileUpload from './FileUpload';
import { extractTextFromPdf } from '../../services/pdfService';

const EXAMPLES = [
  'Introduction to machine learning',
  'The French Revolution',
  'How DNS works',
  'Stoic philosophy for beginners',
];

export default function GenerateForm({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [extracting, setExtracting] = useState(false);

  const busy = loading || extracting;
  const canSubmit = (prompt.trim() || pdfFile) && !busy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let text = prompt.trim();

    if (pdfFile) {
      setExtracting(true);
      try {
        const extracted = await extractTextFromPdf(pdfFile);
        text = extracted + (text ? `\n\nAdditional instructions: ${text}` : '');
      } finally {
        setExtracting(false);
      }
    }

    if (text) onSubmit(text);
  };

  return (
    <Paper
      variant="outlined"
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%', p: 3, borderRadius: 3 }}
    >
      <Stack spacing={2.5}>
        <TextField
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          placeholder="e.g. Introduction to machine learning for beginners…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={busy}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.95rem' } }}
        />

        {!prompt && (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {EXAMPLES.map((ex) => (
              <Box
                key={ex}
                onClick={() => setPrompt(ex)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'text.secondary',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                  transition: 'all 0.15s',
                }}
              >
                {ex}
              </Box>
            ))}
          </Stack>
        )}

        <Divider>
          <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
            or upload a PDF
          </Typography>
        </Divider>

        <FileUpload file={pdfFile} onChange={setPdfFile} />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!canSubmit}
          endIcon={busy ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
          fullWidth
        >
          {extracting ? 'Extracting PDF…' : 'Generate course'}
        </Button>
      </Stack>
    </Paper>
  );
}
