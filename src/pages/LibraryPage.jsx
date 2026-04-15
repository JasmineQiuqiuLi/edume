import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FaceIcon from '@mui/icons-material/Face';
import useCourseStore from '../store/courseStore';

const PALETTE = ['#4F46E5', '#7C3AED', '#0891B2', '#059669', '#DC2626', '#D97706'];
const colorFor = (id) => PALETTE[Math.abs(id.charCodeAt(0)) % PALETTE.length];

export default function LibraryPage() {
  const navigate = useNavigate();
  const courses = useCourseStore((s) => s.courses);
  const deleteCourse = useCourseStore((s) => s.deleteCourse);
  const setActiveCourse = useCourseStore((s) => s.setActiveCourse);

  const handleOpen = (course) => {
    setActiveCourse(course.id);
    navigate(`/course/${course.id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this course?')) deleteCourse(id);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1 }}>
          <IconButton onClick={() => navigate('/')} size="small" edge="start">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
            Library
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FaceIcon />}
            onClick={() => navigate('/characters')}
            sx={{ borderColor: 'divider', color: 'text.secondary' }}
          >
            Characters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/')}
            size="small"
          >
            New course
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        {courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 16 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              No courses yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Create your first AI-generated course to get started.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')} startIcon={<AddIcon />}>
              Create a course
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {courses.length} course{courses.length !== 1 ? 's' : ''}
            </Typography>
            <Grid container spacing={2.5}>
              {courses.map((course) => (
                <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    }}
                  >
                    {/* Color strip */}
                    <Box
                      sx={{
                        height: 6,
                        bgcolor: colorFor(course.id),
                        borderRadius: '12px 12px 0 0',
                      }}
                    />
                    <CardActionArea
                      onClick={() => handleOpen(course)}
                      sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0 }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom noWrap>
                          {course.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2,
                            lineHeight: 1.6,
                          }}
                        >
                          {course.description}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={`${course.lessons.length} lessons`}
                            sx={{ bgcolor: 'grey.100', color: 'text.secondary', fontWeight: 500 }}
                          />
                          <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto !important' }}>
                            {new Date(course.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                    <Box sx={{ px: 2, pb: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Delete course">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDelete(e, course.id)}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
