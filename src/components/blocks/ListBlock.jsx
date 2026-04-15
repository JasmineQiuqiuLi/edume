import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

export default function ListBlock({ block }) {
  const isNumbered = block.type === 'numbered-list';
  return (
    <List disablePadding>
      {block.items.map((item, i) => (
        <ListItem key={i} disableGutters sx={{ py: 0.25, alignItems: 'flex-start' }}>
          <Typography
            component="span"
            sx={{ mr: 1.5, minWidth: 24, color: 'primary.main', fontWeight: 600 }}
          >
            {isNumbered ? `${i + 1}.` : '•'}
          </Typography>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}
