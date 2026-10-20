// Repurpose every live case study page in one go.
//
//   node src/bulk.mjs <url> [<url> ...]
//
// For each page: from-page.mjs writes cases/<id>.json from the live page, then build.mjs
// renders it into output/<id>/. A case file that was tuned by hand (cases/steelcon.json) is
// never overwritten: list it with --keep <id> and it is only rebuilt.
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const keep = new Set(args.flatMap((a, n) => (args[n - 1] === '--keep' ? [a] : [])));
const urls = args.filter((a, n) => a !== '--keep' && args[n - 1] !== '--keep');
const run = (script, ...a) => execFileSync(process.execPath, [resolve(root, 'src', script), ...a], { stdio: 'inherit', cwd: root });

const failed = [];
for (const url of urls) {
  const id = new URL(url).pathname.split('/').filter(Boolean).pop();
  console.log(`\n=== ${id}`);
  try {
    if (!keep.has(id)) run('from-page.mjs', url, id);
    run('build.mjs', `cases/${id}.json`);
  } catch {
    failed.push(id);
  }
}
for (const id of keep) if (!urls.some((u) => u.endsWith(`/${id}`))) run('build.mjs', `cases/${id}.json`);
if (failed.length) {
  console.error(`\nfailed: ${failed.join(', ')}`);
  process.exit(1);
}
