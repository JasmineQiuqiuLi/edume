import JSZip from 'jszip';

// ── Utilities ──────────────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── SCORM 1.2 API wrapper (goes in scorm.js) ───────────────────────────────
const SCORM_JS = `
(function () {
  'use strict';
  var API = null, initialized = false;

  function findAPI(w) {
    var n = 0;
    while (!w.API && w.parent && w.parent !== w && n++ < 7) w = w.parent;
    return w.API || null;
  }

  function getAPI() {
    if (API) return API;
    API = findAPI(window);
    if (!API && window.opener) API = findAPI(window.opener);
    return API;
  }

  window.ScormWrapper = {
    initialize: function () {
      var api = getAPI();
      if (!api) return false;
      var r = api.LMSInitialize('');
      initialized = (r === 'true' || r === true);
      if (initialized) {
        api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
        api.LMSCommit('');
      }
      return initialized;
    },
    complete: function () {
      var api = getAPI();
      if (!api || !initialized) return;
      api.LMSSetValue('cmi.core.lesson_status', 'completed');
      api.LMSSetValue('cmi.core.score.raw', '100');
      api.LMSSetValue('cmi.core.score.min', '0');
      api.LMSSetValue('cmi.core.score.max', '100');
      api.LMSCommit('');
    },
    finish: function () {
      var api = getAPI();
      if (!api || !initialized) return;
      api.LMSFinish('');
    }
  };

  window.addEventListener('load', function () { window.ScormWrapper.initialize(); });
  window.addEventListener('beforeunload', function () { window.ScormWrapper.finish(); });
})();
`.trim();

