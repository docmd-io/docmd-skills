#!/usr/bin/env node
// docmd-skills CLI — install / update / info / uninstall / release helpers
// Cross-platform Node script, no external dependencies.

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const VERSION_FILE = '.docmd-skills-version';
const SKILL_FILES = ['SKILL.md', 'references'];
const DEFAULT_TARGET = './docmd-skills';
const BUMP_TYPES = ['patch', 'minor', 'major'];

// ---- helpers ----------------------------------------------------------------

async function readPkg() {
  const raw = await fs.readFile(path.join(PKG_ROOT, 'package.json'), 'utf8');
  return JSON.parse(raw);
}

async function getVersion() {
  const pkg = await readPkg();
  return pkg.version;
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else {
      await fs.copyFile(s, d);
    }
  }
}

async function copySkillFiles(dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const f of SKILL_FILES) {
    const src = path.join(PKG_ROOT, f);
    const dst = path.join(dest, f);
    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      await copyDir(src, dst);
    } else {
      await fs.copyFile(src, dst);
    }
  }
}

function resolveTarget(argTarget) {
  return path.resolve(
    argTarget || process.env.DOCMD_SKILLS_DIR || DEFAULT_TARGET
  );
}

function printHelp(version) {
  console.log(`docmd-skills v${version}

Usage:
  docmd-skills install [target]      Install skill files (default: ./docmd-skills)
  docmd-skills update [target]       Update an existing install
  docmd-skills info [target]         Show version info for an install
  docmd-skills uninstall [target]    Remove an install

Maintainer:
  docmd-skills --release <patch|minor|major>   Bump version, publish to npm, push tag
  docmd-skills --pre-publish                   Validate package before publish
  docmd-skills --self-test                     Smoke-test the CLI itself

Options:
  -h, --help                         Show this help
  -v, --version                      Show package version
`);
}

