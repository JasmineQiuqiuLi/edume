const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'SPAN']);
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'LI']);

function normalizeColor(value) {
  const color = String(value ?? '').trim();
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)) return color;
  const rgb = color.match(/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(0|1|0?\.\d+))?\)$/i);
  if (!rgb) return '';
  const channels = rgb.slice(1, 4).map((part) => Math.max(0, Math.min(255, Number(part))));
  return `rgb(${channels.join(', ')})`;
}

function allowedStyle(style) {
  const output = [];
  const color = normalizeColor(style?.color);
  if (color) output.push(`color: ${color}`);

  const weight = String(style?.fontWeight ?? '').trim();
  if (weight === 'bold' || Number(weight) >= 600) output.push('font-weight: 700');

  const fontStyle = String(style?.fontStyle ?? '').trim();
  if (fontStyle === 'italic') output.push('font-style: italic');

  const decoration = String(style?.textDecorationLine || style?.textDecoration || '').trim();
  if (decoration.includes('underline')) output.push('text-decoration: underline');

  return output.join('; ');
}

function sanitizeNode(doc, node) {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = node.tagName;
  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = doc.createDocumentFragment();
    node.childNodes.forEach((child) => {
      const cleanChild = sanitizeNode(doc, child);
      if (cleanChild) fragment.appendChild(cleanChild);
    });
    if (!BLOCK_TAGS.has(tag) && fragment.childNodes.length) fragment.appendChild(doc.createTextNode(' '));
    return fragment;
  }

  const normalizedTag = tag === 'B' ? 'strong' : tag === 'I' ? 'em' : tag.toLowerCase();
  const el = doc.createElement(normalizedTag);

  if (tag === 'A') {
    const href = node.getAttribute('href') ?? '';
    if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
      el.setAttribute('href', href);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  }

  const style = allowedStyle(node.style);
  if (style) el.setAttribute('style', style);

  node.childNodes.forEach((child) => {
    const cleanChild = sanitizeNode(doc, child);
    if (cleanChild) el.appendChild(cleanChild);
  });

  return el;
}

function sanitizeWithDom(html) {
  const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
  const out = document.implementation.createHTMLDocument('');
  doc.body.childNodes.forEach((child) => {
    const cleanChild = sanitizeNode(out, child);
    if (cleanChild) out.body.appendChild(cleanChild);
  });
  return out.body.innerHTML.trim();
}

function fallbackSanitize(html) {
  return String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\s(data-editor-id|class|id)="[^"]*"/gi, '')
    .replace(/<(\/?)(div|h[1-6])(\s[^>]*)?>/gi, '<$1p>')
    .replace(/<(\/?)(b)(\s[^>]*)?>/gi, '<$1strong>')
    .replace(/<(\/?)(i)(\s[^>]*)?>/gi, '<$1em>')
    .replace(/<(?!\/?(p|br|strong|em|u|ul|ol|li|a|span)\b)[^>]*>/gi, '')
    .trim();
}

export function sanitizeRichHtml(html) {
  const raw = String(html ?? '').trim();
  if (!raw) return '';
  if (typeof DOMParser !== 'undefined' && typeof document !== 'undefined') {
    return sanitizeWithDom(raw);
  }
  return fallbackSanitize(raw);
}

export function richTextToPlainText(html) {
  const raw = String(html ?? '').trim();
  if (!raw) return '';
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    doc.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    doc.querySelectorAll('li').forEach((li) => li.appendChild(doc.createTextNode('\n')));
    return (doc.body.textContent ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function plainTextToHtml(text) {
  const escaped = String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped
    .split(/\n{2,}/)
    .map((part) => `<p>${part.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
