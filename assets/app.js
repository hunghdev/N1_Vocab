/* JLPT N1 Vocabulary Studio — loads data/vocab.csv, no external services. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {get(k, d){try{const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v);}catch(_){return d;}}, set(k, v){try{localStorage.setItem(k, JSON.stringify(v));}catch(_){}}};

/* ------------------------------------------------------------------ texts */
const BOOKS = {
  1: {vi: 'Book 1 · Từ vựng tổng hợp', en: 'Book 1 · Core vocabulary'},
  2: {vi: 'Book 2 · Học theo Kanji', en: 'Book 2 · Vocabulary by kanji'},
  3: {vi: 'Book 3 · Từ vựng theo loại', en: 'Book 3 · Vocabulary by type'},
  4: {vi: 'Book 4 · Ôn luyện tổng hợp', en: 'Book 4 · Comprehensive review'},
};
const TYPES = ['reading', 'context', 'paraphrase', 'usage'];
const EXAM_SHARE = {reading: 6, context: 7, paraphrase: 6, usage: 6}; // JLPT N1 vocabulary section
const INSTR = {
  reading: {ja: '＿＿＿の言葉の読み方として最もよいものを、1・2・3・4から一つ選びなさい。', vi: 'Chọn cách đọc đúng nhất của từ được gạch chân.', en: 'Choose the best reading of the underlined word.'},
  context: {ja: '（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。', vi: 'Chọn từ thích hợp nhất để điền vào chỗ trống.', en: 'Choose the best word to fill the blank.'},
  paraphrase: {ja: '＿＿＿の言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。', vi: 'Chọn từ/cụm từ có nghĩa gần nhất với từ được gạch chân.', en: 'Choose the option closest in meaning to the underlined word.'},
  usage: {ja: '次の言葉の使い方として最もよいものを、1・2・3・4から一つ選びなさい。', vi: 'Chọn câu dùng từ sau đây đúng nhất.', en: 'Choose the sentence that uses the word most appropriately.'},
};
const POS = {n:{vi:'Danh từ',en:'Noun'},vs:{vi:'Danh từ / động từ する',en:'Noun / する verb'},v:{vi:'Động từ',en:'Verb'},'adj-i':{vi:'Tính từ -i',en:'i-adjective'},'adj-na':{vi:'Tính từ -na',en:'na-adjective'},adv:{vi:'Phó từ',en:'Adverb'},expr:{vi:'Thành ngữ',en:'Expression'},'n-na':{vi:'Danh từ / tính từ -na',en:'Noun / na-adj.'},'n-adv':{vi:'Danh từ / phó từ',en:'Noun / adverb'},pref:{vi:'Tiền tố',en:'Prefix'},suf:{vi:'Hậu tố',en:'Suffix'},conj:{vi:'Liên từ',en:'Conjunction'},'pre-n':{vi:'Liên thể từ',en:'Pre-noun adjectival'}};
const TRAP = {long:{vi:'bẫy trường âm',en:'long-vowel trap'},short:{vi:'bẫy bỏ trường âm',en:'missing long vowel'},voice:{vi:'bẫy âm đục / âm trong',en:'voicing trap'},sokuon:{vi:'bẫy âm ngắt っ',en:'small っ trap'},youon:{vi:'bẫy âm ghép ゃゅょ',en:'yōon trap'}};
const TX = {
vi: {heroTitle:'Học từ vựng N1 và luyện đề theo đúng cấu trúc kỳ thi', heroSub:'4601 từ từ 4 cuốn sách, mỗi từ chỉ xuất hiện một lần. Có nghĩa Việt–Anh, giải thích ngắn, từ gần nghĩa và câu ví dụ ngữ cảnh thật. Phần luyện đề dùng đúng 4 dạng câu hỏi từ vựng của JLPT N1.', statAll:'Từ vựng', statLessons:'Bài học', statBooks:'Cuốn sách', statQuestions:'Câu hỏi có thể tạo', tabStudy:'📚 Học từ', tabQuiz:'📝 Luyện đề N1', tabReview:'🔁 Ôn từ sai', loading:'Đang tải dữ liệu…', loadError:'Không tải được data/vocab.csv. Hãy mở trang qua một máy chủ web (ví dụ Vercel hoặc "npx serve"), không mở trực tiếp file.',
studyTitle:'Tra cứu và học từng từ', studyIntro:'Lọc theo sách, bài, loại từ hoặc số sao ★ trong sách. Bấm VI/EN ở góc phải để đổi ngôn ngữ giải thích.', labelBook:'Sách', labelLesson:'Bài', labelPos:'Loại từ', labelStar:'Mức quan trọng', labelSearch:'Tìm từ (Kanji, kana, nghĩa Việt/Anh)', searchPh:'例: 把握, はあく, nắm bắt, grasp…', all:'Tất cả', lesson:'Bài', loadMore:'Xem thêm', shown:'Hiện', of:'trên', words:'từ', noWord:'Không tìm thấy từ phù hợp.', star0:'Không có ★',
meaning:'Nghĩa', explain:'Giải thích', example:'Ví dụ', synonym:'Từ gần nghĩa', collocation:'Cụm từ trong sách', pdfMeaning:'Nghĩa trong sách', jaDef:'Giải nghĩa tiếng Nhật trong sách', notes:'Ghi chú (đã sửa lỗi in)', alsoIn:'Cũng xuất hiện ở', alt:'Cách viết/đọc khác', speak:'Nghe', bookmark:'Ôn lại',
quizTitle:'Luyện đề từ vựng JLPT N1', quizIntro:'Phần từ vựng của đề N1 gồm 4 dạng: 問題1 đọc Kanji, 問題2 điền từ theo ngữ cảnh, 問題3 từ gần nghĩa, 問題4 cách dùng từ. Chế độ “Đề chuẩn N1” lấy đúng tỷ lệ 6–7–6–6 câu như đề thật.', scopeTitle:'Chọn sách và bài', scopeAll:'Chọn tất cả', scopeNone:'Bỏ chọn', selectedLessons:'bài đã chọn', labelQuizType:'Dạng câu', labelQuizCount:'Số câu', labelQuizStyle:'Cách chấm', labelOrder:'Thứ tự', mix:'Đề chuẩn N1 (cả 4 dạng)', reading:'問題1 · 漢字読み · Đọc Kanji', context:'問題2 · 文脈規定 · Điền từ', paraphrase:'問題3 · 言い換え類義 · Từ gần nghĩa', usage:'問題4 · 用法 · Cách dùng', c25:'25 câu (như đề thật)', c10:'10 câu', c50:'50 câu', c100:'100 câu', cAll:'Tất cả', practice:'Luyện tập · chấm từng câu', mock:'Thi thử · chấm cuối bài', orderExam:'Theo thứ tự đề thi', orderRandom:'Ngẫu nhiên', available:'câu có thể tạo', quizStart:'Bắt đầu', quizNote:'Mỗi lượt không hỏi lại cùng một từ. Đáp án nhiễu được chọn theo cách ra đề thật: cách đọc sai kiểu trường âm/âm đục/っ, từ cùng loại và cùng dạng chia, câu dùng sai ngữ cảnh.', quizExit:'Quay lại', quizNext:'Câu tiếp →', quizFinish:'Xem kết quả →', question:'Câu', right:'Đúng', answered:'Đã làm', correct:'Chính xác!', incorrect:'Chưa đúng.', answer:'Đáp án', explainAll:'Giải thích các lựa chọn', readingOf:'Cách đọc đúng', wrongReading:'Không phải cách đọc đúng', isParaOf:'là nghĩa gần của', usageRight:'Câu dùng đúng.', usageWrong:'Dùng sai. Chỗ này phải dùng', finishTitle:'Kết quả', finishCorrect:'Số câu đúng', finishRate:'Tỷ lệ đúng', finishMissed:'Từ cần ôn', byType:'Theo dạng', good:'Rất tốt! Tiếp tục duy trì nhé.', other:'Hãy xem lời giải bên dưới và ôn lại các từ sai.', retryQuiz:'Làm đề mới', openMistakes:'Xem từ sai', answerReview:'Đáp án và lời giải', wrongReview:'Các câu sai',
reviewTitle:'Ôn những từ đã trả lời sai', reviewIntro:'Danh sách lưu trên trình duyệt này (localStorage).', reviewRetry:'Luyện lại từ sai', exportCsv:'Tải CSV', clearReview:'Xóa danh sách', noMistakes:'Chưa có từ nào trong danh sách.', clearConfirm:'Xóa toàn bộ danh sách từ sai?', noQuiz:'Không đủ câu hỏi phù hợp. Hãy chọn thêm bài hoặc đổi dạng câu.', noAudio:'Trình duyệt không hỗ trợ đọc thành tiếng.',
footerNote:'Dữ liệu tổng hợp từ 4 cuốn sách JLPT N1, loại trùng; nghĩa, giải thích và câu ví dụ được biên soạn và đối chiếu với nghĩa trong sách. Câu hỏi được sinh tự động theo cấu trúc đề N1 — đây là đề luyện, không phải đề thi chính thức.'},
en: {heroTitle:'Master N1 vocabulary and practice with the real exam format', heroSub:'4,601 unique words from 4 books, with Vietnamese–English meanings, short explanations, near-synonyms and natural example sentences. Practice uses the four official JLPT N1 vocabulary question types.', statAll:'Words', statLessons:'Lessons', statBooks:'Books', statQuestions:'Generated questions', tabStudy:'📚 Study', tabQuiz:'📝 N1 practice', tabReview:'🔁 Mistakes', loading:'Loading data…', loadError:'Could not load data/vocab.csv. Open the site through a web server (e.g. Vercel or "npx serve"), not as a local file.',
studyTitle:'Browse and study words', studyIntro:'Filter by book, lesson, part of speech or ★ importance. Use VI/EN at the top right to switch languages.', labelBook:'Book', labelLesson:'Lesson', labelPos:'Part of speech', labelStar:'Importance', labelSearch:'Search (kanji, kana, VI/EN meaning)', searchPh:'e.g. 把握, はあく, grasp…', all:'All', lesson:'Lesson', loadMore:'Show more', shown:'Showing', of:'of', words:'words', noWord:'No matching words.', star0:'No ★',
meaning:'Meaning', explain:'Explanation', example:'Example', synonym:'Near-synonym', collocation:'Collocation in book', pdfMeaning:'Meaning in book (VI)', jaDef:'Japanese definition in book', notes:'Notes (corrected misprints)', alsoIn:'Also appears in', alt:'Other spellings/readings', speak:'Listen', bookmark:'Review',
quizTitle:'JLPT N1 vocabulary practice', quizIntro:'The N1 vocabulary section has 4 types: 問題1 kanji reading, 問題2 contextual fill-in, 問題3 paraphrase, 問題4 usage. “Standard N1 set” follows the real 6–7–6–6 distribution.', scopeTitle:'Select books and lessons', scopeAll:'Select all', scopeNone:'Clear', selectedLessons:'lessons selected', labelQuizType:'Question type', labelQuizCount:'Questions', labelQuizStyle:'Scoring', labelOrder:'Order', mix:'Standard N1 set (all 4 types)', reading:'問題1 · 漢字読み · Reading', context:'問題2 · 文脈規定 · Fill-in', paraphrase:'問題3 · 言い換え類義 · Paraphrase', usage:'問題4 · 用法 · Usage', c25:'25 (real exam size)', c10:'10', c50:'50', c100:'100', cAll:'All', practice:'Practice · instant feedback', mock:'Mock exam · score at the end', orderExam:'Exam order', orderRandom:'Random', available:'questions available', quizStart:'Start', quizNote:'A word is asked only once per round. Distractors follow real exam design: misreadings (long vowel, voicing, small っ), same-type words in the same inflected form, and sentences using the word in the wrong context.', quizExit:'Back', quizNext:'Next →', quizFinish:'See results →', question:'Question', right:'Correct', answered:'Answered', correct:'Correct!', incorrect:'Not quite.', answer:'Answer', explainAll:'About each option', readingOf:'Correct reading', wrongReading:'Not the correct reading', isParaOf:'is a paraphrase of', usageRight:'Correct usage.', usageWrong:'Wrong usage. This sentence needs', finishTitle:'Results', finishCorrect:'Correct', finishRate:'Score', finishMissed:'Words to review', byType:'By type', good:'Great job! Keep it up.', other:'Check the explanations below and review the missed words.', retryQuiz:'New quiz', openMistakes:'Open mistakes', answerReview:'Answers and explanations', wrongReview:'Missed questions',
reviewTitle:'Review your mistakes', reviewIntro:'Saved in this browser (localStorage).', reviewRetry:'Practice mistakes', exportCsv:'Download CSV', clearReview:'Clear list', noMistakes:'No words in your list yet.', clearConfirm:'Clear the whole mistakes list?', noQuiz:'Not enough questions. Select more lessons or change the type.', noAudio:'Speech is not supported in this browser.',
footerNote:'Compiled and de-duplicated from 4 JLPT N1 books; meanings, explanations and examples were written and checked against the books. Questions are generated in the N1 format — practice material, not an official exam.'}};
let lang = store.get('n1-lang', 'vi') === 'en' ? 'en' : 'vi';
const T = k => TX[lang][k] ?? k;

