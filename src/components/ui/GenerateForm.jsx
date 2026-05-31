import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FileUpload from './FileUpload';
import { extractTextFromPdf } from '../../services/pdfService';

const EXAMPLES = [
  'Introduction to machine learning',
  'The French Revolution',
  'How DNS works',
  'Stoic philosophy for beginners',
];

const AUDIENCES = ['General learners', 'Students', 'Employees', 'Professionals', 'Beginners', 'Custom'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Mixed'];
const STYLES = ['Conversational and practical', 'Academic', 'Practical', 'Compliance/training', 'Conversational', 'Custom'];
const LESSON_COUNTS = ['Auto', '1', '2-3', '3-5', '5-8'];

function appendSection(lines, label, value) {
  const text = String(value ?? '').trim();
  if (text) lines.push(`${label}:\n${text}`);
}

function optionValue(selected, custom) {
  return selected === 'Custom' ? custom.trim() : selected;
}

export default function GenerateForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [audience, setAudience] = useState('General learners');
  const [customAudience, setCustomAudience] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [style, setStyle] = useState('Conversational and practical');
  const [customStyle, setCustomStyle] = useState('');
  const [lessonCount, setLessonCount] = useState('Auto');
  const [goals, setGoals] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const busy = loading || extracting;
  const canContinue = (prompt.trim() || pdfFile) && !busy;

  const composeBrief = async () => {
    const sourceTopic = prompt.trim();
    const lines = ['Create a course from the following generation brief. Treat the preferences as requirements when possible.'];

    appendSection(lines, 'Source topic or additional context', sourceTopic);

    if (pdfFile) {
      setExtracting(true);
      try {
        const extracted = await extractTextFromPdf(pdfFile);
        appendSection(lines, 'Source document text', extracted);
      } finally {
        setExtracting(false);
      }
    }

    appendSection(lines, 'Audience', optionValue(audience, customAudience));
    appendSection(lines, 'Learner level', level);
    appendSection(lines, 'Course style', optionValue(style, customStyle));
    appendSection(lines, 'Learning goals', goals);
    appendSection(lines, 'Preferred lesson count', lessonCount);
    appendSection(lines, 'Special instructions', specialInstructions);

    return lines.join('\n\n');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (canContinue) setStep(2);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!canContinue) return;
    const text = await composeBrief();
    if (text) onSubmit(text);
  };

  return (
    <Paper
      variant="outlined"
      component="form"
      onSubmit={step === 1 ? handleContinue : handleGenerate}
      sx={{ width: '100%', p: 3, borderRadius: 3 }}
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(120px, 1fr) minmax(56px, 160px) minmax(120px, 1fr)',
            alignItems: 'center',
            columnGap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label="1"
              color={step === 1 ? 'primary' : 'default'}
              sx={{ width: 34, height: 34, fontWeight: 800, fontSize: '0.95rem' }}
            />
            <Typography variant="body1" fontWeight={800} color={step === 1 ? 'text.primary' : 'text.secondary'}>
              Source
            </Typography>
          </Stack>

          <Divider sx={{ width: '100%' }} />

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Chip
              size="small"
              label="2"
              color={step === 2 ? 'primary' : 'default'}
              sx={{ width: 34, height: 34, fontWeight: 800, fontSize: '0.95rem' }}
            />
            <Typography variant="body1" fontWeight={800} color={step === 2 ? 'text.primary' : 'text.secondary'}>
              Customize
            </Typography>
          </Stack>
        </Box>

        {step === 1 ? (
          <>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                What should the course be about?
              </Typography>
              <TextField
                multiline
                minRows={3}
                maxRows={8}
                fullWidth
                placeholder="e.g. Introduction to machine learning for beginners..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={busy}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.95rem' } }}
              />
            </Box>

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
              disabled={!canContinue}
              endIcon={<ArrowForwardIcon />}
              fullWidth
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Customize the course
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep the defaults, choose from the options, or add your own wording.
              </Typography>
            </Box>

            <TextField
              select
              label="Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={busy}
              fullWidth
            >
              {AUDIENCES.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            {audience === 'Custom' && (
              <TextField
                label="Custom audience"
                placeholder="e.g. New managers in a finance department"
                value={customAudience}
                onChange={(e) => setCustomAudience(e.target.value)}
                disabled={busy}
                fullWidth
              />
            )}

            <TextField
              select
              label="Learner level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={busy}
              fullWidth
            >
              {LEVELS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Course style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={busy}
              fullWidth
            >
              {STYLES.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            {style === 'Custom' && (
              <TextField
                label="Custom course style"
                placeholder="e.g. Case-based with short compliance scenarios"
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                disabled={busy}
                fullWidth
              />
            )}

            <TextField
              select
              label="Preferred lesson count"
              value={lessonCount}
              onChange={(e) => setLessonCount(e.target.value)}
              disabled={busy}
              fullWidth
            >
              {LESSON_COUNTS.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Learning goals"
              placeholder="Optional: what should learners be able to do by the end?"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              disabled={busy}
              multiline
              minRows={2}
              fullWidth
            />

            <TextField
              label="Special instructions"
              placeholder="Optional: include or avoid specific topics, formats, examples..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              disabled={busy}
              multiline
              minRows={2}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                type="button"
                variant="outlined"
                size="large"
                disabled={busy}
                startIcon={<ArrowBackIcon />}
                onClick={() => setStep(1)}
                sx={{ flex: 1 }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!canContinue}
                startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                sx={{ flex: 2 }}
              >
                {extracting ? 'Extracting PDF...' : 'Generate course'}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
