import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import DownloadIcon from '@mui/icons-material/Download';
import { exportCourseToScorm, exportLessonToScorm } from '../../services/scormService';

export default function ExportModal({ course, activeLesson, onClose }) {
  const [scope, setScope] = useState('course');
  const [gradingMode, setGradingMode] = useState('completion');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      if (scope === 'lesson' && activeLesson) {
        await exportLessonToScorm(course, activeLesson, { gradingMode });
      } else {
        await exportCourseToScorm(course, { gradingMode });
      }
      onClose();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open onClose={!exporting ? onClose : undefined} maxWidth="xs" fullWidth>
      <DialogTitle>Export SCORM Package</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Generates a SCORM 1.2 ZIP file you can upload directly into Canvas (or any LMS that supports SCORM 1.2).
          </Typography>

          <RadioGroup value={scope} onChange={(e) => setScope(e.target.value)}>
            <FormControlLabel
              value="course"
              control={<Radio size="small" />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Full course</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''} - one Canvas item with built-in lesson navigation
                  </Typography>
                </Box>
              }
            />
            {activeLesson && (
              <FormControlLabel
                value="lesson"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>This lesson only</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Exports "{activeLesson.title}" only
                    </Typography>
                  </Box>
                }
              />
            )}
          </RadioGroup>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
              Grading
            </Typography>
            <RadioGroup value={gradingMode} onChange={(e) => setGradingMode(e.target.value)}>
              <FormControlLabel
                value="completion"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Completion</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Students receive 100% when the SCORM package is completed.
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="correctness"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Correctness</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Score is based on quiz answers; all gradable questions must be answered.
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Box>

          <Box
            sx={{
              bgcolor: 'grey.50',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              p: 1.5,
            }}
          >
            <Typography variant="caption" color="text.secondary" component="div">
              <strong>Canvas import steps:</strong><br />
              Settings - Import Course Content - Content Type: SCORM 1.2 - upload the ZIP
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={exporting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={exporting}
          startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
        >
          {exporting ? 'Building...' : 'Download ZIP'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