/* ------------------------------------------------------------------ CSV */
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const splitLast = (s, sep) => { const i = s.lastIndexOf(sep); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + sep.length)]; };

let data = [], byId = new Map();
function prepare(rows) {
  data = rows.map(r => {
    const w = {...r, book: +r.book, lesson: +r.lesson, importance: +r.importance || 0, pos: (r.pos || '').split(',')};
    const m = /【(.+?)】/.exec(r.example_ja || ''); w.B = m ? m[1] : '';
    w.lessons = [`${w.book}:${w.lesson}`, ...(r.also_in ? r.also_in.split(';').map(x => x.trim().replace('-', ':')).filter(Boolean) : [])];
    if (r.q_read) { const [ans, rest] = splitLast(r.q_read, '|'); w.qRead = {answer: ans, opts: rest.split(';').map(x => { const [o, k] = splitLast(x, ':'); return {label: o, trap: k}; })}; }
    const pairs = s => s ? s.split(';').map(x => { const [o, id] = splitLast(x, ':'); return {label: o, id}; }) : null;
    w.qCtx = pairs(r.q_context); w.qPara = pairs(r.q_paraphrase);
    w.qUse = r.q_usage ? r.q_usage.split('§').map(x => { const [s, id] = splitLast(x, '::'); return {label: s, id}; }) : null;
    return w;
  });
  byId = new Map(data.map(w => [w.id, w]));
}

