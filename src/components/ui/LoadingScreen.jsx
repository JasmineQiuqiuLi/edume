import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function LoadingScreen({ open, message = 'Creating your course...' }) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: 9999,
        flexDirection: 'column',
        gap: 3,
        color: '#fff',
        bgcolor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 104,
          height: 104,
          display: 'grid',
          placeItems: 'center',
          '@keyframes course-spin': {
            to: { transform: 'rotate(360deg)' },
          },
          '@keyframes course-pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.88 },
            '50%': { transform: 'scale(1.08)', opacity: 1 },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, #FFFFFF 0deg, #A5B4FC 80deg, transparent 150deg, transparent 230deg, #FFFFFF 360deg)',
            animation: 'course-spin 1.15s linear infinite',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 9,
              borderRadius: '50%',
              bgcolor: 'rgba(15, 23, 42, 0.9)',
            },
          }}
        />
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 18px 48px rgba(79, 70, 229, 0.42)',
            animation: 'course-pulse 1.8s ease-in-out infinite',
            zIndex: 1,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 28 }} />
        </Box>
        <CircularProgress
          color="inherit"
          size={104}
          thickness={1.2}
          sx={{ position: 'absolute', opacity: 0.18 }}
        />
      </Box>

      <Typography variant="h6" fontWeight={700}>
        {message}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.75 }}>
        Building lessons, quizzes, and interactive blocks
      </Typography>
    </Backdrop>
  );
}
