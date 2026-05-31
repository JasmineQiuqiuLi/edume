import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import BlockWrapper from '../blocks/BlockWrapper';

function AddBlockButton({ onClick }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 0.15s ease',
        '&:hover': { opacity: 1 },
        '&:focus-within': { opacity: 1 },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          borderTop: '1px dashed',
          borderColor: 'divider',
        },
      }}
    >
      <Tooltip title="Add block">
        <IconButton
          size="small"
          onClick={onClick}
          aria-label="Add block"
          sx={{
            width: 28,
            height: 28,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            color: 'text.secondary',
            zIndex: 1,
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'primary.main',
              borderColor: 'primary.main',
              color: 'primary.contrastText',
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function LessonViewer({ lesson, courseId, onEdit, onRefine, onDelete, onAddBlock }) {
  if (!lesson) return null;

  return (
    <Stack spacing={1}>
      <AddBlockButton onClick={() => onAddBlock?.(lesson.id, 0)} />
      {lesson.blocks.map((block, index) => (
        <Stack key={block.id} spacing={1}>
          <BlockWrapper
            block={block}
            courseId={courseId}
            lessonId={lesson.id}
            onEdit={onEdit}
            onRefine={onRefine}
            onDelete={(blockId) => onDelete?.(lesson.id, blockId)}
          />
          <AddBlockButton onClick={() => onAddBlock?.(lesson.id, index + 1)} />
        </Stack>
      ))}
    </Stack>
  );
}
