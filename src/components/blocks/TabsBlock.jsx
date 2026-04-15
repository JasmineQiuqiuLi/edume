import { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function TabsBlock({ block }) {
  const [value, setValue] = useState(0);

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Tabs
        value={value}
        onChange={(_, v) => setValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
      >
        {block.items.map((item, i) => (
          <Tab key={i} label={item.label} />
        ))}
      </Tabs>
      <Box sx={{ p: 3 }}>
        <Typography>{block.items[value]?.content}</Typography>
      </Box>
    </Box>
  );
}
