import Typography from '@mui/material/Typography';

export default function HeadingBlock({ block }) {
  const variantMap = { 1: 'h4', 2: 'h5', 3: 'h6' };
  const variant = variantMap[block.level] ?? 'h5';
  return (
    <Typography variant={variant} gutterBottom sx={{ fontWeight: 700 }}>
      {block.content}
    </Typography>
  );
}
