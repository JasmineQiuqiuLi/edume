import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const variantMap = {
  note: 'info',
  tip: 'success',
  warning: 'warning',
};

const titleMap = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
};

export default function StatementBlock({ block }) {
  const severity = variantMap[block.variant] ?? 'info';
  const title = titleMap[block.variant] ?? 'Note';
  return (
    <Alert severity={severity} sx={{ borderRadius: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {block.content}
    </Alert>
  );
}