// ── Shared CSS ─────────────────────────────────────────────────────────────
const SCORM_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.7; color: #0F172A; background: #F8FAFC; }
.lesson-page { display: flex; flex-direction: column; min-height: 100vh; }
.lesson-header { background: rgba(255,255,255,0.92); border-bottom: 1px solid #E2E8F0; padding: 12px 24px; position: sticky; top: 0; z-index: 100; }
.lesson-header-inner { max-width: 720px; margin: 0 auto; }
.lesson-course { font-size: 0.75rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.lesson-title { font-size: 1rem; font-weight: 700; }
.lesson-progress { font-size: 0.78rem; color: #64748B; margin-top: 2px; }
.lesson-content { max-width: 720px; margin: 0 auto; padding: 40px 24px; flex: 1; width: 100%; }
.block { margin-bottom: 28px; }
/* Heading */
.block-heading h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
.block-heading h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; }
.block-heading h4 { font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; }
/* Paragraph */
.block-paragraph p { color: #334155; }
/* Statement */
.block-statement { border-radius: 8px; padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start; }
.block-statement.note { background: #EFF6FF; border-left: 4px solid #3B82F6; }
.block-statement.tip  { background: #F0FDF4; border-left: 4px solid #22C55E; }
.block-statement.warning { background: #FFFBEB; border-left: 4px solid #F59E0B; }
.stmt-icon { font-size: 1.1rem; line-height: 1.7; }
.stmt-body { flex: 1; }
.stmt-title { font-weight: 700; margin-bottom: 4px; }
.note .stmt-title { color: #1D4ED8; }
.tip .stmt-title  { color: #15803D; }
.warning .stmt-title { color: #B45309; }
/* Quote */
.block-quote { border-left: 4px solid #4F46E5; padding: 12px 20px; background: #F1F5F9; border-radius: 0 8px 8px 0; }
.block-quote blockquote { font-style: italic; font-size: 1.05rem; }
.block-quote .attr { color: #64748B; font-size: 0.85rem; margin-top: 6px; }
/* Lists */
.block-list ul, .block-list ol { padding-left: 24px; }
.block-list li { margin-bottom: 6px; color: #334155; }
/* Divider */
.block-divider hr { border: none; border-top: 1px solid #E2E8F0; }
/* Accordion */
.block-accordion .acc-item { border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 6px; overflow: hidden; }
.acc-btn { width: 100%; text-align: left; padding: 13px 16px; background: #fff; border: none; cursor: pointer; font-size: 0.95rem; font-weight: 600; color: #0F172A; display: flex; justify-content: space-between; align-items: center; font-family: inherit; }
.acc-btn:hover { background: #F8FAFC; }
.acc-btn::after { content: '+'; font-size: 1.2rem; color: #94A3B8; }
.acc-btn.open::after { content: '−'; }
.acc-content { padding: 14px 16px; background: #FAFAFA; display: none; color: #334155; }
/* Tabs */
.block-tabs { border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; }
.tab-buttons { display: flex; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; overflow-x: auto; }
.tab-btn { padding: 10px 18px; border: none; background: none; cursor: pointer; font-size: 0.9rem; color: #64748B; font-weight: 500; white-space: nowrap; font-family: inherit; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tab-btn.active { color: #4F46E5; border-bottom-color: #4F46E5; }
.tab-panel { padding: 20px; display: none; color: #334155; }
.tab-panel.active { display: block; }
/* Process */
.process-step { display: flex; gap: 16px; margin-bottom: 20px; }
.step-num { width: 32px; height: 32px; border-radius: 50%; background: #4F46E5; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; margin-top: 2px; }
.step-title { font-weight: 700; margin-bottom: 4px; }
.step-desc { color: #64748B; }
/* YouTube */
.yt-wrapper { position: relative; padding-top: 56.25%; border-radius: 10px; overflow: hidden; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.yt-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
.yt-caption { margin-top: 8px; font-size: 0.85rem; color: #64748B; }
/* Quiz base */
.block-quiz { border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; }
.question { font-weight: 700; margin-bottom: 14px; }
/* Multiple choice */
.mc-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.mc-option { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid #E2E8F0; border-radius: 8px; cursor: pointer; font-size: 0.95rem; transition: background .15s; }
.mc-option:hover { background: #F8FAFC; }
.mc-option.correct { background: #F0FDF4; border-color: #22C55E; }
.mc-option.incorrect { background: #FEF2F2; border-color: #EF4444; }
/* True/False */
.tf-row { display: flex; gap: 12px; margin-bottom: 14px; }
.tf-btn { flex: 1; padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 0.95rem; font-weight: 600; font-family: inherit; transition: all .15s; }
.tf-btn:hover { background: #F8FAFC; }
.tf-btn.selected { border-color: #4F46E5; background: #EEF2FF; }
.tf-btn.correct { background: #F0FDF4; border-color: #22C55E; color: #15803D; }
.tf-btn.incorrect { background: #FEF2F2; border-color: #EF4444; color: #DC2626; }
/* Fill in blank */
.fib-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; font-size: 0.95rem; }
.fib-input { border: 2px solid #E2E8F0; border-radius: 8px; padding: 7px 12px; font-size: 0.95rem; font-family: inherit; }
.fib-input:focus { outline: none; border-color: #4F46E5; }
/* Flashcard */
.fc-row { display: flex; align-items: center; gap: 8px; }
.fc-stack { flex: 1; position: relative; height: 200px; }
.fc-ghost { position: absolute; inset: 0; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 14px rgba(0,0,0,.07); }
.fc-wrap { position: absolute; inset: 0; perspective: 1200px; cursor: pointer; user-select: none; }
.fc-inner { position: relative; width: 100%; height: 100%; transition: transform .5s cubic-bezier(.4,0,.2,1); transform-style: preserve-3d; }
.fc-wrap.flipped .fc-inner { transform: rotateY(180deg); }
.fc-face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px; text-align: center; gap: 12px; }
.fc-front { background: #fff; border: 1px solid #E2E8F0; box-shadow: 0 8px 32px rgba(79,70,229,.1), 0 2px 8px rgba(0,0,0,.06); }
.fc-back  { background: linear-gradient(135deg,#4F46E5,#7C3AED); box-shadow: 0 8px 32px rgba(79,70,229,.22); transform: rotateY(180deg); }
.fc-hint { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
.fc-front .fc-hint { color: #4F46E5; opacity: .55; }
.fc-back  .fc-hint { color: rgba(255,255,255,.6); }
.fc-text { font-size: 1.05rem; font-weight: 600; }
.fc-front .fc-text { color: #0F172A; }
.fc-back  .fc-text { color: #fff; }
.fc-nav-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #E2E8F0; background: #fff; cursor: pointer; font-size: 1.3rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #64748B; }
.fc-nav-btn:disabled { opacity: .3; cursor: default; }
.fc-counter { text-align: center; margin-top: 10px; font-size: 0.78rem; color: #94A3B8; }
/* Drag-to-match (select style) */
.block-match .match-pairs { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.match-row { display: flex; align-items: center; gap: 10px; }
.match-prompt { flex: 1; padding: 10px 12px; background: #F1F5F9; border-radius: 8px; font-weight: 600; font-size: 0.9rem; }
.match-arrow { color: #94A3B8; }
.match-select { flex: 1; padding: 9px 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-family: inherit; font-size: 0.9rem; background: #fff; }
.match-row.correct .match-select { border-color: #22C55E; background: #F0FDF4; }
.match-row.incorrect .match-select { border-color: #EF4444; background: #FEF2F2; }
/* Scenario */
.block-scenario { border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; }
.scenario-setup { background: #F8FAFC; padding: 16px 20px; font-style: italic; color: #334155; border-bottom: 1px solid #E2E8F0; }
.scenario-cta { padding: 12px 20px 8px; font-weight: 700; font-size: 0.9rem; }
.scenario-choices { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.scenario-choice { padding: 12px 16px; border: 1px solid #E2E8F0; border-radius: 8px; cursor: pointer; background: #fff; font-family: inherit; font-size: 0.95rem; text-align: left; width: 100%; transition: all .15s; }
.scenario-choice:hover { border-color: #4F46E5; background: #EEF2FF; }
.scenario-choice.correct { border-color: #22C55E; background: #F0FDF4; }
.scenario-choice.wrong { border-color: #EF4444; background: #FEF2F2; }
.consequence { padding: 12px 20px; font-size: 0.9rem; border-top: 1px solid #E2E8F0; }
.consequence.good { color: #15803D; font-weight: 600; }
.consequence.bad  { color: #DC2626; font-weight: 600; }
/* Reveal */
.block-reveal { border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; }
.reveal-prompt { font-weight: 600; margin-bottom: 14px; }
.reveal-btn { padding: 8px 18px; border: 1px solid #4F46E5; color: #4F46E5; background: #fff; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 0.9rem; font-weight: 600; }
.reveal-content { margin-top: 14px; padding: 16px; background: #EEF2FF; border-radius: 8px; color: #334155; }
/* Shared quiz buttons */
.check-btn { padding: 8px 20px; background: #4F46E5; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; font-family: inherit; }
.check-btn:hover { filter: brightness(1.08); }
.check-btn:disabled { opacity: .5; cursor: default; filter: none; }
.retry-btn { display: none; padding: 6px 14px; background: none; color: #64748B; border: 1px solid #E2E8F0; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-family: inherit; margin-top: 8px; margin-left: 8px; }
.feedback { padding: 10px 14px; border-radius: 8px; font-weight: 600; margin-top: 10px; display: none; }
.feedback.ok  { background: #F0FDF4; color: #15803D; }
.feedback.err { background: #FEF2F2; color: #DC2626; }
/* Image */
.block-image img { max-width: 100%; border-radius: 8px; border: 1px solid #E2E8F0; display: block; margin: 0 auto; }
.block-image .img-caption { margin-top: 8px; font-size: 0.85rem; color: #64748B; text-align: center; font-style: italic; }
/* Character / social presence */
.char-block { display: flex; align-items: flex-end; gap: 12px; }
.char-block.right { flex-direction: row-reverse; }
.char-avatar { width: 88px; height: 88px; flex-shrink: 0; border-radius: 50%; border: 2.5px solid; padding: 4px; box-sizing: border-box; }
.char-bubble { flex: 1; min-width: 0; border-radius: 12px; border: 1.5px solid; padding: 16px 20px; }
.char-bubble.left  { border-left-width: 4px; }
.char-bubble.right { border-right-width: 4px; }
.char-label { display: flex; align-items: center; gap: 5px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.char-message { font-size: 0.95rem; line-height: 1.7; color: #334155; }
/* Mood colours */
.mood-introducing { background: #EEF2FF; border-color: #A5B4FC; --accent: #4F46E5; }
.mood-explaining  { background: #F0F9FF; border-color: #7DD3FC; --accent: #0284C7; }
.mood-questioning { background: #FFFBEB; border-color: #FCD34D; --accent: #B45309; }
.mood-bridging    { background: #F0FDF4; border-color: #86EFAC; --accent: #16A34A; }
.mood-encouraging { background: #FFF7ED; border-color: #FDBA74; --accent: #EA580C; }
.mood-cautioning  { background: #FEF3C7; border-color: #FDE68A; --accent: #D97706; }
.mood-introducing .char-label, .mood-introducing .char-avatar { color: #4F46E5; border-color: #A5B4FC; background: #EEF2FF; }
.mood-explaining  .char-label, .mood-explaining  .char-avatar { color: #0284C7; border-color: #7DD3FC; background: #F0F9FF; }
.mood-questioning .char-label, .mood-questioning .char-avatar { color: #B45309; border-color: #FCD34D; background: #FFFBEB; }
.mood-bridging    .char-label, .mood-bridging    .char-avatar { color: #16A34A; border-color: #86EFAC; background: #F0FDF4; }
.mood-encouraging .char-label, .mood-encouraging .char-avatar { color: #EA580C; border-color: #FDBA74; background: #FFF7ED; }
.mood-cautioning  .char-label, .mood-cautioning  .char-avatar { color: #D97706; border-color: #FDE68A; background: #FEF3C7; }
.char-bubble.mood-introducing.left  { border-left-color: #4F46E5; }
.char-bubble.mood-explaining.left   { border-left-color: #0284C7; }
.char-bubble.mood-questioning.left  { border-left-color: #B45309; }
.char-bubble.mood-bridging.left     { border-left-color: #16A34A; }
.char-bubble.mood-encouraging.left  { border-left-color: #EA580C; }
.char-bubble.mood-cautioning.left   { border-left-color: #D97706; }
.char-bubble.mood-introducing.right { border-right-color: #4F46E5; }
.char-bubble.mood-explaining.right  { border-right-color: #0284C7; }
.char-bubble.mood-questioning.right { border-right-color: #B45309; }
.char-bubble.mood-bridging.right    { border-right-color: #16A34A; }
.char-bubble.mood-encouraging.right { border-right-color: #EA580C; }
.char-bubble.mood-cautioning.right  { border-right-color: #D97706; }
/* Footer */
.lesson-footer { border-top: 1px solid #E2E8F0; padding: 28px 24px; background: #fff; text-align: center; }
.lesson-footer-inner { max-width: 720px; margin: 0 auto; }
.complete-btn { padding: 12px 36px; background: #4F46E5; color: #fff; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: filter .15s; }
.complete-btn:hover { filter: brightness(1.08); }
.complete-btn:disabled { opacity: .6; cursor: default; filter: none; }
.complete-msg { display: none; color: #15803D; font-weight: 700; margin-top: 12px; font-size: 0.95rem; }
`.trim();

// ── Interactive JS (inlined in each lesson) ────────────────────────────────
const INTERACTIVE_JS = `
function toggleAccordion(btnId, contentId) {
  var btn = document.getElementById(btnId);
  var content = document.getElementById(contentId);
  var open = content.style.display !== 'none';
  content.style.display = open ? 'none' : 'block';
  btn.classList.toggle('open', !open);
}
function switchTab(groupId, idx) {
  var g = document.getElementById(groupId);
  g.querySelectorAll('.tab-btn').forEach(function(b, i) { b.classList.toggle('active', i === idx); });
  g.querySelectorAll('.tab-panel').forEach(function(p, i) { p.style.display = i === idx ? 'block' : 'none'; });
}
function checkMC(id, correct, explanation) {
  var c = document.getElementById(id);
  var radios = c.querySelectorAll('input[type=radio]');
  var sel = -1;
  radios.forEach(function(r, i) { if (r.checked) sel = i; });
  if (sel === -1) return;
  c.querySelectorAll('.mc-option').forEach(function(el, i) {
    if (i === correct) el.classList.add('correct');
    else if (i === sel) el.classList.add('incorrect');
    el.querySelector('input').disabled = true;
  });
  var fb = c.querySelector('.feedback');
  fb.className = 'feedback ' + (sel === correct ? 'ok' : 'err');
  fb.textContent = (sel === correct ? '✓ Correct!' : '✗ Incorrect') + (explanation ? ' — ' + explanation : '');
  fb.style.display = 'block';
  c.querySelector('.check-btn').disabled = true;
  c.querySelector('.retry-btn').style.display = 'inline-block';
}
function retryMC(id) {
  var c = document.getElementById(id);
  c.querySelectorAll('.mc-option').forEach(function(el) { el.classList.remove('correct','incorrect'); el.querySelector('input').disabled = false; el.querySelector('input').checked = false; });
  c.querySelector('.feedback').style.display = 'none';
  c.querySelector('.check-btn').disabled = false;
  c.querySelector('.retry-btn').style.display = 'none';
}
function checkTF(id, chosen, correct, explanation) {
  var c = document.getElementById(id);
  ['true','false'].forEach(function(v) {
    var btn = document.getElementById(id + '_' + v);
    if (v === correct) btn.classList.add('correct');
    else if (v === chosen) btn.classList.add('incorrect');
    btn.disabled = true;
  });
  var fb = c.querySelector('.feedback');
  fb.className = 'feedback ' + (chosen === correct ? 'ok' : 'err');
  fb.textContent = (chosen === correct ? '✓ Correct!' : '✗ Incorrect') + (explanation ? ' — ' + explanation : '');
  fb.style.display = 'block';
  c.querySelector('.retry-btn').style.display = 'inline-block';
}
function retryTF(id) {
  var c = document.getElementById(id);
  ['true','false'].forEach(function(v) {
    var btn = document.getElementById(id + '_' + v);
    btn.classList.remove('correct','incorrect','selected');
    btn.disabled = false;
  });
  c.querySelector('.feedback').style.display = 'none';
  c.querySelector('.retry-btn').style.display = 'none';
}
function checkFIB(id, answer) {
  var c = document.getElementById(id);
  var input = c.querySelector('.fib-input');
  var ok = input.value.trim().toLowerCase() === answer.trim().toLowerCase();
  input.disabled = true;
  c.querySelector('.check-btn').disabled = true;
  var fb = c.querySelector('.feedback');
  fb.className = 'feedback ' + (ok ? 'ok' : 'err');
  fb.textContent = ok ? '✓ Correct!' : '✗ The answer is: ' + answer;
  fb.style.display = 'block';
  c.querySelector('.retry-btn').style.display = 'inline-block';
}
function retryFIB(id) {
  var c = document.getElementById(id);
  var input = c.querySelector('.fib-input');
  input.value = ''; input.disabled = false;
  c.querySelector('.check-btn').disabled = false;
  c.querySelector('.feedback').style.display = 'none';
  c.querySelector('.retry-btn').style.display = 'none';
}
var _fcIdx = {};
function fcNav(id, total, dir) {
  _fcIdx[id] = ((_fcIdx[id] || 0) + dir + total) % total;
  var idx = _fcIdx[id];
  var cards = document.querySelectorAll('#' + id + ' .fc-wrap');
  cards.forEach(function(c, i) {
    c.style.display = i === idx ? 'block' : 'none';
    c.classList.remove('flipped');
  });
  var ctr = document.getElementById(id + '_counter');
  if (ctr) ctr.textContent = (idx + 1) + ' / ' + total;
  document.getElementById(id + '_prev').disabled = idx === 0;
  document.getElementById(id + '_next').disabled = idx === total - 1;
}
function checkMatch(id, pairs) {
  var c = document.getElementById(id);
  var rows = c.querySelectorAll('.match-row');
  rows.forEach(function(row, i) {
    var sel = row.querySelector('.match-select');
    if (!sel) return;
    var ok = sel.value === pairs[i];
    row.classList.toggle('correct', ok);
    row.classList.toggle('incorrect', !ok);
    sel.disabled = true;
  });
  c.querySelector('.check-btn').disabled = true;
  var fb = c.querySelector('.feedback');
  fb.className = 'feedback ok';
  fb.textContent = 'Done! Review your answers above.';
  fb.style.display = 'block';
}
function pickScenario(id, choiceIdx, isCorrect, consequence) {
  var c = document.getElementById(id);
  c.querySelectorAll('.scenario-choice').forEach(function(btn, i) {
    btn.classList.toggle('correct', i === choiceIdx && isCorrect);
    btn.classList.toggle('wrong', i === choiceIdx && !isCorrect);
    btn.disabled = true;
  });
  var cons = c.querySelector('.consequence');
  cons.className = 'consequence ' + (isCorrect ? 'good' : 'bad');
  cons.textContent = (isCorrect ? '✓ ' : '✗ ') + consequence;
  cons.style.display = 'block';
}
function toggleReveal(id) {
  var content = document.getElementById(id + '_reveal');
  var btn = document.getElementById(id + '_btn');
  var hidden = content.style.display === 'none';
  content.style.display = hidden ? 'block' : 'none';
  btn.textContent = hidden ? 'Hide' : 'Reveal Answer';
}
function markComplete() {
  if (window.ScormWrapper) window.ScormWrapper.complete();
  document.getElementById('complete-btn').disabled = true;
  document.getElementById('complete-msg').style.display = 'block';
}
`.trim();

// ── Block → HTML ───────────────────────────────────────────────────────────
let _blockCounter = 0;
function nextId() { return 'b' + (++_blockCounter); }

function blockToHtml(block) {
  const id = nextId();
  switch (block.type) {
    case 'heading': {
      const tag = { 1: 'h2', 2: 'h3', 3: 'h4' }[block.level] ?? 'h3';
      return `<div class="block block-heading"><${tag}>${esc(block.content)}</${tag}></div>`;
    }
    case 'paragraph':
      return `<div class="block block-paragraph"><p>${esc(block.content)}</p></div>`;

    case 'statement': {
      const variant = block.variant ?? 'note';
      const icons = { note: 'ℹ️', tip: '💡', warning: '⚠️' };
      const titles = { note: 'Note', tip: 'Tip', warning: 'Warning' };
      return `<div class="block block-statement ${esc(variant)}">
  <span class="stmt-icon">${icons[variant] ?? 'ℹ️'}</span>
  <div class="stmt-body"><div class="stmt-title">${titles[variant] ?? 'Note'}</div><div>${esc(block.content)}</div></div>
</div>`;
    }
    case 'quote':
      return `<div class="block block-quote">
  <blockquote>${esc(block.content)}</blockquote>
  ${block.attribution ? `<div class="attr">— ${esc(block.attribution)}</div>` : ''}
</div>`;

    case 'bullet-list': {
      const items = (block.items ?? []).map(i => `<li>${esc(i)}</li>`).join('');
      return `<div class="block block-list"><ul>${items}</ul></div>`;
    }
    case 'numbered-list': {
      const items = (block.items ?? []).map(i => `<li>${esc(i)}</li>`).join('');
      return `<div class="block block-list"><ol>${items}</ol></div>`;
    }
    case 'accordion': {
      const items = (block.items ?? []).map((item, i) => {
        const cid = `${id}_a${i}`;
        return `<div class="acc-item">
  <button class="acc-btn" id="btn_${cid}" onclick="toggleAccordion('btn_${cid}','${cid}')">${esc(item.label)}</button>
  <div class="acc-content" id="${cid}">${esc(item.content)}</div>
</div>`;
      }).join('');
      return `<div class="block block-accordion">${items}</div>`;
    }
    case 'tabs': {
      const items = block.items ?? [];
      const btns = items.map((item, i) =>
        `<button class="tab-btn${i === 0 ? ' active' : ''}" onclick="switchTab('${id}',${i})">${esc(item.label)}</button>`
      ).join('');
      const panels = items.map((item, i) =>
        `<div class="tab-panel${i === 0 ? ' active' : ''}">${esc(item.content)}</div>`
      ).join('');
      return `<div class="block block-tabs" id="${id}">
  <div class="tab-buttons">${btns}</div>
  <div class="tab-panels">${panels}</div>
</div>`;
    }
    case 'process': {
      const steps = (block.steps ?? []).map((s, i) => `<div class="process-step">
  <div class="step-num">${i + 1}</div>
  <div><div class="step-title">${esc(s.title)}</div>${s.content ? `<div class="step-desc">${esc(s.content)}</div>` : ''}</div>
</div>`).join('');
      return `<div class="block">${steps}</div>`;
    }
    case 'divider':
      return `<div class="block block-divider"><hr></div>`;

    case 'youtube':
      return `<div class="block">
  <div class="yt-wrapper"><iframe src="https://www.youtube-nocookie.com/embed/${esc(block.videoId)}?rel=0" allowfullscreen title="${esc(block.caption ?? 'YouTube video')}"></iframe></div>
  ${block.caption ? `<div class="yt-caption">${esc(block.caption)}</div>` : ''}
</div>`;

    case 'diagram': {
      if (!block.svg) return '';
      const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(block.svg)}`;
      return `<div class="block" style="text-align:center">
  <img src="${src}" alt="${esc(block.caption ?? 'Diagram')}" style="max-width:100%;border-radius:8px;border:1px solid #E2E8F0;background:#fff;display:block;margin:0 auto;">
  ${block.caption ? `<div class="yt-caption">${esc(block.caption)}</div>` : ''}
</div>`;
    }

    case 'image': {
      if (!block._scormSrc) return '';
      return `<div class="block block-image">
  <img src="${block._scormSrc}" alt="${esc(block.alt ?? block.caption ?? 'Image')}">
  ${block.caption ? `<div class="img-caption">${esc(block.caption)}</div>` : ''}
</div>`;
    }

    case 'character': {
      const mood = block.mood ?? 'explaining';
      const RIGHT_MOODS = new Set(['questioning', 'bridging']);
      const isRight = RIGHT_MOODS.has(mood);
      const MOOD_LABELS = {
        introducing: '👋 Let me introduce…', explaining: '💡 Here\'s how it works',
        questioning: '🤔 Think about this', bridging: '🔗 Connecting the dots',
        encouraging: '⭐ Keep it up!', cautioning: '⚠️ Watch out for this',
      };
      const label = MOOD_LABELS[mood] ?? '💡 Says';
      const avatarContent = block._scormSvg
        ? block._scormSvg
        : `<div style="width:88px;height:88px;border-radius:50%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font-size:2rem">🧑‍🏫</div>`;
      const side = isRight ? 'right' : 'left';
      return `<div class="block char-block ${isRight ? 'right' : ''}">
  <div class="char-avatar mood-${esc(mood)}">${avatarContent}</div>
  <div class="char-bubble mood-${esc(mood)} ${side}">
    <div class="char-label">${label}</div>
    <div class="char-message">${esc(block.message)}</div>
  </div>
</div>`;
    }

    case 'multiple-choice': {
      const opts = (block.options ?? []).map((opt, i) => `<label class="mc-option" id="${id}_o${i}">
  <input type="radio" name="${id}_r" value="${i}"> ${esc(opt)}
</label>`).join('');
      return `<div class="block block-quiz" id="${id}">
  <div class="question">${esc(block.question)}</div>
  <div class="mc-options">${opts}</div>
  <button class="check-btn" onclick="checkMC('${id}',${Number(block.correct)},'${esc(block.explanation ?? '')}')">Check Answer</button>
  <button class="retry-btn" onclick="retryMC('${id}')">Try Again</button>
  <div class="feedback"></div>
</div>`;
    }
    case 'true-false': {
      const correct = block.correct === true ? 'true' : 'false';
      return `<div class="block block-quiz" id="${id}">
  <div class="question">${esc(block.statement)}</div>
  <div class="tf-row">
    <button class="tf-btn" id="${id}_true"  onclick="checkTF('${id}','true','${correct}','${esc(block.explanation ?? '')}')">True</button>
    <button class="tf-btn" id="${id}_false" onclick="checkTF('${id}','false','${correct}','${esc(block.explanation ?? '')}')">False</button>
  </div>
  <button class="retry-btn" onclick="retryTF('${id}')">Try Again</button>
  <div class="feedback"></div>
</div>`;
    }
    case 'fill-in-blank': {
      const parts = (block.template ?? '').split('___');
      const fibRow = parts.map((part, i) =>
        i < parts.length - 1
          ? `${esc(part)} <input class="fib-input" type="text" placeholder="${esc(block.hint ?? 'answer')}">`
          : esc(part)
      ).join('');
      return `<div class="block block-quiz" id="${id}">
  <div class="question">Fill in the blank:</div>
  <div class="fib-row">${fibRow}</div>
  <button class="check-btn" onclick="checkFIB('${id}','${esc(block.answer ?? '')}')">Check</button>
  <button class="retry-btn" onclick="retryFIB('${id}')">Try Again</button>
  <div class="feedback"></div>
</div>`;
    }
    case 'flashcard': {
      const cards = block.cards ?? [];
      const ghostCount = Math.min(2, cards.length - 1);
      const ghostAngles = [-5, 3.5];
      const ghostColors = ['#E0E7FF', '#C7D2FE'];
      const cardDivs = cards.map((card, i) => `<div class="fc-wrap" id="${id}_c${i}" style="${i > 0 ? 'display:none' : ''}" onclick="this.classList.toggle('flipped')">
  <div class="fc-inner">
    <div class="fc-face fc-front"><div class="fc-hint">Tap to flip</div><div class="fc-text">${esc(card.front)}</div></div>
    <div class="fc-face fc-back"><div class="fc-hint">Answer</div><div class="fc-text">${esc(card.back)}</div></div>
  </div>
</div>`).join('');
      const ghosts = Array.from({ length: ghostCount }, (_, i) =>
        `<div class="fc-ghost" style="background:${ghostColors[i]};transform:rotate(${ghostAngles[i]}deg);z-index:${ghostCount - i}"></div>`
      ).join('');
      return `<div class="block" id="${id}">
  <div class="fc-row">
    <button class="fc-nav-btn" id="${id}_prev" onclick="fcNav('${id}',${cards.length},-1)" disabled>&#8249;</button>
    <div class="fc-stack">
      ${ghosts}
      <div style="position:absolute;inset:0;z-index:${ghostCount + 1}">${cardDivs}</div>
    </div>
    <button class="fc-nav-btn" id="${id}_next" onclick="fcNav('${id}',${cards.length},1)" ${cards.length <= 1 ? 'disabled' : ''}>&#8250;</button>
  </div>
  ${cards.length > 1 ? `<div class="fc-counter" id="${id}_counter">1 / ${cards.length}</div>` : ''}
</div>`;
    }
    case 'drag-to-match': {
      const pairs = block.pairs ?? [];
      const allAnswers = pairs.map(p => p.answer);
      const shuffled = [...allAnswers].sort(() => Math.random() - 0.5);
      const answersJson = esc(JSON.stringify(allAnswers));
      const rows = pairs.map((pair, i) => `<div class="match-row" id="${id}_r${i}">
  <span class="match-prompt">${esc(pair.prompt)}</span>
  <span class="match-arrow">→</span>
  <select class="match-select">
    <option value="">Choose…</option>
    ${shuffled.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join('')}
  </select>
</div>`).join('');
      return `<div class="block block-match" id="${id}">
  <div class="question">Match each item with its answer:</div>
  <div class="match-pairs">${rows}</div>
  <button class="check-btn" onclick="checkMatch('${id}',${answersJson})">Check</button>
  <div class="feedback"></div>
</div>`;
    }
    case 'scenario': {
      const choices = block.choices ?? [];
      const choiceBtns = choices.map((c, i) => `<button class="scenario-choice" onclick="pickScenario('${id}',${i},${!!c.isCorrect},'${esc(c.consequence)}')">${esc(c.label)}</button>`).join('');
      return `<div class="block block-scenario" id="${id}">
  <div class="scenario-setup">${esc(block.setup)}</div>
  <div class="scenario-cta">What would you do?</div>
  <div class="scenario-choices">${choiceBtns}</div>
  <div class="consequence" style="display:none"></div>
</div>`;
    }
    case 'reveal':
      return `<div class="block block-reveal" id="${id}">
  <div class="reveal-prompt">${esc(block.prompt)}</div>
  <button class="reveal-btn" id="${id}_btn" onclick="toggleReveal('${id}')">Reveal Answer</button>
  <div class="reveal-content" id="${id}_reveal" style="display:none">${esc(block.revealContent)}</div>
</div>`;

    default:
      return '';
  }
}

// ── Lesson → full HTML document ────────────────────────────────────────────
function lessonToHtml(lesson, index, total, courseTitle) {
  _blockCounter = 0; // reset counter per lesson
  const blocksHtml = (lesson.blocks ?? []).map(blockToHtml).filter(Boolean).join('\n');
  const progress = total > 1 ? `Lesson ${index + 1} of ${total}` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(lesson.title)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="lesson-page">
  <header class="lesson-header">
    <div class="lesson-header-inner">
      ${courseTitle ? `<div class="lesson-course">${esc(courseTitle)}</div>` : ''}
      <div class="lesson-title">${esc(lesson.title)}</div>
      ${progress ? `<div class="lesson-progress">${progress}</div>` : ''}
    </div>
  </header>

  <main class="lesson-content">
${blocksHtml}
  </main>

  <footer class="lesson-footer">
    <div class="lesson-footer-inner">
      <button class="complete-btn" id="complete-btn" onclick="markComplete()">
        Mark as Complete ✓
      </button>
      <div class="complete-msg" id="complete-msg">
        ✓ Progress saved! You can close this lesson.
      </div>
    </div>
  </footer>
</div>
<script src="scorm.js"></script>
<script>${INTERACTIVE_JS}</script>
</body>
</html>`;
}

// ── imsmanifest.xml ────────────────────────────────────────────────────────
function generateManifest(course) {
  const lessons = course.lessons ?? [];
  const safeId = (course.id ?? 'course').replace(/[^a-zA-Z0-9_-]/g, '_');

  const items = lessons.map((l, i) => `      <item identifier="item_${i}" identifierref="res_${i}">
        <title>${esc(l.title)}</title>
      </item>`).join('\n');

  const resources = lessons.map((l, i) => `    <resource identifier="res_${i}" type="webcontent" adlcp:scormtype="sco" href="lesson_${i}.html">
      <file href="lesson_${i}.html"/>
      <file href="scorm.js"/>
      <file href="styles.css"/>
    </resource>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com_${safeId}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org_${safeId}">
    <organization identifier="org_${safeId}">
      <title>${esc(course.title)}</title>
${items}
    </organization>
  </organizations>
  <resources>
${resources}
  </resources>
</manifest>`;
}

// ── Prefetch AI images as base64 for self-contained SCORM ──────────────────
async function fetchImageAsBase64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function fetchSvgText(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function prefetchImages(lessons) {
  // Inline the URL builder — same logic as ImageBlock.jsx's pollinationsUrl
  function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
  }
  function imageUrl(prompt) {
    const seed = hashSeed(prompt);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&model=flux&seed=${seed}`;
  }

  const tasks = [];
  for (const lesson of lessons) {
    for (const block of lesson.blocks ?? []) {
      if (block.type === 'image' && block.prompt) {
        tasks.push(
          fetchImageAsBase64(imageUrl(block.prompt)).then((dataUri) => {
            block._scormSrc = dataUri ?? '';
          })
        );
      }
      if (block.type === 'character' && block.persona) {
        const svgUrl = `https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(block.persona)}&backgroundColor=transparent`;
        tasks.push(
          fetchSvgText(svgUrl).then((svg) => {
            // Wrap in a sized container so the SVG fills the avatar circle
            block._scormSvg = svg
              ? svg.replace('<svg ', '<svg width="80" height="80" style="display:block" ')
              : null;
          })
        );
      }
    }
  }
  if (tasks.length) await Promise.all(tasks);
}

// ── Public export functions ────────────────────────────────────────────────
async function buildZip(course, lessons) {
  // Deep-clone lessons so we don't mutate the store
  const clonedLessons = JSON.parse(JSON.stringify(lessons));
  await prefetchImages(clonedLessons);

  const zip = new JSZip();
  zip.file('imsmanifest.xml', generateManifest({ ...course, lessons: clonedLessons }));
  zip.file('scorm.js', SCORM_JS);
  zip.file('styles.css', SCORM_CSS);
  clonedLessons.forEach((lesson, i) => {
    zip.file(`lesson_${i}.html`, lessonToHtml(lesson, i, clonedLessons.length, course.title));
  });
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(title) {
  return title.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').slice(0, 60) || 'course';
}

export async function exportCourseToScorm(course) {
  const blob = await buildZip(course, course.lessons ?? []);
  downloadBlob(blob, `${safeFilename(course.title)}_scorm.zip`);
}

export async function exportLessonToScorm(course, lesson) {
  const blob = await buildZip(course, [lesson]);
  downloadBlob(blob, `${safeFilename(lesson.title)}_scorm.zip`);
}
