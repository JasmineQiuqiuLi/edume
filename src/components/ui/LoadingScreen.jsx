import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';

export default function LoadingScreen({ open, message = 'Generating your course…' }) {
  return (
    <Backdrop open={open} sx={{ zIndex: 9999, flexDirection: 'column', gap: 3, color: '#fff' }}>
      <CircularProgress color="inherit" size={64} />
      <Typography variant="h6">{message}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.75 }}>
        This may take 15–30 seconds
      </Typography>
    </Backdrop>
  );
}
