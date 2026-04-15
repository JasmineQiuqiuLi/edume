import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export default function FileUpload({ file, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') onChange(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  return (
    <Box
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        border: 2,
        borderStyle: 'dashed',
        borderColor: dragging ? 'primary.main' : file ? 'success.main' : 'divider',
        borderRadius: 2,
        p: 3,
        textAlign: 'center',
        cursor: file ? 'default' : 'pointer',
        bgcolor: dragging ? 'action.hover' : file ? 'success.light' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': !file ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : {},
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {file ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <PictureAsPdfIcon color="success" />
          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
            {file.name}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <>
          <UploadFileIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Drag & drop a PDF here, or click to browse
          </Typography>
        </>
      )}
    </Box>
  );
}