/* ------------------------------------------------------------------ helpers */
const meaning = w => lang === 'vi' ? w.meaning_vi : w.meaning_en;
const explainOf = w => lang === 'vi' ? w.explain_vi : w.explain_en;
const exTrans = w => lang === 'vi' ? w.example_vi : w.example_en;
const posLabel = w => w.pos.map(p => (POS[p] || {})[lang] || p).join(' / ');
const stars = n => n ? '★'.repeat(n) : '';
const marked = (s, mode) => esc(s).replace(/【(.+?)】/, (_, x) => mode === 'blank' ? '<span class="blank">（　　　）</span>' : mode === 'plain' ? x : (mode === 'mark' ? `<mark class="target-word">${x}</mark>` : `<u>${x}</u>`));
const plain = s => String(s || '').replace(/[【】]/g, '');
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function speak(text) { if (!('speechSynthesis' in window)) { alert(T('noAudio')); return; } speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = .85; speechSynthesis.speak(u); }
function setOptions(sel, items, keep) { const old = keep ?? sel.value; sel.replaceChildren(...items.map(([v, l]) => { const o = document.createElement('option'); o.value = v; o.textContent = l; return o; })); sel.value = items.some(x => String(x[0]) === String(old)) ? old : items[0][0]; }
const lessonsOf = b => [...new Set(data.filter(w => w.book === b).map(w => w.lesson))].sort((a, c) => a - c);

