import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CourseNav from '../components/course/CourseNav';
import LessonViewer from '../components/course/LessonViewer';
import EditBlockModal from '../components/ui/EditBlockModal';
import RefineBlockModal from '../components/ui/RefineBlockModal';
import ExportModal from '../components/ui/ExportModal';
import useCourseStore from '../store/courseStore';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courses = useCourseStore((s) => s.courses);
  const activeLessonId = useCourseStore((s) => s.activeLessonId);
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson);
  const updateBlock = useCourseStore((s) => s.updateBlock);
  const deleteBlock = useCourseStore((s) => s.deleteBlock);
  const refineBlock = useCourseStore((s) => s.refineBlock);
  const status = useCourseStore((s) => s.status);

  const [editTarget, setEditTarget] = useState(null);
  const [refineTarget, setRefineTarget] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const scrollRef = useRef(null);

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom color="text.secondary">Course not found.</Typography>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </Box>
    );
  }

  const activeLesson =
    course.lessons.find((l) => l.id === activeLessonId) ?? course.lessons[0];

  const lessonIndex = course.lessons.indexOf(activeLesson);
  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null;

  const goToLesson = (lesson) => {
    setActiveLesson(lesson.id);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (lessonId, blockId) => {
    if (window.confirm('Delete this block?')) deleteBlock(id, lessonId, blockId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 1, minHeight: '52px !important' }}>
          <IconButton size="small" edge="start" onClick={() => navigate('/courses')}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {course.title}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => setShowExport(true)}
            sx={{ borderColor: 'divider', color: 'text.secondary', whiteSpace: 'nowrap' }}
          >
            Export SCORM
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <CourseNav
          course={course}
          activeLessonId={activeLesson?.id}
          onSelectLesson={(lessonId) => {
            setActiveLesson(lessonId);
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
          {activeLesson && (
            <Box sx={{ maxWidth: 720, mx: 'auto', px: 4, py: 5 }}>
              <Typography
                variant="overline"
                color="primary"
                fontWeight={700}
                display="block"
                sx={{ mb: 3 }}
              >
                {lessonIndex + 1} of {course.lessons.length}
              </Typography>
              <LessonViewer
                lesson={activeLesson}
                courseId={id}
                onEdit={setEditTarget}
                onRefine={setRefineTarget}
                onDelete={handleDelete}
              />

              {/* Prev / Next lesson navigation */}
              {course.lessons.length > 1 && (
                <Box sx={{ mt: 8 }}>
                  <Divider sx={{ mb: 4 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    {prevLesson ? (
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                        onClick={() => goToLesson(prevLesson)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          maxWidth: 280,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          py: 1.5,
                          px: 2.5,
                          borderColor: 'divider',
                          color: 'text.primary',
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' },
                        }}
                      >
                        <Box sx={{ overflow: 'hidden', width: '100%' }}>
                          <Typography variant="caption" color="text.disabled" display="block" lineHeight={1.2}>
                            Previous
                          </Typography>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {prevLesson.title}
                          </Typography>
                        </Box>
                      </Button>
                    ) : (
                      <Box sx={{ flex: 1, maxWidth: 280 }} />
                    )}

                    {nextLesson ? (
                      <Button
                        variant="outlined"
                        endIcon={<ArrowForwardIosIcon fontSize="small" />}
                        onClick={() => goToLesson(nextLesson)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          maxWidth: 280,
                          justifyContent: 'flex-end',
                          textAlign: 'right',
                          py: 1.5,
                          px: 2.5,
                          borderColor: 'divider',
                          color: 'text.primary',
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' },
                        }}
                      >
                        <Box sx={{ overflow: 'hidden', width: '100%' }}>
                          <Typography variant="caption" color="text.disabled" display="block" lineHeight={1.2}>
                            Next
                          </Typography>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {nextLesson.title}
                          </Typography>
                        </Box>
                      </Button>
                    ) : (
                      <Box sx={{ flex: 1, maxWidth: 280 }} />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {editTarget && (
        <EditBlockModal
          block={editTarget}
          onSave={(updated) => {
            updateBlock(id, activeLesson.id, editTarget.id, updated);
            setEditTarget(null);
          }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {refineTarget && (
        <RefineBlockModal
          block={refineTarget}
          loading={status === 'refining'}
          onRefine={async (instruction) => {
            await refineBlock(id, activeLesson.id, refineTarget.id, instruction);
            setRefineTarget(null);
          }}
          onClose={() => setRefineTarget(null)}
        />
      )}

      {showExport && (
        <ExportModal
          course={course}
          activeLesson={activeLesson}
          onClose={() => setShowExport(false)}
        />
      )}
    </Box>
  );
}
