// Nuxt SSR smoke test: installs the packed library (run `npm run build` first) into tests/nuxt-ssr,
// builds the Nuxt app, starts its production server and checks the server-rendered HTML.
// Node has no window/document, so a component touching them during setup makes the render fail.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fixture = join(root, 'tests/nuxt-ssr');
const port = Number(process.env.SSR_SMOKE_PORT ?? 3210);

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

if (!existsSync(join(root, 'dist/package.json'))) {
  console.error('dist/ not found: run `npm run build` first.');
  process.exit(1);
}

const packDir = mkdtempSync(join(tmpdir(), 'tedi-vue-pack-'));
// --ignore-scripts: dist/package.json is a copy of the root one, whose `prepare` (husky) must not run here.
const [{ filename: tarball }] = JSON.parse(
  execFileSync('npm', ['pack', '--pack-destination', packDir, '--ignore-scripts', '--json'], {
    cwd: join(root, 'dist'),
    encoding: 'utf8',
  }),
);

run('npm', ['install', '--no-audit', '--no-fund', '--no-save', join(packDir, tarball)], fixture);
run('npm', ['run', 'build'], fixture);

const server = spawn('node', ['.output/server/index.mjs'], {
  cwd: fixture,
  env: { ...process.env, PORT: String(port), NITRO_PORT: String(port) },
});
let serverLog = '';
server.stdout.on('data', (chunk) => (serverLog += chunk));
server.stderr.on('data', (chunk) => (serverLog += chunk));

const fetchPage = async (headers = {}) => {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      return await fetch(`http://127.0.0.1:${port}/`, { headers });
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error('Nuxt server did not start');
};

const failures = [];
try {
  const response = await fetchPage();
  const html = await response.text();

  if (response.status !== 200) failures.push(`expected HTTP 200, got ${response.status}`);
  const expectations = {
    'decorative icon rendered': /<[^>]*data-ssr-smoke="decorative"[^>]*>/,
    'decorative icon is aria-hidden':
      /<[^>]*data-ssr-smoke="decorative"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-ssr-smoke="decorative"/,
    'labelled icon has role="img"':
      /<[^>]*data-ssr-smoke="labelled"[^>]*role="img"|role="img"[^>]*data-ssr-smoke="labelled"/,
    'labelled icon has aria-label': /aria-label="Information"/,
    'tedi-icon class rendered': /class="[^"]*tedi-icon/,
  };
  for (const [name, pattern] of Object.entries(expectations)) {
    if (!pattern.test(html)) failures.push(`missing: ${name}`);
  }

  // The server does not know the viewport: no breakpoint, values resolve to xs.
  if (!/data-ssr-smoke="breakpoint">none small</.test(html)) {
    failures.push('missing: breakpoint undefined and xs value on the server');
  }

  // createTedi is installed per request from the tedi-lang cookie (tests/nuxt-ssr/app/plugins/tedi.ts).
  if (!/<span lang="et" data-ssr-smoke="label">Sulge<\/span>/.test(html)) {
    failures.push('missing: Estonian label without the tedi-lang cookie');
  }
  const english = await (await fetchPage({ cookie: 'tedi-lang=en' })).text();
  if (!/<span lang="en" data-ssr-smoke="label">Close<\/span>/.test(english)) {
    failures.push('missing: English label with tedi-lang=en');
  }
  // A request after the English one must not inherit its locale (no module-level state).
  const again = await (await fetchPage()).text();
  if (!/data-ssr-smoke="label">Sulge</.test(again)) {
    failures.push('locale leaked between requests');
  }
  if (/(window|document) is not defined/.test(serverLog)) {
    failures.push('server log shows window/document access during SSR');
  }
} finally {
  server.kill();
}

if (failures.length) {
  console.error(`SSR smoke test failed:\n- ${failures.join('\n- ')}\n\nServer log:\n${serverLog}`);
  process.exit(1);
}
console.log('SSR smoke test passed');
