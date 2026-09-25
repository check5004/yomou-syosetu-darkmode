/**
 * Store screenshot prototypes made from independently authored, fictional pages.
 * No downloaded site HTML, CSS, images, advertisements, or novel text is used.
 * The site's class names are compatibility hooks for the actual extension CSS.
 * These are explicitly labelled demos, not captures of the production website.
 *
 * Requires Playwright and an installed Chrome/Edge. No browser is downloaded.
 * Optional environment: PLAYWRIGHT_MODULE_PATH, CHROME_PATH.
 * Run: node scripts/store-screenshots.mjs
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'assets/store/screenshots');
const require = createRequire(import.meta.url);
let playwright;
for (const candidate of [process.env.PLAYWRIGHT_MODULE_PATH, 'playwright', path.join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')].filter(Boolean)) {
  try { playwright = require(candidate); break; } catch { /* Try next local installation. */ }
}
assert(playwright, 'Install Playwright or set PLAYWRIGHT_MODULE_PATH to an existing installation.');
let executablePath;
for (const candidate of [process.env.CHROME_PATH,
  process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe'),
  process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft/Edge/Application/msedge.exe'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean)) {
  try { await access(candidate); executablePath = candidate; break; } catch { /* Try next browser. */ }
}
assert(executablePath, 'Set CHROME_PATH to an installed Chrome or Edge executable.');
const theme = await readFile(path.join(root, 'extension/theme.css'), 'utf8');
const settingsScript = await readFile(path.join(root, 'extension/settings.js'), 'utf8');
const contentScript = await readFile(path.join(root, 'extension/content.js'), 'utf8');

// Original prose, titles, author name, counts and dates created for these demos.
const title = '星をしまう小さな図書館';
const author = '灯台しおり（架空）';
const paragraphs = [
  '　閉館の鐘が鳴ると、図書館の窓辺に小さな光が集まりはじめた。司書のミナは机の引き出しから、空っぽのしおりを一枚取り出した。',
  '「今夜は、どんな物語を運んできたの？」',
  '　光は返事のかわりに、青い本の上でくるりと回った。表紙を開くと、まだ誰も歩いたことのない道が、白いページの向こうへ続いている。',
  '　ミナは読みかけの場所にしおりを置いた。遠くの町では、もう眠りについた人たちがいる。その夢に間に合うように、一行ずつ声にして読んでいく。',
  '　夜は静かに深まり、図書館には新しい一頁をめくる音だけが残った。',
];
const entries = [
  [title, '忘れられた星を、本の中へ。夜だけ開く図書館で始まる、小さな出会いの物語。', 'ファンタジー', '全12話'],
  ['雨上がりの郵便飛行船', '雲の切れ間を旅する配達人が届けるのは、宛名のない一通の手紙だった。', '冒険', '全8話'],
  ['月曜日の喫茶室と秘密の地図', 'いつもの席に残された一枚の地図から、静かな町の探検が始まる。', '日常', '全6話'],
];

// Independently designed demonstration layout. Variables/classes intentionally
// exercise the extension's compatibility rules, without reproducing site CSS.
const demoCss = `
  :root { --color-text:#303846; --color-text--sub:#697485; --color-link:#386386; --color-bg:#fcfcfa; --color-ui-border:#d9dee5; --color-ui-bg:#f2f4f6; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--color-bg); color:var(--color-text); font-family:"Yu Gothic UI","Yu Gothic",Meiryo,sans-serif; font-size:16px; }
  a { color:var(--color-link); text-decoration:none; }
  .p-header__body { display:flex; align-items:center; justify-content:space-between; padding:15px 23px; background:#edf0f3; border-bottom:1px solid var(--color-ui-border); font-size:13px; }
  .p-header__body strong { font-size:15px; font-weight:600; letter-spacing:.08em; }
  .p-header__body span { color:var(--color-text--sub); }
  main { padding:25px 30px; }
  .p-novel__title { font-size:23px; font-weight:600; line-height:1.5; margin:0 0 10px; letter-spacing:.03em; }
  .p-novel__author { font-size:13px; margin:0 0 18px; color:var(--color-text--sub); }
  .p-novel__number { display:block; font-size:12px; color:var(--color-text--sub); padding:15px 0; border-top:1px solid var(--color-ui-border); }
  .p-novel__text { font-size:17px; line-height:2.0; }
  .p-novel__text p { margin:0 0 1.0em; }
  .p-novel__summary { font-size:15px; line-height:1.9; margin:20px 0; }
  .p-eplist__chapter-title { font-size:15px; margin:25px 0 5px; }
  .p-eplist__sublist { display:flex; flex-direction:column; gap:6px; padding:15px 0; border-bottom:1px solid var(--color-ui-border); font-size:15px; }
  .p-eplist__update { font-size:12px; color:var(--color-text--sub); }
  .page-title { font-size:22px; margin:0 0 7px; }
  .subtitle { margin:0 0 18px; font-size:13px; color:var(--color-text--sub); }
  .c-tabnav-1st__current { display:inline-block; border-bottom:2px solid #557290; padding:9px 0; margin-bottom:10px; font-size:13px; }
  .c-card,.searchkekka_box { border:1px solid var(--color-ui-border); padding:16px; margin-bottom:13px; border-radius:7px; background:#f2f4f6; }
  .c-card h2,.searchkekka_box h2 { font-size:17px; font-weight:600; margin:9px 0; line-height:1.55; }
  .p-ranklist-item__points { font-size:13px; color:#96733c; }
  .p-ranklist-item__detail,.searchdate_box { font-size:12px; line-height:1.8; color:var(--color-text--sub); }
  .description { font-size:14px; line-height:1.8; margin:10px 0; }
  .search_box { display:flex; gap:9px; margin:16px 0; padding:10px; border:1px solid var(--color-ui-border); border-radius:7px; background:#f2f4f6; }
  input { width:100%; min-width:0; border:1px solid #c3cbd6; border-radius:4px; font:inherit; padding:8px; background:white; }
  button { border:1px solid #c3cbd6; border-radius:4px; white-space:nowrap; font:inherit; padding:7px 10px; }
  .search_description { font-size:12px; margin:16px 0; color:var(--color-text--sub); }
  .compact main { padding:21px; }
  .compact .p-novel__title { font-size:21px; }
  .compact .p-novel__text { font-size:16px; line-height:2; }
`;
function fixture(kind, compact = false) {
  let body;
  if (kind === 'reader') body = `<main class="p-novel"><h1 class="p-novel__title">${title}</h1><p class="p-novel__author">作者：${author}</p><span class="p-novel__number">第1話　夜に届いたしおり</span><div class="p-novel__text">${(compact ? paragraphs.slice(0, 3) : paragraphs).map(p => `<p>${p}</p>`).join('')}</div></main>`;
  if (kind === 'ranking') body = `<main><h1 class="page-title">ランキング</h1><p class="subtitle">架空の作品で表示を確認</p><span class="c-tabnav-1st__current">日間・総合</span>${entries.slice(0, 2).map(([name, summary, genre, count], i) => `<article class="c-card"><span class="p-ranklist-item__points">${i + 1} 位</span><h2><a href="#fiction-${i}">${name}</a></h2><div class="p-ranklist-item__detail">${author} ／ ${genre} ／ ${count}</div>${i === 0 ? `<p class="description">${summary}</p>` : ''}</article>`).join('')}</main>`;
  if (kind === 'search') body = `<main class="c-trad-contents"><h1 class="page-title">小説を探す</h1><p class="subtitle">キーワードで作品を検索</p><div class="search_box"><input aria-label="検索ワード" value="図書館"><button class="btn-search">検索</button></div><p class="search_description">検索結果 2 件（架空データ）</p>${[entries[0], ['夜明け前の図書館便り', '一冊の本に挟まれた手紙が、知らない誰かの明日を少しずつ変えていく。', '日常', '全5話']].map(([name, summary, genre, count], i) => `<article class="searchkekka_box"><h2><a href="#fiction-${i}">${name}</a></h2><div class="searchdate_box">${author} ／ ${genre} ／ ${count}</div>${i === 0 ? `<p class="description">${summary}</p>` : ''}</article>`).join('')}</main>`;
  if (kind === 'toc') body = `<main class="p-novel"><h1 class="p-novel__title">${title}</h1><p class="p-novel__author">作者：${author}</p><p class="p-novel__summary">${entries[0][1]}</p><div class="p-eplist"><h2 class="p-eplist__chapter-title">第一章　閉館のあとで</h2>${['夜に届いたしおり','窓辺の小さな光','青い本の向こう側','星をしまう仕事'].map((name, i) => `<div class="p-eplist__sublist"><a href="#chapter-${i}">第${i + 1}話　${name}</a><time class="p-eplist__update">2026/09/${String(i + 1).padStart(2, '0')} 20:00</time></div>`).join('')}</div></main>`;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>${demoCss}</style></head><body class="${compact ? 'compact' : ''}"><header class="p-header__body"><strong>読書画面のサンプル</strong><span>架空デモ</span></header>${body}</body></html>`;
}
const shellCss = `
  * { box-sizing:border-box; }
  html,body { margin:0; width:1280px; height:800px; overflow:hidden; }
  body { font-family:"Yu Gothic UI","Yu Gothic",Meiryo,sans-serif; background:#e8eee9; color:#182b31; }
  header { padding:34px 44px 0; height:141px; position:relative; }
  .brand { font-size:14px; font-weight:600; letter-spacing:.13em; color:#4a6465; margin:0 0 11px; }
  h1 { margin:0; font-size:32px; font-weight:650; line-height:1.45; letter-spacing:.02em; }
  .badge { position:absolute; right:44px; top:47px; font-size:13px; font-weight:600; padding:9px 15px; border:1px solid #aabdb4; border-radius:50px; color:#365851; }
  .columns { display:flex; gap:22px; padding:0 44px; height:588px; }
  .panel { flex:1; min-width:0; }
  .label { display:flex; align-items:center; justify-content:space-between; height:37px; color:#2d4a46; font-size:15px; font-weight:650; }
  .label span { font-weight:400; font-size:12px; color:#526b65; }
  iframe { display:block; width:100%; height:551px; border:1px solid #abbab5; border-radius:12px; overflow:hidden; background:#fcfcfa; box-shadow:0 8px 20px #19382c0b; }
  footer { position:absolute; bottom:0; height:54px; left:44px; right:44px; color:#547069; font-size:12px; display:flex; align-items:center; }
  .settings .reader { flex:1; }
  .settings-screen header { height:119px; }
  .settings .popup { flex:0 0 362px; }
  .settings .popup iframe { height:600px; border-radius:12px; }
  .settings .popup .label { height:29px; }
  .settings .reader iframe { height:588px; }
  .popups-only { justify-content:space-between; }
  .popups-only .popup { flex:0 0 362px; }
`;
const legal = '動作検証用の架空デモ画面です。作品・著者・本文・数値は架空です。対象サイトの実際の表示とは異なります。';
const configs = [
  { file: '01-light-dark.png', heading: 'ライトからダークへ。物語の続きを、心地よく。', badge:'表示モード', panels: [
    { label:'オフ（ライト）', note:'拡張機能による配色変更なし', kind:'reader', mode:'light' },
    { label:'ダーク', note:'「夜」の配色', kind:'reader', mode:'dark', palette:'night' },
  ]},
  { file: '02-three-palettes.png', heading: '夜の色は、3つから。', badge:'配色の切り替え', panels: [
    { label:'夜', note:'落ち着いた青み', kind:'reader', palette:'night', compact:true },
    { label:'漆黒', note:'黒を基調に', kind:'reader', palette:'ink', compact:true },
    { label:'暖色', note:'あたたかい茶系', kind:'reader', palette:'warm', compact:true },
  ]},
  { file: '03-supported-pages.png', heading: '探すときも、読み進めるときも。', badge:'対応ページの表示例', panels: [
    { label:'ランキング', note:'作品の一覧', kind:'ranking', compact:true },
    { label:'検索', note:'フォーム・検索結果', kind:'search', compact:true },
    { label:'小説の目次', note:'あらすじ・各話の一覧', kind:'toc', compact:true },
  ]},
  { file: '04-reader-settings.png', heading: '配色も、文字サイズも、行間も。', badge:'実際の設定画面', className:'settings', panels: [
    { label:'本文の読みやすさを調整', note:'暖色・20 px・行間 2.2 倍', kind:'reader', palette:'warm', customReader:true, fontSize:20, lineHeight:2.2 },
    { label:'拡張機能のポップアップ', kind:'popup', palette:'warm', customReader:true, fontSize:20, lineHeight:2.2 },
  ]},
  { file: '05-actual-settings-only.png', heading: '気分に合わせて、夜の色を選ぶ。', badge:'実際の設定画面', className:'popups-only', panels: [
    { label:'夜', kind:'popup', palette:'night' },
    { label:'漆黒', kind:'popup', palette:'ink' },
    { label:'暖色', kind:'popup', palette:'warm' },
  ]},
];
const popupFiles = new Map(['popup.html', 'popup.css', 'popup.js', 'settings.js', 'icons/app-icon-128.png'].map(name => [`/extension/${name}`, name]));
const server = createServer(async (request, response) => {
  const file = popupFiles.get(request.url);
  if (!file) { response.writeHead(404).end(); return; }
  try {
    const bytes = await readFile(path.join(root, 'extension', file));
    response.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'image/png');
    response.end(bytes);
  } catch { response.writeHead(500).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir(output, { recursive:true });
const browser = await playwright.chromium.launch({ executablePath, headless:true });
const report = [];
try {
  const page = await browser.newPage({ viewport:{ width:1280, height:800 }, deviceScaleFactor:1 });
  const blockedRequests = [];
  await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : (blockedRequests.push(route.request().url()), route.abort()));
  await page.addInitScript(() => {
    const current = { mode:'dark', palette:'night', customReader:false, fontSize:18, lineHeight:2 };
    const localData = { yomouDarkSettings:current };
    globalThis.chrome = { storage:{ local:{ get:async key => ({ [key]:localData[key] }), set:async next => Object.assign(localData, next) }, onChanged:{ addListener() {} } } };
  });
  for (const config of configs) {
    const panels = config.panels.map((panel, index) => `<section class="panel ${panel.kind === 'popup' ? 'popup' : 'reader'}"><div class="label">${panel.label}${panel.note ? `<span>${panel.note}</span>` : ''}</div><iframe name="demo-${index}" title="${panel.label}" ${panel.kind === 'popup' ? `src="${origin}/extension/popup.html"` : ''}></iframe></section>`).join('');
    const footer = config.className === 'popups-only' ? '拡張機能の実際の設定画面を、3つの配色で表示しています。プレビュー内の文章はオリジナルのサンプルです。' : legal;
    await page.setContent(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>${shellCss}</style></head><body class="${config.className ? `${config.className}-screen` : ''}"><header><p class="brand">読もう、夜。 / 小説を読もう！向け 非公式ダークモード拡張</p><h1>${config.heading}</h1><span class="badge">${config.badge}</span></header><div class="columns ${config.className || ''}">${panels}</div><footer>${footer}</footer></body></html>`);
    const checks = [];
    for (const [index, panel] of config.panels.entries()) {
      const frame = page.frame({ name:`demo-${index}` });
      assert(frame);
      if (panel.kind === 'popup') {
        await frame.waitForFunction(() => !document.getElementById('settings-controls')?.disabled);
        await frame.locator(`input[name="palette"][value="${panel.palette}"]`).check();
        if (panel.customReader) {
          await frame.locator('#custom-reader').check();
          await frame.locator('#font-size').fill(String(panel.fontSize));
          await frame.locator('#font-size').dispatchEvent('input');
          await frame.locator('#line-height').fill(String(panel.lineHeight));
          await frame.locator('#line-height').dispatchEvent('input');
        }
        await frame.waitForFunction(() => !document.getElementById('save-status').textContent.includes('しています'));
        assert.equal(await frame.locator('input[name="palette"]:checked').inputValue(), panel.palette);
        assert.equal(await frame.locator('#font-size-output').textContent(), `${panel.fontSize || 18} px`);
        const bounds = await frame.evaluate(() => ({ height:document.body.scrollHeight, width:document.body.scrollWidth }));
        const available = config.className === 'settings' ? 588 : 551;
        const scale = Math.min(1, available / (bounds.height + 2));
        await page.locator(`iframe[name="demo-${index}"]`).evaluate((el, { height, scale }) => {
          el.style.width = '362px';
          el.style.height = `${height + 2}px`;
          el.style.transform = `scale(${scale})`;
          el.style.transformOrigin = 'top left';
          el.style.position = 'relative';
          el.style.left = `${(362 - 362 * scale) / 2}px`;
        }, { height:bounds.height, scale });
        const fit = await frame.evaluate(() => document.body.scrollHeight <= innerHeight && document.body.scrollWidth <= innerWidth);
        assert(fit, 'Production popup must be completely visible.');
        checks.push({ kind:'popup', productionHtml:true, selectedPalette:panel.palette, fontSize:`${panel.fontSize || 18} px`, uniformScale:scale, ...bounds });
        continue;
      }
      await frame.setContent(fixture(panel.kind, panel.compact));
      await frame.addStyleTag({ content:theme });
      await frame.evaluate(saved => {
        globalThis.chrome = { storage:{ local:{ get:async key => ({ [key]:saved }) }, onChanged:{ addListener() {} } } };
      }, { mode:panel.mode || 'dark', palette:panel.palette || 'night', customReader:panel.customReader || false, fontSize:panel.fontSize || 18, lineHeight:panel.lineHeight || 2 });
      await frame.addScriptTag({ content:settingsScript });
      await frame.addScriptTag({ content:contentScript });
      await frame.waitForFunction(expected => (document.documentElement.dataset.yomouDark === 'on') === expected, panel.mode !== 'light');
      const actual = await frame.evaluate(() => ({
        palette:document.documentElement.dataset.yomouPalette || null,
        background:getComputedStyle(document.body).backgroundColor,
        text:getComputedStyle(document.body).color,
        font:getComputedStyle(document.body).fontFamily,
        readerSize:document.querySelector('.p-novel__text') && getComputedStyle(document.querySelector('.p-novel__text')).fontSize,
        width:document.documentElement.scrollWidth,
        viewport:innerWidth,
      }));
      assert.equal(actual.width, actual.viewport, 'Demo must have no horizontal overflow.');
      if (panel.customReader) assert.equal(actual.readerSize, `${panel.fontSize}px`);
      checks.push({ kind:panel.kind, mode:panel.mode || 'dark', ...actual });
    }
    await page.evaluate(() => document.fonts.ready);
    for (const frame of page.frames()) await frame.evaluate(() => document.fonts.ready);
    await page.screenshot({ path:path.join(output, config.file), type:'png' });
    // The PNG IHDR gives output dimensions without adding an image library.
    const png = await readFile(path.join(output, config.file));
    assert.equal(png.readUInt32BE(16), 1280);
    assert.equal(png.readUInt32BE(20), 800);
    report.push({ file:config.file, width:1280, height:800, bytes:png.length, checks });
  }
  assert.equal(blockedRequests.length, 0, 'No remote content should be requested.');
  await writeFile(path.join(output, 'verification.json'), `${JSON.stringify({ disclaimer:legal, source:'Original fictional fixtures + unmodified extension theme.css, settings.js, content.js and popup files. Chrome storage is mocked locally; no original site HTML/CSS/assets are used.', externalRequests:blockedRequests, screenshots:report }, null, 2)}\n`);
  console.log(JSON.stringify(report.map(({ file, width, height, bytes }) => ({ file, width, height, bytes })), null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
