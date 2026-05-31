import { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getBlockDefinition } from '../blocks/blockCatalog';

function parseYouTubeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] ?? '';
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/').filter(Boolean)[1] ?? '';
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/').filter(Boolean)[1] ?? '';
    return url.searchParams.get('v') ?? '';
  } catch {
    return '';
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function updateAt(items, index, nextItem) {
  return items.map((item, i) => (i === index ? nextItem : item));
}

function removeAt(items, index) {
  return items.filter((_, i) => i !== index);
}

function Field({ label, value, onChange, multiline = false, minRows = 1, placeholder, select = false, children }) {
  return (
    <TextField
      label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      multiline={multiline}
      minRows={minRows}
      placeholder={placeholder}
      select={select}
      fullWidth
    >
      {children}
    </TextField>
  );
}

function Repeater({ title, items, emptyItem, renderItem, onChange, minItems = 0 }) {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" fontWeight={700}>{title}</Typography>
      {safeItems.map((item, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Item {index + 1}</Typography>
              <IconButton
                size="small"
                color="error"
                disabled={safeItems.length <= minItems}
                onClick={() => onChange(removeAt(safeItems, index))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
            {renderItem(item, (nextItem) => onChange(updateAt(safeItems, index, nextItem)), index)}
          </Stack>
        </Paper>
      ))}
      <Button
        type="button"
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => onChange([...safeItems, JSON.parse(JSON.stringify(emptyItem))])}
      >
        Add item
      </Button>
    </Stack>
  );
}

function JsonEditor({ value, onChange }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState(null);

  const handleChange = (raw) => {
    setText(raw);
    try {
      onChange(JSON.parse(raw));
      setError(null);
    } catch {
      setError('Invalid JSON');
    }
  };

  return (
    <TextField
      multiline
      minRows={8}
      maxRows={20}
      fullWidth
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      error={!!error}
      helperText={error || 'Advanced fallback for troubleshooting.'}
      inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
    />
  );
}

