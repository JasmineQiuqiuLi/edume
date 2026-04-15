import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

function DraggableChip({ id, label, disabled }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
  });
  return (
    <Chip
      ref={setNodeRef}
      label={label}
      {...listeners}
      {...attributes}
      sx={{
        cursor: disabled ? 'default' : 'grab',
        // Fully hide source while dragging — DragOverlay renders the moving copy
        opacity: isDragging ? 0 : 1,
        touchAction: 'none',
      }}
    />
  );
}

function DropZone({ id, children, isCorrect, isIncorrect }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  let bgcolor = 'action.hover';
  if (isCorrect) bgcolor = 'success.light';
  else if (isIncorrect) bgcolor = 'error.light';
  else if (isOver) bgcolor = 'primary.light';

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 48,
        border: 2,
        borderStyle: 'dashed',
        borderColor: isOver ? 'primary.main' : 'divider',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 1,
        bgcolor,
        transition: 'background-color 0.2s',
      }}
    >
      {children}
    </Box>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DragToMatchBlock({ block }) {
  const pairs = block.pairs ?? [];
  const [matches, setMatches] = useState({});
  const [checked, setChecked] = useState(false);
  const [activeId, setActiveId] = useState(null);
  // Shuffle once on mount
  const [shuffled] = useState(() => shuffle(pairs.map((p) => p.answer)));

  // PointerSensor with a small activation distance avoids accidental drags
  // and correctly tracks pointer coordinates inside scrollable containers
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const usedAnswers = new Set(Object.values(matches));
  const availableAnswers = shuffled.filter((a) => !usedAnswers.has(a));

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const answer = active.id;
    const zoneId = over.id;

    if (zoneId === 'bank') {
      setMatches((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { if (next[k] === answer) delete next[k]; });
        return next;
      });
      return;
    }

    setMatches((prev) => {
      const next = { ...prev };
      // Remove this answer from any other slot
      Object.keys(next).forEach((k) => { if (next[k] === answer) delete next[k]; });
      // If the slot already has an answer, put it back
      if (next[zoneId]) delete next[zoneId];
      next[zoneId] = answer;
      return next;
    });
  };

  const getResult = (promptIdx) => {
    if (!checked) return null;
    return matches[promptIdx] === pairs[promptIdx].answer ? 'correct' : 'incorrect';
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Drag to match each item with its answer:
      </Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Stack spacing={1} sx={{ mb: 2 }}>
          {pairs.map((pair, i) => {
            const result = getResult(i);
            return (
              <Stack key={i} direction="row" alignItems="center" spacing={1}>
                <Box sx={{ flex: 1, p: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
                  <Typography variant="body2">{pair.prompt}</Typography>
                </Box>
                <Typography>→</Typography>
                <Box sx={{ flex: 1 }}>
                  <DropZone
                    id={i}
                    isCorrect={result === 'correct'}
                    isIncorrect={result === 'incorrect'}
                  >
                    {matches[i] ? (
                      <DraggableChip
                        id={matches[i]}
                        label={matches[i]}
                        disabled={checked}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Drop here
                      </Typography>
                    )}
                  </DropZone>
                </Box>
              </Stack>
            );
          })}
        </Stack>

        {/* Answer bank */}
        <DropZone id="bank">
          <Stack direction="row" flexWrap="wrap" gap={1} p={1}>
            {availableAnswers.length > 0 ? (
              availableAnswers.map((answer) => (
                <DraggableChip
                  key={answer}
                  id={answer}
                  label={answer}
                  disabled={checked}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                All items placed
              </Typography>
            )}
          </Stack>
        </DropZone>

        <DragOverlay>
          {activeId ? <Chip label={activeId} color="primary" /> : null}
        </DragOverlay>
      </DndContext>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {!checked ? (
          <Button
            variant="contained"
            size="small"
            onClick={() => setChecked(true)}
            disabled={Object.keys(matches).length < pairs.length}
          >
            Check
          </Button>
        ) : (
          <Button
            size="small"
            onClick={() => { setMatches({}); setChecked(false); }}
          >
            Try Again
          </Button>
        )}
      </Stack>
    </Box>
  );
}
