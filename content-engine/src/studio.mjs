// The locked DH / Studio carousel pipeline, end to end, for every case in cases/studio.json.
//
//   npm run studio [-- <id> ...] [--export <dir>]
//
// Per case: SOURCE → SPEC (adapter) → RENDER (build) → QA GATE (qa.mjs). Only cases that pass the
// gate are exported (4:5 slides + story maps as JPG, named <id>-<file>.jpg) to --export, which is
// the wizard's Case Study Carousel bundle. A case that fails the gate is reported and left out.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const exportDir = args.includes('--export') ? resolve(args[args.indexOf('--export') + 1]) : null;
const only = args.filter((a, n) => a !== '--export' && args[n - 1] !== '--export');
const { cases } = JSON.parse(readFileSync(join(root, 'cases/studio.json'), 'utf8'));
const node = (script, ...a) => execFileSync(process.execPath, [join(root, 'src', script), ...a], { cwd: root, stdio: 'pipe' }).toString();

const report = [];
for (const c of cases.filter((x) => !only.length || only.includes(x.id))) {
  const row = { id: c.id, variant: c.variant, slides: 0, qa: 'not run' };
  try {
    if (c.mode === 'page') node('from-page.mjs', c.url, c.id);
    if (c.mode === 'draft') node('from-draft.mjs', `specs/${c.id}.json`);
    node('build.mjs', `cases/${c.id}.json`);
    row.slides = readdirSync(join(root, 'output', c.id)).filter((f) => /^carousel-.*\.png$/.test(f)).length;
    try { node('qa.mjs', `cases/${c.id}.json`); row.qa = 'PASS'; }
    catch (e) { row.qa = 'BLOCKED'; row.why = e.stdout.toString().split('\n').filter((l) => l.startsWith('FAIL')).slice(0, 4); }
  } catch (e) { row.qa = 'ERROR'; row.why = [String(e.stderr ?? e.message).split('\n').filter(Boolean).slice(-2).join(' ')]; }
  report.push(row);
  console.log(`${row.qa.padEnd(8)} ${c.id.padEnd(16)} ${c.variant.padEnd(12)} ${row.slides} slides`);
  for (const w of row.why ?? []) console.log(`         ${w}`);
}

if (exportDir) {
  mkdirSync(exportDir, { recursive: true });
  for (const r of report.filter((x) => x.qa === 'PASS')) {
    for (const f of readdirSync(exportDir).filter((f) => f.startsWith(`${r.id}-`))) rmSync(join(exportDir, f));
    for (const f of readdirSync(join(root, 'output', r.id)).filter((f) => /^(carousel|map)-.*\.png$/.test(f)))
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', join(root, 'output', r.id, f), '--out', join(exportDir, `${r.id}-${f.replace(/\.png$/, '.jpg')}`)], { stdio: 'ignore' });
  }
  console.log(`exported ${report.filter((x) => x.qa === 'PASS').length} passing case(s) to ${exportDir}`);
}
process.exit(report.every((r) => r.qa === 'PASS') ? 0 : 1);
