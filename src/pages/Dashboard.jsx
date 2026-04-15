import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GenerateForm from '../components/ui/GenerateForm';
import LoadingScreen from '../components/ui/LoadingScreen';
import useCourseStore from '../store/courseStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const generate = useCourseStore((s) => s.generate);
  const status = useCourseStore((s) => s.status);
  const error = useCourseStore((s) => s.error);
  const courses = useCourseStore((s) => s.courses);

  const loading = status === 'generating';

  const handleSubmit = async (text) => {
    try {
      const id = await generate(text);
      navigate(`/course/${id}`);
    } catch {
      // error stored in zustand
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top nav */}
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>AI</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              Course Builder
            </Typography>
          </Box>
          {courses.length > 0 && (
            <Button
              startIcon={<LibraryBooksIcon />}
              onClick={() => navigate('/courses')}
              size="small"
              variant="outlined"
              color="inherit"
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            >
              Library ({courses.length})
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero + form */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          px: 3,
        }}
      >
        <Stack spacing={1} alignItems="center" sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1">
            Build a course with AI
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 440 }}>
            Describe a topic or upload a PDF — AI turns it into a structured,
            interactive multi-lesson course in seconds.
          </Typography>
        </Stack>

        <GenerateForm onSubmit={handleSubmit} loading={loading} />

        {status === 'error' && error && (
          <Typography color="error" variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
      </Container>

      <LoadingScreen open={loading} />
    </Box>
  );
}