/* ------------------------------------------------------------------ i18n */
function applyTexts() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  $('lang-current').textContent = lang.toUpperCase(); $('lang-other').textContent = lang === 'vi' ? 'EN' : 'VI';
  $('study-search').placeholder = T('searchPh');
  const books = [['all', T('all')], ...[1, 2, 3, 4].map(b => [b, BOOKS[b][lang]])];
  setOptions($('study-book'), books); updateLessonSelect();
  const posCount = {}; data.forEach(w => { posCount[w.pos[0]] = (posCount[w.pos[0]] || 0) + 1; });
  setOptions($('study-pos'), [['all', T('all')], ...Object.keys(POS).filter(p => posCount[p]).map(p => [p, `${POS[p][lang]} (${posCount[p]})`])]);
  setOptions($('study-star'), [['all', T('all')], ['3', '★★★'], ['2', '★★'], ['1', '★'], ['0', T('star0')]]);
  setOptions($('quiz-type'), [['mix', T('mix')], ...TYPES.map(t => [t, T(t)])]);
  setOptions($('quiz-count'), [['25', T('c25')], ['10', T('c10')], ['50', T('c50')], ['100', T('c100')], ['all', T('cAll')]]);
  setOptions($('quiz-style'), [['practice', T('practice')], ['mock', T('mock')]]);
  setOptions($('quiz-order'), [['exam', T('orderExam')], ['random', T('orderRandom')]]);
}
function updateLessonSelect() { const b = $('study-book').value; const list = [['all', T('all')]]; for (const bk of (b === 'all' ? [1, 2, 3, 4] : [+b])) for (const l of lessonsOf(bk)) list.push([`${bk}:${l}`, (b === 'all' ? `B${bk} · ` : '') + `${T('lesson')} ${l}`]); setOptions($('study-lesson'), list); }
$('lang-toggle').onclick = () => { lang = lang === 'vi' ? 'en' : 'vi'; store.set('n1-lang', lang); applyTexts(); renderBookTree(); renderStudy(); if (activeTab === 'review') renderReview(); if (current) { renderQuestion(); if (current.selected !== null && style === 'practice') renderFeedback(); } if (!$('quiz-finish').classList.contains('hidden')) renderFinish(); };

/* ------------------------------------------------------------------ tabs */
let activeTab = 'study';
function showTab(t) { activeTab = t; for (const s of ['study', 'quiz', 'review']) { $('panel-' + s).classList.toggle('hidden', s !== t); $('tab-' + s).classList.toggle('active', s === t); } if (t === 'review') renderReview(); if (t === 'quiz') updateAvailability(); }
for (const s of ['study', 'quiz', 'review']) $('tab-' + s).onclick = () => showTab(s);

