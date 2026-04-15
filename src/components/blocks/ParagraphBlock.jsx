import Typography from '@mui/material/Typography';

export default function ParagraphBlock({ block }) {
  return (
    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
      {block.content}
    </Typography>
  );
}
