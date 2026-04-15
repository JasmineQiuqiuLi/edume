import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function CourseNav({ course, activeLessonId, onSelectLesson }) {
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflowY: 'auto',
        py: 2,
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.disabled"
        sx={{ px: 2.5, mb: 1, display: 'block', letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        Lessons
      </Typography>
      <List disablePadding>
        {course.lessons.map((lesson, i) => (
          <ListItemButton
            key={lesson.id}
            selected={lesson.id === activeLessonId}
            onClick={() => onSelectLesson(lesson.id)}
          >
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  fontWeight={lesson.id === activeLessonId ? 600 : 400}
                  color={lesson.id === activeLessonId ? 'primary.main' : 'text.primary'}
                >
                  {i + 1}. {lesson.title}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