function getLatestNpmVersion() {
  try {
    const out = execSync('npm view docmd-skills version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim();
  } catch {
    return null; // not published yet, or network error
  }
}

// ---- commands ---------------------------------------------------------------

async function cmdInstall(targetArg) {
  const version = await getVersion();
  const target = resolveTarget(targetArg);
  const skillMarker = path.join(target, 'SKILL.md');

  if (existsSync(skillMarker)) {
    console.log(`Existing skill found at ${target}. Use 'update' to upgrade.`);
  }

  await copySkillFiles(target);
  await fs.writeFile(path.join(target, VERSION_FILE), `${version}\n`);

  console.log(`Installed docmd-skills v${version} to ${target}`);
  console.log(`\nNext steps:`);
  console.log(`  - Point your agent at: ${path.join(target, 'SKILL.md')}`);
  console.log(`  - Or use the MCP server: npx @docmd/core mcp`);
  console.log(`  - See full reference files in: ${path.join(target, 'references')}`);
}

async function cmdUpdate(targetArg) {
  const version = await getVersion();
  const target = resolveTarget(targetArg);
  const versionFile = path.join(target, VERSION_FILE);

  if (!existsSync(path.join(target, 'SKILL.md'))) {
    console.error(`No existing skill at ${target}. Run 'install' first.`);
    process.exit(1);
  }

  let oldVersion = 'unknown';
  if (existsSync(versionFile)) {
    oldVersion = (await fs.readFile(versionFile, 'utf8')).trim();
  }

  console.log(`Updating from v${oldVersion} to v${version}`);
  await copySkillFiles(target);
  await fs.writeFile(versionFile, `${version}\n`);
  console.log(`Done. Skill at ${target} is now v${version}.`);
}

async function cmdInfo(targetArg) {
  const version = await getVersion();
  console.log(`docmd-skills v${version}`);
  console.log(`  Package location: ${PKG_ROOT}`);

  const target = resolveTarget(targetArg);
  const versionFile = path.join(target, VERSION_FILE);
  const installedMarker = path.join(target, 'SKILL.md');

  if (existsSync(installedMarker)) {
    let installed = 'unknown';
    if (existsSync(versionFile)) {
      installed = (await fs.readFile(versionFile, 'utf8')).trim();
    }
    console.log(`  Installed at:     ${target}`);
    console.log(`  Installed version: ${installed}`);
    if (installed !== version) {
      console.log(`  → Run 'docmd-skills update' to upgrade.`);
    }
  } else {
    console.log(`  No install found at ${target}.`);
    console.log(`  → Run 'docmd-skills install' to set up.`);
  }

  const latest = getLatestNpmVersion();
  if (latest) {
    console.log(`  Latest on npm:    ${latest}`);
    if (latest !== version) {
      console.log(`  → Run 'npm install -g docmd-skills@latest' to upgrade the package itself.`);
    }
  }
}

async function cmdUninstall(targetArg) {
  const target = resolveTarget(targetArg);
  if (!existsSync(target)) {
    console.log(`Nothing to remove at ${target}.`);
    return;
  }
  await fs.rm(target, { recursive: true, force: true });
  console.log(`Removed ${target}`);
}

async function cmdPrePublish() {
  const pkg = await readPkg();
  const required = ['name', 'version', 'description', 'license', 'bin', 'files'];
  const missing = required.filter((k) => !pkg[k]);
  if (missing.length) {
    console.error(`package.json missing required fields: ${missing.join(', ')}`);
    process.exit(1);
  }
  for (const f of pkg.files) {
    const p = path.join(PKG_ROOT, f);
    if (!existsSync(p)) {
      console.error(`Declared file/dir missing: ${f} (looked at ${p})`);
      process.exit(1);
    }
  }
  const binEntry = Object.values(pkg.bin)[0];
  if (!binEntry) {
    console.error('package.json bin map is empty.');
    process.exit(1);
  }
  const binPath = path.join(PKG_ROOT, binEntry);
  if (!existsSync(binPath)) {
    console.error(`Bin entry missing: ${binEntry}`);
    process.exit(1);
  }
  console.log(`Pre-publish check passed. Package ${pkg.name}@${pkg.version} ready.`);
}

async function cmdSelfTest() {
  const version = await getVersion();
  console.log(`docmd-skills v${version}`);

  // Smoke-test the helpers without touching real install targets
  const tmp = path.join(PKG_ROOT, '.self-test-tmp');
  try {
    await copySkillFiles(tmp);
    const copied = existsSync(path.join(tmp, 'SKILL.md'));
    if (!copied) throw new Error('SKILL.md not copied');
    console.log('  copySkillFiles: OK');
  } finally {
    if (existsSync(tmp)) await fs.rm(tmp, { recursive: true, force: true });
  }
  await cmdPrePublish();
  console.log('Self-test passed.');
}

async function cmdRelease(bumpType) {
  if (!BUMP_TYPES.includes(bumpType)) {
    console.error(`Invalid bump type: ${bumpType}. Use patch | minor | major.`);
    process.exit(1);
  }

  // 1. Validate
  await cmdPrePublish();

  // 2. Check working tree is clean
  let status = '';
  try {
    status = execSync('git status --porcelain', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    console.error('Not a git repository. Run this from the docmd-skills repo root.');
    process.exit(1);
  }
  if (status) {
    console.error('Working tree is dirty. Commit or stash your changes first.');
    console.error(status);
    process.exit(1);
  }

  // 3. Bump version
  console.log(`Bumping version (${bumpType})...`);
  execSync(`npm version ${bumpType}`, { stdio: 'inherit' });

  // 4. Publish
  console.log('Publishing to npm...');
  execSync('npm publish', { stdio: 'inherit' });

  // 5. Push tags
  console.log('Pushing tags...');
  execSync('git push --follow-tags', { stdio: 'inherit' });

  console.log('Release complete.');
}

// ---- entry point ------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const version = await getVersion();

  // Flags first
  if (args.includes('-h') || args.includes('--help')) {
    printHelp(version);
    return;
  }
  if (args.includes('-v') || args.includes('--version')) {
    console.log(version);
    return;
  }

  const cmd = args[0];
  const arg = args[1];

  switch (cmd) {
    case 'install':
      await cmdInstall(arg);
      return;
    case 'update':
      await cmdUpdate(arg);
      return;
    case 'info':
      await cmdInfo(arg);
      return;
    case 'uninstall':
    case 'remove':
      await cmdUninstall(arg);
      return;
    case '--pre-publish':
      await cmdPrePublish();
      return;
    case '--self-test':
      await cmdSelfTest();
      return;
    case '--release':
      await cmdRelease(arg);
      return;
    default:
      printHelp(version);
      if (cmd && !cmd.startsWith('-')) {
        console.error(`\nUnknown command: ${cmd}`);
        process.exit(1);
      }
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});