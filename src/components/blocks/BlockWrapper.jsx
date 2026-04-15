import { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockRenderer from './BlockRenderer';

// Fade-up animation when the block scrolls into view
function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

// Headings that open a new section deserve extra top breathing room
function extraTopMargin(block) {
  if (block.type === 'heading') {
    if (block.level === 1) return 4; // 32 px
    if (block.level === 2) return 3; // 24 px
  }
  return 0;
}

export default function BlockWrapper({
  block,
  onEdit,
  onRefine,
  onDelete,
  readOnly = false,
}) {
  const [ref, visible] = useInView();

  return (
    <Box
      ref={ref}
      position="relative"
      sx={{
        mt: extraTopMargin(block),
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        '&:hover': { '& .block-toolbar': { opacity: 1, pointerEvents: 'auto' } },
      }}
    >
      <BlockRenderer block={block} />

      {!readOnly && (
        <Paper
          className="block-toolbar"
          elevation={3}
          sx={{
            position: 'absolute',
            top: -20,
            right: 0,
            display: 'flex',
            gap: 0.5,
            px: 0.5,
            py: 0.25,
            borderRadius: 2,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.15s',
            zIndex: 10,
          }}
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit?.(block)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="AI Refine">
            <IconButton size="small" onClick={() => onRefine?.(block)} color="secondary">
              <AutoFixHighIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete?.(block.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
      )}
    </Box>
  );
}