function BlockFields({ block, onChange, applyCharacterImage, onApplyCharacterImageChange }) {
  const set = (patch) => onChange({ ...block, ...patch });
  const type = block.type;

  if (type === 'heading') {
    return (
      <Stack spacing={2}>
        <Field label="Heading text" value={block.content} onChange={(content) => set({ content })} />
        <Field label="Heading level" value={block.level ?? 2} onChange={(level) => set({ level: Number(level) })} select>
          {[1, 2, 3].map((level) => <MenuItem key={level} value={level}>Level {level}</MenuItem>)}
        </Field>
      </Stack>
    );
  }

  if (type === 'paragraph') return <Field label="Paragraph" value={block.content} onChange={(content) => set({ content })} multiline minRows={5} />;

  if (type === 'statement') {
    return (
      <Stack spacing={2}>
        <Field label="Style" value={block.variant ?? 'note'} onChange={(variant) => set({ variant })} select>
          {['note', 'tip', 'warning'].map((variant) => <MenuItem key={variant} value={variant}>{variant}</MenuItem>)}
        </Field>
        <Field label="Content" value={block.content} onChange={(content) => set({ content })} multiline minRows={4} />
      </Stack>
    );
  }

  if (type === 'quote') {
    return (
      <Stack spacing={2}>
        <Field label="Quote" value={block.content} onChange={(content) => set({ content })} multiline minRows={4} />
        <Field label="Attribution" value={block.attribution} onChange={(attribution) => set({ attribution })} />
      </Stack>
    );
  }

  if (type === 'bullet-list' || type === 'numbered-list') {
    return (
      <Stack spacing={2}>
        <Field label="List type" value={type} onChange={(nextType) => set({ type: nextType })} select>
          <MenuItem value="bullet-list">Bullet list</MenuItem>
          <MenuItem value="numbered-list">Numbered list</MenuItem>
        </Field>
        <Repeater
          title="Items"
          items={block.items}
          emptyItem=""
          minItems={1}
          onChange={(items) => set({ items })}
          renderItem={(item, setItem) => <Field label="Item text" value={item} onChange={setItem} />}
        />
      </Stack>
    );
  }

  if (type === 'accordion' || type === 'tabs') {
    return (
      <Repeater
        title={type === 'accordion' ? 'Accordion sections' : 'Tabs'}
        items={block.items}
        emptyItem={{ label: 'Label', content: 'Content' }}
        minItems={1}
        onChange={(items) => set({ items })}
        renderItem={(item, setItem) => (
          <Stack spacing={1.5}>
            <Field label="Label" value={item.label} onChange={(label) => setItem({ ...item, label })} />
            <Field label="Content" value={item.content} onChange={(content) => setItem({ ...item, content })} multiline minRows={3} />
          </Stack>
        )}
      />
    );
  }

  if (type === 'process') {
    return (
      <Repeater
        title="Steps"
        items={block.steps}
        emptyItem={{ title: 'Step', content: 'Description' }}
        minItems={1}
        onChange={(steps) => set({ steps })}
        renderItem={(step, setStep) => (
          <Stack spacing={1.5}>
            <Field label="Step title" value={step.title} onChange={(title) => setStep({ ...step, title })} />
            <Field label="Step content" value={step.content} onChange={(content) => setStep({ ...step, content })} multiline minRows={3} />
          </Stack>
        )}
      />
    );
  }

  if (type === 'rise-process') {
    return (
      <Repeater
        title="Rise process steps"
        items={block.steps}
        emptyItem={{ title: 'Step', content: 'Description', imageSrc: '', alt: '' }}
        minItems={1}
        onChange={(steps) => set({ steps })}
        renderItem={(step, setStep) => (
          <Stack spacing={1.5}>
            <Field label="Step title" value={step.title} onChange={(title) => setStep({ ...step, title })} />
            <Field label="Step content" value={step.content} onChange={(content) => setStep({ ...step, content })} multiline minRows={3} />
            <Button variant="outlined" component="label">
              Upload step image
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const imageSrc = await fileToDataUrl(file);
                  if (imageSrc) setStep({ ...step, imageSrc, alt: step.alt || file.name });
                }}
              />
            </Button>
            {step.imageSrc && (
              <Box
                component="img"
                src={step.imageSrc}
                alt={step.alt ?? step.title ?? 'Process step image'}
                sx={{ width: '100%', maxHeight: 180, objectFit: 'contain', border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}
              />
            )}
            <Field label="Image alt text" value={step.alt} onChange={(alt) => setStep({ ...step, alt })} />
          </Stack>
        )}
      />
    );
  }

  if (type === 'multiple-choice') {
    const options = block.options ?? [];
    return (
      <Stack spacing={2}>
        <Field label="Question" value={block.question} onChange={(question) => set({ question })} multiline minRows={2} />
        <Repeater
          title="Options"
          items={options}
          emptyItem="New option"
          minItems={2}
          onChange={(nextOptions) => set({ options: nextOptions, correct: Math.min(block.correct ?? 0, nextOptions.length - 1) })}
          renderItem={(option, setOption, index) => (
            <Stack spacing={1}>
              <Field label="Option text" value={option} onChange={setOption} />
              <FormControlLabel
                control={<Radio checked={(block.correct ?? 0) === index} onChange={() => set({ correct: index })} />}
                label="Correct answer"
              />
            </Stack>
          )}
        />
        <Field label="Explanation" value={block.explanation} onChange={(explanation) => set({ explanation })} multiline minRows={2} />
      </Stack>
    );
  }

  if (type === 'multiple-response') {
    const options = block.options ?? [];
    const correct = block.correct ?? [];
    return (
      <Stack spacing={2}>
        <Field label="Question" value={block.question} onChange={(question) => set({ question })} multiline minRows={2} />
        <Repeater
          title="Options"
          items={options}
          emptyItem="New option"
          minItems={2}
          onChange={(nextOptions) => set({ options: nextOptions, correct: correct.filter((index) => index < nextOptions.length) })}
          renderItem={(option, setOption, index) => (
            <Stack spacing={1}>
              <Field label="Option text" value={option} onChange={setOption} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={correct.includes(index)}
                    onChange={(e) => {
                      const nextCorrect = e.target.checked
                        ? [...correct, index].sort((a, b) => a - b)
                        : correct.filter((value) => value !== index);
                      set({ correct: nextCorrect });
                    }}
                  />
                }
                label="Correct answer"
              />
            </Stack>
          )}
        />
        <Field label="Explanation" value={block.explanation} onChange={(explanation) => set({ explanation })} multiline minRows={2} />
      </Stack>
    );
  }

  if (type === 'true-false') {
    return (
      <Stack spacing={2}>
        <Field label="Statement" value={block.statement} onChange={(statement) => set({ statement })} multiline minRows={3} />
        <Field label="Correct answer" value={String(block.correct ?? true)} onChange={(correct) => set({ correct: correct === 'true' })} select>
          <MenuItem value="true">True</MenuItem>
          <MenuItem value="false">False</MenuItem>
        </Field>
        <Field label="Explanation" value={block.explanation} onChange={(explanation) => set({ explanation })} multiline minRows={2} />
      </Stack>
    );
  }

  if (type === 'fill-in-blank') {
    return (
      <Stack spacing={2}>
        <Field label="Template" value={block.template} onChange={(template) => set({ template })} helperText="Use ___ for the blank." multiline minRows={3} />
        <Field label="Answer" value={block.answer} onChange={(answer) => set({ answer })} />
        <Field label="Hint" value={block.hint} onChange={(hint) => set({ hint })} />
      </Stack>
    );
  }

  if (type === 'flashcard') {
    return (
      <Repeater
        title="Cards"
        items={block.cards}
        emptyItem={{ front: 'Front', back: 'Back' }}
        minItems={1}
        onChange={(cards) => set({ cards })}
        renderItem={(card, setCard) => (
          <Stack spacing={1.5}>
            <Field label="Front" value={card.front} onChange={(front) => setCard({ ...card, front })} multiline minRows={2} />
            <Field label="Back" value={card.back} onChange={(back) => setCard({ ...card, back })} multiline minRows={2} />
          </Stack>
        )}
      />
    );
  }

  if (type === 'drag-to-match') {
    return (
      <Repeater
        title="Prompt and answer pairs"
        items={block.pairs}
        emptyItem={{ prompt: 'Prompt', answer: 'Answer' }}
        minItems={2}
        onChange={(pairs) => set({ pairs })}
        renderItem={(pair, setPair) => (
          <Stack spacing={1.5}>
            <Field label="Prompt" value={pair.prompt} onChange={(prompt) => setPair({ ...pair, prompt })} multiline minRows={2} />
            <Field label="Answer" value={pair.answer} onChange={(answer) => setPair({ ...pair, answer })} />
          </Stack>
        )}
      />
    );
  }

  if (type === 'scenario') {
    return (
      <Stack spacing={2}>
        <Field label="Scenario setup" value={block.setup} onChange={(setup) => set({ setup })} multiline minRows={4} />
        <Repeater
          title="Choices"
          items={block.choices}
          emptyItem={{ label: 'Choice', isCorrect: false, consequence: 'Consequence' }}
          minItems={2}
          onChange={(choices) => set({ choices })}
          renderItem={(choice, setChoice) => (
            <Stack spacing={1.5}>
              <Field label="Choice text" value={choice.label} onChange={(label) => setChoice({ ...choice, label })} />
              <FormControlLabel
                control={<Checkbox checked={!!choice.isCorrect} onChange={(e) => setChoice({ ...choice, isCorrect: e.target.checked })} />}
                label="Correct choice"
              />
              <Field label="Consequence" value={choice.consequence} onChange={(consequence) => setChoice({ ...choice, consequence })} multiline minRows={2} />
            </Stack>
          )}
        />
      </Stack>
    );
  }

  if (type === 'reveal') {
    return (
      <Stack spacing={2}>
        <Field label="Prompt" value={block.prompt} onChange={(prompt) => set({ prompt })} multiline minRows={3} />
        <Field label="Reveal content" value={block.revealContent} onChange={(revealContent) => set({ revealContent })} multiline minRows={4} />
      </Stack>
    );
  }

  if (type === 'youtube') {
    const currentUrl = block.videoId ? `https://www.youtube.com/watch?v=${block.videoId}` : '';
    return (
      <Stack spacing={2}>
        <Field
          label="YouTube URL"
          value={block._youtubeUrl ?? currentUrl}
          onChange={(url) => set({ _youtubeUrl: url, videoId: parseYouTubeUrl(url) })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {!block.videoId && <Typography variant="caption" color="error">Enter a valid YouTube URL.</Typography>}
        <Field label="Caption" value={block.caption} onChange={(caption) => set({ caption })} />
      </Stack>
    );
  }

  if (type === 'image') {
    return (
      <Stack spacing={2}>
        <Field label="Image prompt" value={block.prompt} onChange={(prompt) => set({ prompt })} multiline minRows={3} />
        <Field label="Alt text" value={block.alt} onChange={(alt) => set({ alt })} />
        <Field label="Caption" value={block.caption} onChange={(caption) => set({ caption })} />
      </Stack>
    );
  }

  if (type === 'rise-image-text') {
    return (
      <Stack spacing={2}>
        <Field label="Text" value={block.content} onChange={(content) => set({ content })} multiline minRows={5} />
        <Field label="Image position" value={block.imagePosition ?? 'left'} onChange={(imagePosition) => set({ imagePosition })} select>
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Field>
        <Button variant="outlined" component="label">
          Upload image
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const imageSrc = await fileToDataUrl(file);
              if (imageSrc) set({ imageSrc, alt: block.alt || file.name });
            }}
          />
        </Button>
        {block.imageSrc && (
          <Box
            component="img"
            src={block.imageSrc}
            alt={block.alt ?? block.caption ?? 'Imported Rise image'}
            sx={{ width: '100%', maxHeight: 180, objectFit: 'contain', border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}
          />
        )}
        <Field label="Alt text" value={block.alt} onChange={(alt) => set({ alt })} />
        <Field label="Caption" value={block.caption} onChange={(caption) => set({ caption })} />
      </Stack>
    );
  }

  if (type === 'diagram') {
    return (
      <Stack spacing={2}>
        <Field label="SVG markup" value={block.svg} onChange={(svg) => set({ svg })} multiline minRows={8} />
        <Field label="Caption" value={block.caption} onChange={(caption) => set({ caption })} />
      </Stack>
    );
  }

  if (type === 'character') {
    return (
      <Stack spacing={2}>
        <Field label="Character name" value={block.persona} onChange={(persona) => set({ persona })} />
        <Button variant="outlined" component="label">
          Upload character image
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const imageUrl = await fileToDataUrl(file);
              if (imageUrl) set({ imageUrl });
            }}
          />
        </Button>
        {block.imageUrl && (
          <Box
            component="img"
            src={block.imageUrl}
            alt={block.persona ?? 'Character'}
            sx={{ width: 96, height: 96, objectFit: 'contain', border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}
          />
        )}
        <Field label="Message" value={block.message} onChange={(message) => set({ message })} multiline minRows={4} />
        <FormControlLabel
          control={<Checkbox checked={applyCharacterImage} onChange={(e) => onApplyCharacterImageChange(e.target.checked)} />}
          label="Use this character image across matching character blocks in this course"
        />
      </Stack>
    );
  }

  if (type === 'divider') {
    return <Typography variant="body2" color="text.secondary">Divider blocks have no editable content.</Typography>;
  }

  return null;
}

function isValidBlock(block) {
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  switch (block.type) {
    case 'divider':
      return true;
    case 'heading':
    case 'paragraph':
      return text(block.content);
    case 'youtube':
      return text(block.videoId);
    case 'character':
      return text(block.persona) && text(block.message);
    default:
      return true;
  }
}

export default function EditBlockModal({ block, onSave, onClose, title = 'Edit Block' }) {
  const [draft, setDraft] = useState({ ...block });
  const [applyCharacterImage, setApplyCharacterImage] = useState(false);
  const definition = useMemo(() => getBlockDefinition(draft.type), [draft.type]);
  const valid = isValidBlock(draft);

  const handleSave = () => {
    const cleaned = { ...draft };
    delete cleaned._youtubeUrl;
    onSave(cleaned, {
      applyCharacterImage,
      previousCharacterName: block.persona,
    });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          ({definition?.label ?? draft.type})
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <BlockFields
            block={draft}
            onChange={setDraft}
            applyCharacterImage={applyCharacterImage}
            onApplyCharacterImageChange={setApplyCharacterImage}
          />
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" fontWeight={700}>Advanced JSON</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <JsonEditor value={draft} onChange={setDraft} />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!valid}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
