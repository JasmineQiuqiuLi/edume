import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RichTextRenderer from '../ui/RichTextRenderer';

function clampMarker(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 50;
  return Math.max(0, Math.min(100, number));
}

export default function RiseLabeledGraphicBlock({ block }) {
  const markers = block.markers ?? [];
  const [activeIndex, setActiveIndex] = useState(null);
  const activeMarker = activeIndex == null ? null : markers[activeIndex];
  const activeX = clampMarker(activeMarker?.x);
  const activeY = clampMarker(activeMarker?.y);
  const cardOnRight = activeX < 62;

  if (!block.imageSrc || markers.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: 2,
        overflow: 'visible',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'grey.50',
        mb: activeMarker ? 16 : 0,
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'visible' }}>
        <Box
          component="img"
          src={block.imageSrc}
          alt={block.alt ?? 'Imported Rise labeled graphic'}
          sx={{ display: 'block', width: '100%', height: 'auto', borderRadius: 2 }}
        />
      {markers.map((marker, index) => {
        const active = index === activeIndex;
        return (
          <IconButton
            key={marker.id ?? index}
            aria-label={marker.title || `Marker ${index + 1}`}
            aria-pressed={active}
            size="small"
            onClick={() => setActiveIndex((current) => (current === index ? null : index))}
            sx={{
              position: 'absolute',
              left: `${clampMarker(marker.x)}%`,
              top: `${clampMarker(marker.y)}%`,
              transform: 'translate(-50%, -50%)',
              width: active ? 46 : 36,
              height: active ? 46 : 36,
              color: '#fff',
              bgcolor: active ? '#991B1B' : '#DC2626',
              opacity: active ? 1 : 0.72,
              boxShadow: active ? '0 0 0 4px rgba(37, 99, 235, 0.42), 0 10px 24px rgba(15, 23, 42, 0.3)' : 3,
              border: active ? '4px solid #fff' : '3px solid #fff',
              zIndex: active ? 3 : 2,
              transition: 'width .15s ease, height .15s ease, opacity .15s ease, box-shadow .15s ease',
              '&:hover': { bgcolor: '#991B1B', opacity: 1 },
            }}
          >
            <LocationOnIcon fontSize={active ? 'medium' : 'small'} />
          </IconButton>
        );
      })}
      {activeMarker && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: `clamp(92px, ${activeY}%, calc(100% - 92px))`,
            left: cardOnRight ? `calc(${activeX}% + 30px)` : 'auto',
            right: cardOnRight ? 'auto' : `calc(${100 - activeX}% + 30px)`,
            transform: 'translateY(-50%)',
            width: 'min(360px, calc(100% - 32px))',
            maxWidth: cardOnRight ? `calc(100% - ${activeX}% - 46px)` : `calc(${activeX}% - 46px)`,
            minWidth: { xs: 220, sm: 260 },
            p: 2,
            borderRadius: 1.5,
            border: 1,
            borderColor: 'divider',
            zIndex: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1 }}>
              {activeMarker.title || `Marker ${activeIndex + 1}`}
            </Typography>
            <IconButton
              aria-label="Close marker detail"
              size="small"
              onClick={() => setActiveIndex(null)}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <RichTextRenderer html={activeMarker.descriptionHtml} text={activeMarker.description} sx={{ color: 'text.secondary' }} />
        </Paper>
      )}
      </Box>
    </Box>
  );
}
