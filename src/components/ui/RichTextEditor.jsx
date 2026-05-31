import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import { plainTextToHtml, sanitizeRichHtml } from '../../utils/richText';

function command(name, value = null) {
  document.execCommand(name, false, value);
}

export default function RichTextEditor({ label, html, text, onChange, minHeight = 140 }) {
  const editorRef = useRef(null);
  const colorRef = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || focused) return;
    const nextHtml = sanitizeRichHtml(html) || plainTextToHtml(text);
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
  }, [focused, html, text]);

  const emitChange = () => {
    const nextHtml = sanitizeRichHtml(editorRef.current?.innerHTML ?? '');
    onChange(nextHtml);
  };

  const run = (name, value = null) => {
    editorRef.current?.focus();
    command(name, value);
    emitChange();
  };

  const addLink = () => {
    const href = window.prompt('Enter a link URL');
    if (!href) return;
    if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) return;
    run('createLink', href);
  };

  return (
    <Box>
      {label && (
        <Box sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          {label}
        </Box>
      )}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden', bgcolor: 'background.paper' }}>
        <Box sx={{ px: 1, py: 0.75, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <ButtonGroup size="small" variant="text">
            <Tooltip title="Bold"><IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => run('bold')}><FormatBoldIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Italic"><IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => run('italic')}><FormatItalicIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Underline"><IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => run('underline')}><FormatUnderlinedIcon fontSize="small" /></IconButton></Tooltip>
          </ButtonGroup>
          <ButtonGroup size="small" variant="text">
            <Tooltip title="Bulleted list"><IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => run('insertUnorderedList')}><FormatListBulletedIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Numbered list"><IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => run('insertOrderedList')}><FormatListNumberedIcon fontSize="small" /></IconButton></Tooltip>
          </ButtonGroup>
          <Tooltip title="Text color">
            <Button size="small" variant="text" onMouseDown={(e) => e.preventDefault()} onClick={() => colorRef.current?.click()}>
              Color
            </Button>
          </Tooltip>
          <input
            ref={colorRef}
            type="color"
            hidden
            onChange={(e) => run('foreColor', e.target.value)}
          />
          <Tooltip title="Link"><IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={addLink}><LinkIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Clear formatting"><IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => run('removeFormat')}><FormatClearIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            emitChange();
          }}
          onInput={emitChange}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text/html') || plainTextToHtml(e.clipboardData.getData('text/plain'));
            document.execCommand('insertHTML', false, sanitizeRichHtml(pasted));
            emitChange();
          }}
          sx={{
            minHeight,
            p: 1.5,
            outline: 'none',
            lineHeight: 1.7,
            '& p': { m: 0, mb: 1 },
            '& ul, & ol': { pl: 3 },
          }}
        />
      </Box>
    </Box>
  );
}
