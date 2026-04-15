import Stack from '@mui/material/Stack';
import BlockWrapper from '../blocks/BlockWrapper';

export default function LessonViewer({ lesson, courseId, onEdit, onRefine, onDelete }) {
  if (!lesson) return null;

  return (
    <Stack spacing={5}>
      {lesson.blocks.map((block) => (
        <BlockWrapper
          key={block.id}
          block={block}
          courseId={courseId}
          lessonId={lesson.id}
          onEdit={onEdit}
          onRefine={onRefine}
          onDelete={(blockId) => onDelete?.(lesson.id, blockId)}
        />
      ))}
    </Stack>
  );
}
