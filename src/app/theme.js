import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#fff',
    },
    secondary: {
      main: '#7C3AED',
      contrastText: '#fff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
    },
  },

  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0' },
  },

  shape: { borderRadius: 10 },

  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
    '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
    '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
    '0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07)',
    ...Array(19).fill('none'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#F8FAFC' },
        '@import': "url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')",
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '0.9rem',
          padding: '7px 16px',
        },
        sizeLarge: { padding: '11px 24px', fontSize: '0.95rem' },
        contained: {
          '&:hover': { filter: 'brightness(1.07)' },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
            '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
          },
        },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          transition: 'box-shadow 0.2s, transform 0.2s',
        },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { border: '1px solid #E2E8F0' },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          color: '#0F172A',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '1px 8px',
          width: 'auto',
          '&.Mui-selected': {
            backgroundColor: '#EEF2FF',
            color: '#4F46E5',
            '&:hover': { backgroundColor: '#E0E7FF' },
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: { borderRadius: '8px !important', '&:before': { display: 'none' } },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#E2E8F0' },
      },
    },
  },
});

export default theme;