/* ------------------------------------------------------------------ study */
let wrongIds = store.get('n1-wrong', []); if (!Array.isArray(wrongIds)) wrongIds = [];
const saveWrong = () => store.set('n1-wrong', [...new Set(wrongIds)]);
let studyLimit = 24;
function wordCard(w) {
  const extra = [];
  if (w.collocation) extra.push(`<div class="kv"><b>${T('collocation')}:</b> <span lang="ja">${esc(w.collocation)}</span></div>`);
  if (w.pdf_meaning_vi) extra.push(`<div class="kv"><b>${T('pdfMeaning')}:</b> ${esc(w.pdf_meaning_vi)}</div>`);
  if (w.ja_def_pdf) extra.push(`<div class="kv"><b>${T('jaDef')}:</b> <span lang="ja">${esc(w.ja_def_pdf)}</span></div>`);
  if (w.alt_spellings || w.alt_readings) extra.push(`<div class="kv"><b>${T('alt')}:</b> <span lang="ja">${esc([w.alt_spellings, w.alt_readings].filter(Boolean).join('／'))}</span></div>`);
  if (w.notes) extra.push(`<div class="kv"><b>${T('notes')}:</b> ${esc(w.notes)}</div>`);
  if (w.lessons.length > 1) extra.push(`<div class="kv"><b>${T('alsoIn')}:</b> ${w.lessons.slice(1).map(x => { const [b, l] = x.split(':'); return `B${b}·${T('lesson')} ${l}`; }).join(', ')}</div>`);
  return `<article class="word-card"><div class="word-top"><div><div class="headword" lang="ja">${esc(w.word)}</div><div class="reading" lang="ja">${esc(w.reading)}</div></div><span class="tag">B${w.book} · ${T('lesson')} ${w.lesson}</span></div>
<div class="meta-row">${w.importance ? `<span class="pill star">${stars(w.importance)}</span>` : ''}<span class="pill">${esc(posLabel(w))}</span>${w.synonym_ja ? `<span class="pill" lang="ja">≈ ${esc(w.synonym_ja)}</span>` : ''}</div>
<div class="definition">${esc(meaning(w))}</div><div class="simple-explanation"><div class="minor"><b>${T('explain')}</b></div><p>${esc(explainOf(w))}</p></div>
<div class="example"><div class="minor"><b>${T('example')}</b></div><div lang="ja" class="example-ja">${marked(w.example_ja, 'mark')}</div><div class="example-trans">${esc(exTrans(w))}</div></div>
${extra.length ? `<details class="source-details"><summary>${lang === 'vi' ? 'Thông tin trong sách' : 'Book details'}</summary>${extra.join('')}</details>` : ''}
<div class="card-actions"><button data-speak="${esc(w.id)}">🔉 ${T('speak')}</button><button data-star="${esc(w.id)}" class="right">${wrongIds.includes(w.id) ? '★' : '☆'} ${T('bookmark')}</button></div></article>`;
}
function filterWords() {
  const b = $('study-book').value, l = $('study-lesson').value, p = $('study-pos').value, s = $('study-star').value;
  let q = $('study-search').value.trim().normalize('NFKC').toLowerCase();
  return data.filter(w => (b === 'all' || w.book === +b || w.lessons.some(x => x.startsWith(b + ':'))) && (l === 'all' || w.lessons.includes(l)) && (p === 'all' || w.pos[0] === p) && (s === 'all' || w.importance === +s)
    && (!q || [w.word, w.reading, w.alt_spellings, w.meaning_vi, w.meaning_en, w.synonym_ja].join(' ').normalize('NFKC').toLowerCase().includes(q)));
}
function renderStudy() { const all = filterWords(), slice = all.slice(0, studyLimit); $('word-list').innerHTML = slice.length ? slice.map(wordCard).join('') : `<p class="sub">${T('noWord')}</p>`; $('study-count').textContent = `${T('shown')} ${slice.length.toLocaleString()} ${T('of')} ${all.length.toLocaleString()} ${T('words')}`; $('show-more').classList.toggle('hidden', slice.length >= all.length); }
for (const id of ['study-book', 'study-lesson', 'study-pos', 'study-star']) $(id).addEventListener('change', () => { if (id === 'study-book') updateLessonSelect(); studyLimit = 24; renderStudy(); });
let searchTimer; $('study-search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { studyLimit = 24; renderStudy(); }, 160); });
$('show-more').onclick = () => { studyLimit += 24; renderStudy(); };
document.addEventListener('click', ev => { const b = ev.target.closest('[data-speak],[data-star]'); if (!b) return; const w = byId.get(b.dataset.speak || b.dataset.star); if (!w) return; if (b.dataset.speak) speak(w.word + '。' + plain(w.example_ja)); else { wrongIds = wrongIds.includes(w.id) ? wrongIds.filter(x => x !== w.id) : [...wrongIds, w.id]; saveWrong(); b.innerHTML = `${wrongIds.includes(w.id) ? '★' : '☆'} ${T('bookmark')}`; } });

/* ------------------------------------------------------------------ scope */
let selected = new Set(store.get('n1-scope', null) || []);
function renderBookTree() {
  const tree = $('book-tree');
  tree.innerHTML = [1, 2, 3, 4].map(b => { const ls = lessonsOf(b), keys = ls.map(l => `${b}:${l}`), n = keys.filter(k => selected.has(k)).length;
    return `<section class="scope-book ${n ? 'has-selection' : ''}"><label class="scope-book-head"><input type="checkbox" data-book="${b}" ${n === keys.length ? 'checked' : ''}><span class="scope-label">${esc(BOOKS[b][lang])}<small>${data.filter(w => w.book === b).length} ${T('words')}</small></span><span class="scope-selected-count">${n}/${keys.length}</span></label><div class="scope-lessons">${ls.map(l => `<label class="scope-lesson"><input type="checkbox" data-lesson="${b}:${l}" ${selected.has(`${b}:${l}`) ? 'checked' : ''}>${T('lesson')} ${l}<small>${data.filter(w => w.lessons.includes(`${b}:${l}`)).length}</small></label>`).join('')}</div></section>`; }).join('');
  tree.querySelectorAll('input[data-book]').forEach(i => { const ls = lessonsOf(+i.dataset.book), n = ls.filter(l => selected.has(`${i.dataset.book}:${l}`)).length; i.indeterminate = n > 0 && n < ls.length; });
  $('scope-summary').textContent = `${selected.size} ${T('selectedLessons')}`;
  store.set('n1-scope', [...selected]); updateAvailability();
}
$('book-tree').addEventListener('change', e => { const b = e.target.closest('input[data-book]'), l = e.target.closest('input[data-lesson]'); if (b) { for (const x of lessonsOf(+b.dataset.book)) b.checked ? selected.add(`${b.dataset.book}:${x}`) : selected.delete(`${b.dataset.book}:${x}`); } else if (l) { l.checked ? selected.add(l.dataset.lesson) : selected.delete(l.dataset.lesson); } else return; renderBookTree(); });
$('scope-all').onclick = () => { selected = new Set(data.flatMap(w => [`${w.book}:${w.lesson}`])); renderBookTree(); };
$('scope-none').onclick = () => { selected.clear(); renderBookTree(); };

/* ------------------------------------------------------------------ questions */
const can = {reading: w => !!w.qRead, context: w => !!(w.qCtx && w.qCtx.length >= 3), paraphrase: w => !!(w.qPara && w.qPara.length >= 3 && w.synonym_ja), usage: w => !!(w.qUse && w.qUse.length >= 3)};
const eligible = (w, k) => k === 'mix' ? TYPES.some(t => can[t](w)) : can[k](w);
function pool(words, kind) { return (words || data.filter(w => w.lessons.some(x => selected.has(x)))).filter(w => eligible(w, kind)); }
function updateAvailability() { const k = $('quiz-type').value, p = selected.size ? pool(null, k) : []; $('quiz-available').textContent = `${p.length.toLocaleString()} ${T('available')}`; $('quiz-start').disabled = !p.length; }
$('quiz-type').addEventListener('change', updateAvailability);

function makeQuestion(w, kind) {
  let stem = '', options = [], cls = '';
  if (kind === 'reading') { stem = marked(w.example_ja, 'u'); options = [{label: w.qRead.answer, ok: true}, ...w.qRead.opts.map(o => ({label: o.label, trap: o.trap}))]; }
  else if (kind === 'context') { stem = marked(w.example_ja, 'blank'); options = [{label: w.B, ok: true, id: w.id}, ...shuffle(w.qCtx).slice(0, 3)]; }
  else if (kind === 'paraphrase') { stem = marked(w.example_ja, 'u'); const syn = w.synonym_ja.split(/[／/]/)[0].trim(); options = [{label: syn, ok: true, id: w.id}, ...shuffle(w.qPara).slice(0, 3)]; }
  else { stem = `<span lang="ja">${esc(w.word)}</span>`; cls = 'long'; options = [{label: w.example_ja, ok: true, id: w.id}, ...shuffle(w.qUse).slice(0, 3)]; }
  options = shuffle(options);
  if (new Set(options.map(o => plain(o.label))).size !== 4) return null;
  return {w, kind, stem, options, cls, correct: options.findIndex(o => o.ok), selected: null};
}
let queue = [], qi = 0, points = 0, style = 'practice', current = null, answers = [];
function buildQueue(words, kind, count) {
  const ws = shuffle(pool(words, kind)); if (!ws.length) return [];
  const amount = count === 'all' ? ws.length : Math.min(+count, ws.length);
  const out = [], used = new Set();
  if (kind !== 'mix') { for (const w of ws) { const q = makeQuestion(w, kind); if (q) out.push(q); if (out.length >= amount) break; } return out; }
  const total = Object.values(EXAM_SHARE).reduce((a, b) => a + b, 0);
  const target = Object.fromEntries(TYPES.map(t => [t, Math.round(amount * EXAM_SHARE[t] / total)]));
  let diff = amount - Object.values(target).reduce((a, b) => a + b, 0); target.context += diff;
  for (const t of TYPES) { for (const w of ws) { if (out.filter(q => q.kind === t).length >= target[t]) break; if (used.has(w.id) || !can[t](w)) continue; const q = makeQuestion(w, t); if (q) { out.push(q); used.add(w.id); } } }
  for (const w of ws) { if (out.length >= amount) break; if (used.has(w.id)) continue; const t = TYPES.find(t => can[t](w)); const q = t && makeQuestion(w, t); if (q) { out.push(q); used.add(w.id); } }
  return out;
}
function launch(words, kind) {
  kind = kind || $('quiz-type').value;
  let q = buildQueue(words, kind, $('quiz-count').value);
  if (!q.length) { alert(T('noQuiz')); return; }
  if ($('quiz-order').value === 'exam') q.sort((a, b) => TYPES.indexOf(a.kind) - TYPES.indexOf(b.kind)); else q = shuffle(q);
  queue = q; qi = 0; points = 0; answers = []; current = queue[0]; style = $('quiz-style').value;
  $('quiz-setup').classList.add('hidden'); $('quiz-finish').classList.add('hidden'); $('quiz-run').classList.remove('hidden');
  renderQuestion(); $('quiz-run').scrollIntoView({block: 'start', behavior: 'smooth'});
}
$('quiz-start').onclick = () => launch(null);
function renderQuestion() {
  const q = current; if (!q) return;
  $('question-progress').textContent = `${T('question')} ${qi + 1} / ${queue.length}`;
  $('question-score').textContent = style === 'mock' ? `${T('answered')}: ${answers.length}/${queue.length}` : `${T('right')}: ${points}/${answers.length}`;
  $('progress-in').style.width = (qi / queue.length * 100) + '%';
  $('question-kicker').textContent = T(q.kind);
  $('question-instruction').innerHTML = `<span class="ja" lang="ja">${INSTR[q.kind].ja}</span><span class="tr">${esc(INSTR[q.kind][lang])}</span>`;
  $('question-stem').innerHTML = q.stem; $('question-stem').classList.toggle('word-only', q.kind === 'usage');
  $('choices').className = 'choices ' + q.cls;
  $('choices').innerHTML = q.options.map((o, i) => { let c = ''; if (q.selected !== null) { if (style === 'practice') c = i === q.correct ? ' correct' : i === q.selected ? ' wrong' : ''; else if (i === q.selected) c = ' chosen'; }
    return `<button data-choice="${i}" class="choice${c}" ${q.selected !== null ? 'disabled' : ''}><span class="choice-label">${i + 1}</span><span class="choice-text" lang="ja">${q.kind === 'usage' ? marked(o.label, 'u') : esc(o.label)}</span></button>`; }).join('');
  $('question-feedback').classList.add('hidden');
  $('quiz-next').classList.toggle('hidden', q.selected === null);
  $('quiz-next').textContent = qi === queue.length - 1 ? T('quizFinish') : T('quizNext');
}
function optionDetail(q, o, i) {
  const ok = i === q.correct; let d = '';
  if (q.kind === 'reading') d = ok ? `${T('readingOf')}: ${q.w.word}（${q.w.reading}）` : `${T('wrongReading')}${o.trap ? o.trap.split('+').map(k => `<span class="trap">${esc((TRAP[k] || {})[lang] || k)}</span>`).join('') : ''}`;
  else if (q.kind === 'usage') { const src = byId.get(o.id); d = ok ? T('usageRight') : `${T('usageWrong')}: <b lang="ja">${esc(src ? src.word : '')}</b>${src ? `（${esc(src.reading)}）— ${esc(meaning(src))}` : ''}`; }
  else { const src = byId.get(o.id); if (src) d = q.kind === 'paraphrase' && !ok ? `<span lang="ja">${esc(o.label)}</span> ${T('isParaOf')} <b lang="ja">${esc(src.word)}</b>（${esc(src.reading)}）— ${esc(meaning(src))}` : `<b lang="ja">${esc(src.word)}</b>（${esc(src.reading)}）— ${esc(meaning(src))}`; }
  const label = q.kind === 'usage' ? marked(o.label, 'u') : esc(o.label);
  return `<li><b>${i + 1}${ok ? ' ✓' : ''}</b><span><span lang="ja">${label}</span><br>${d}</span></li>`;
}
function feedbackHTML(q) {
  const ok = q.selected === q.correct, w = q.w, o = q.options[q.correct];
  return `<div class="feedback-head ${ok ? 'good' : 'bad'}">${ok ? '✓ ' + T('correct') : '✕ ' + T('incorrect')} ${T('answer')}: ${q.correct + 1}</div>
<div class="feedback-word"><strong lang="ja">${esc(w.word)}（${esc(w.reading)}）</strong> <span class="pill">${esc(posLabel(w))}</span><div>${T('meaning')}: ${esc(meaning(w))}</div><div>${T('explain')}: ${esc(explainOf(w))}</div>${w.synonym_ja ? `<div>${T('synonym')}: <span lang="ja">${esc(w.synonym_ja)}</span></div>` : ''}<div lang="ja" class="example-ja">${marked(w.example_ja, 'mark')}</div><div class="example-trans">${esc(exTrans(w))}</div></div>
<b>${T('explainAll')}</b><ul class="explain-list">${q.options.map((x, i) => optionDetail(q, x, i)).join('')}</ul>`;
}
function renderFeedback() { $('question-feedback').innerHTML = feedbackHTML(current); $('question-feedback').classList.remove('hidden'); }
$('choices').onclick = e => { const b = e.target.closest('[data-choice]'); if (!b || !current || current.selected !== null) return; current.selected = +b.dataset.choice; const ok = current.selected === current.correct; answers.push({q: current, good: ok}); if (ok) points++; else if (!wrongIds.includes(current.w.id)) { wrongIds.push(current.w.id); saveWrong(); } renderQuestion(); if (style === 'practice') renderFeedback(); };
$('quiz-next').onclick = () => { if (!current || current.selected === null) return; if (qi + 1 >= queue.length) { finishQuiz(); return; } qi++; current = queue[qi]; renderQuestion(); $('question-kicker').scrollIntoView({block: 'start', behavior: 'smooth'}); };
document.addEventListener('keydown', e => { if (!current || $('quiz-run').classList.contains('hidden')) return; if (current.selected === null && ['1', '2', '3', '4'].includes(e.key)) { $('choices').querySelector(`[data-choice="${+e.key - 1}"]`)?.click(); } else if (current.selected !== null && e.key === 'Enter') $('quiz-next').click(); });
$('quiz-exit').onclick = () => { $('quiz-run').classList.add('hidden'); $('quiz-setup').classList.remove('hidden'); current = null; updateAvailability(); };
function finishQuiz() { current = null; $('quiz-run').classList.add('hidden'); $('quiz-finish').classList.remove('hidden'); renderFinish(); }
function renderFinish() {
  const p = queue.length ? Math.round(points / queue.length * 100) : 0;
  $('finish-score').textContent = `${points} / ${queue.length}`; $('finish-percent').textContent = p + '%';
  const bad = answers.filter(a => !a.good); $('finish-wrong-count').textContent = bad.length;
  $('finish-bytype').textContent = T('byType') + ': ' + TYPES.filter(t => answers.some(a => a.q.kind === t)).map(t => { const a = answers.filter(x => x.q.kind === t); return `${T(t).split(' · ')[0]} ${a.filter(x => x.good).length}/${a.length}`; }).join(' · ');
  $('finish-comment').textContent = T(p >= 80 ? 'good' : 'other');
  const list = style === 'mock' ? answers : bad;
  $('finish-review').innerHTML = list.length ? `<h3>${T(style === 'mock' ? 'answerReview' : 'wrongReview')}</h3>` + list.map(a => `<details class="review-item"><summary>${a.good ? '✓' : '✕'} <strong lang="ja">${esc(a.q.w.word)}</strong> · ${esc(T(a.q.kind))}</summary><div class="question-stem" lang="ja" style="font-size:18px;min-height:0;margin-top:8px">${a.q.stem}</div><div class="feedback">${feedbackHTML(a.q)}</div></details>`).join('') : '';
}
$('quiz-restart').onclick = () => { $('quiz-finish').classList.add('hidden'); $('quiz-setup').classList.remove('hidden'); updateAvailability(); };
$('go-review').onclick = () => showTab('review');

/* ------------------------------------------------------------------ review */
function renderReview() { const s = new Set(wrongIds), r = data.filter(w => s.has(w.id)); $('review-count').textContent = `${r.length} ${T('words')}`; $('review-list').innerHTML = r.length ? r.map(wordCard).join('') : `<p class="sub">${T('noMistakes')}</p>`; }
$('clear-review').onclick = () => { if (confirm(T('clearConfirm'))) { wrongIds = []; saveWrong(); renderReview(); } };
$('review-retry').onclick = () => { const s = new Set(wrongIds), ws = data.filter(w => s.has(w.id)); if (!ws.length) { alert(T('noMistakes')); return; } showTab('quiz'); launch(ws, 'mix'); };
$('export-csv').onclick = () => { const s = new Set(wrongIds), r = data.filter(w => s.has(w.id)); if (!r.length) return; const q = t => '"' + String(t ?? '').replaceAll('"', '""') + '"';
  const lines = [['word', 'reading', 'meaning_vi', 'meaning_en', 'example_ja', 'book', 'lesson'].join(','), ...r.map(w => [w.word, w.reading, w.meaning_vi, w.meaning_en, plain(w.example_ja), w.book, w.lesson].map(q).join(','))];
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], {type: 'text/csv'})); a.download = 'jlpt-n1-mistakes.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };

/* ------------------------------------------------------------------ boot */
applyTexts();
fetch('data/vocab.csv').then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(text => {
  prepare(parseCSV(text));
  if (!selected.size) selected = new Set([...new Set(data.filter(w => w.book === 1).map(w => `1:${w.lesson}`))]);
  applyTexts();
  $('stat-total').textContent = data.length.toLocaleString('en-US');
  $('stat-lessons').textContent = new Set(data.map(w => w.book + ':' + w.lesson)).size;
  $('stat-questions').textContent = data.reduce((n, w) => n + TYPES.filter(t => can[t](w)).length, 0).toLocaleString('en-US');
  $('loading').classList.add('hidden'); $('panel-study').classList.remove('hidden');
  renderBookTree(); renderStudy();
  window.__N1__ = {data, makeQuestion, buildQueue};
}).catch(err => { $('loading').textContent = T('loadError') + ' (' + err.message + ')'; });
})();
