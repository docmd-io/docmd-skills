#!/usr/bin/env node
// docmd-skills CLI — installs the modular docmd agent skills (user / dev / writer).
// Cross-platform Node script, no external dependencies.

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const SKILLS_ROOT = path.join(PKG_ROOT, 'skills');
const SKILL_NAMES = ['docmd-skills', 'docmd-dev', 'docmd-writer'];
const DEFAULT_TARGET = './docmd-skills';
const VERSION_FILE = '.docmd-skills-version';

// ---- helpers ----------------------------------------------------------------

async function readPkg() {
  const raw = await fs.readFile(path.join(PKG_ROOT, 'package.json'), 'utf8');
  return JSON.parse(raw);
}

async function getVersion() {
  return (await readPkg()).version;
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

function resolveTarget(argTarget) {
  return path.resolve(argTarget || DEFAULT_TARGET);
}

function printHelp(version) {
  console.log(`docmd-skills v${version}

Installs AI agent skills for docmd (the zero-config documentation engine).

Available skills:
  docmd-skills/    Use when building, configuring, or operating a docmd site
  docmd-dev/       Use when contributing to the docmd framework in its monorepo
  docmd-writer/    Use when writing or reviewing the prose inside a docmd site

Usage:
  docmd-skills [dir]                  Install
  docmd-skills dev [dir]              Add docmd-dev
  docmd-skills writer [dir]           Add docmd-writer
  docmd-skills remove [dir]           Remove all installed skills

Options:
  -h, --help                         Show this help
  -v, --version                      Show package version

Examples:
  npx docmd-skills ~/.claude/skills/docmd
  npx docmd-skills dev ~/.claude/skills/docmd
  npx docmd-skills writer ~/.claude/skills/docmd
  npx docmd-skills remove ~/.claude/skills/docmd
`);
}

// ---- install / add ----------------------------------------------------------

async function installSkill(skillName, target) {
  const src = path.join(SKILLS_ROOT, skillName);
  const dest = path.join(target, skillName);
  if (!existsSync(src)) {
    throw new Error(`Skill not found in package: ${skillName} (looked at ${src})`);
  }
  await copyDir(src, dest);
  return dest;
}

async function writeVersionTag(target, version) {
  await fs.writeFile(
    path.join(target, VERSION_FILE),
    `${version}\n`,
    'utf8'
  );
}

// Wipe an existing skill folder so renamed/removed files don't linger
// from a previous install. Only touches the named skill subdirectory —
// never the parent `<dir>` or any user files alongside it.
async function wipeSkill(skillName, target) {
  const existing = path.join(target, skillName);
  if (existsSync(existing)) {
    await fs.rm(existing, { recursive: true, force: true });
  }
}

async function cmdInstallAll(targetArg) {
  const version = await getVersion();
  const target = resolveTarget(targetArg);
  console.log(`docmd-skills v${version}`);
  console.log(`Installing to ${target}\n`);
  // Wipe first so renamed/removed files from a previous install don't linger.
  for (const name of SKILL_NAMES) {
    await wipeSkill(name, target);
  }
  // Now copy fresh.
  for (const name of SKILL_NAMES) {
    await installSkill(name, target);
    console.log(`  + ${name}/`);
  }
  await writeVersionTag(target, version);
  console.log(`\nDone. Point your agent at:`);
  console.log(`  ${target}/docmd-skills/SKILL.md`);
}

async function cmdAddSkill(skillName, targetArg) {
  const version = await getVersion();
  const target = resolveTarget(targetArg);
  const userPath = path.join(target, 'docmd-skills');

  // If the user skill isn't installed yet, fall back to a full install —
  // it's friendlier than erroring out on a fresh directory.
  if (!existsSync(userPath)) {
    console.log(`docmd-skills user skill not found at ${target} — installing all three skills first.\n`);
    return cmdInstallAll(targetArg);
  }

  console.log(`docmd-skills v${version}`);
  console.log(`Adding ${skillName}/ to ${target}\n`);
  // Wipe first so renamed/removed files from a previous install don't linger.
  await wipeSkill(skillName, target);
  await installSkill(skillName, target);
  console.log(`  + ${skillName}/`);
  await writeVersionTag(target, version);
  console.log(`\nDone. The ${skillName} router is at:`);
  console.log(`  ${target}/${skillName}/SKILL.md`);
}

// ---- remove -----------------------------------------------------------------

async function cmdRemove(targetArg) {
  const version = await getVersion();
  const target = resolveTarget(targetArg);

  if (!existsSync(target)) {
    console.log(`Nothing to remove at ${target}`);
    return;
  }

  // Only touch the three named skill folders plus our version tag.
  // Any other files alongside in `<dir>` are left alone.
  console.log(`docmd-skills v${version}`);
  console.log(`Removing skills from ${target}\n`);
  let removed = 0;
  for (const name of SKILL_NAMES) {
    const p = path.join(target, name);
    if (existsSync(p)) {
      await fs.rm(p, { recursive: true, force: true });
      console.log(`  - ${name}/`);
      removed++;
    }
  }
  const verFile = path.join(target, VERSION_FILE);
  if (existsSync(verFile)) {
    await fs.rm(verFile, { force: true });
  }
  if (removed === 0) {
    console.log(`\nNo docmd-skill folders found at ${target}.`);
  } else {
    console.log(`\nDone. ${removed} skill folder(s) removed.`);
  }
}

// ---- maintainer hooks -------------------------------------------------------

async function cmdSelfTest() {
  const pkg = await readPkg();
  let ok = true;

  function check(label, cond) {
    console.log(`${cond ? 'ok  ' : 'FAIL'}  ${label}`);
    if (!cond) ok = false;
  }

  check('package.json present and valid', !!pkg.name && pkg.name === 'docmd-skills');
  check('version is semver', /^\d+\.\d+\.\d+/.test(pkg.version));
  check(`skills/ folder present`, existsSync(SKILLS_ROOT));

  for (const name of SKILL_NAMES) {
    const skillMd = path.join(SKILLS_ROOT, name, 'SKILL.md');
    check(`${name}/SKILL.md present`, existsSync(skillMd));
  }

  // Verify references directories
  const userRefs = path.join(SKILLS_ROOT, 'docmd-skills', 'references');
  const devRefs = path.join(SKILLS_ROOT, 'docmd-dev', 'references');
  const writerRefs = path.join(SKILLS_ROOT, 'docmd-writer', 'references');
  check('docmd-skills/references/ present', existsSync(userRefs));
  check('docmd-dev/references/ present', existsSync(devRefs));
  check('docmd-writer/references/ present', existsSync(writerRefs));

  console.log(ok ? '\nSelf-test passed.' : '\nSelf-test FAILED.');
  process.exit(ok ? 0 : 1);
}

async function cmdPrePublish() {
  // Same as self-test today; placeholder for future publish-time checks.
  await cmdSelfTest();
}

async function cmdRelease(bumpType) {
  const valid = ['patch']; // extend to ['patch', 'minor', 'major'] when needed
  if (!valid.includes(bumpType)) {
    console.error(`Unsupported bump type: ${bumpType}. Allowed: ${valid.join(', ')}`);
    process.exit(1);
  }
  console.log(`Releasing ${bumpType}…`);
  const { execSync } = await import('node:child_process');
  const pkg = await readPkg();
  const [maj, min, pat] = pkg.version.split('.').map(Number);
  const next =
    bumpType === 'patch' ? `${maj}.${min}.${pat + 1}` :
    bumpType === 'minor' ? `${maj}.${min + 1}.0` :
    `${maj + 1}.0.0`;
  pkg.version = next;
  await fs.writeFile(
    path.join(PKG_ROOT, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
    'utf8'
  );
  console.log(`Bumped to ${next}`);
  execSync('git add package.json', { stdio: 'inherit' });
  execSync(`git commit -m "chore(release): v${next}"`, { stdio: 'inherit' });
  execSync(`git tag v${next}`, { stdio: 'inherit' });
  execSync('git push && git push --tags', { stdio: 'inherit' });
  execSync('npm publish', { stdio: 'inherit' });
}

// ---- entry ------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const version = await getVersion();

  // Flags
  if (args.includes('-h') || args.includes('--help')) {
    printHelp(version);
    return;
  }
  if (args.includes('-v') || args.includes('--version')) {
    console.log(version);
    return;
  }

  // Maintainer hooks (hidden — not in help)
  if (args[0] === '--self-test') return cmdSelfTest();
  if (args[0] === '--pre-publish') return cmdPrePublish();
  if (args[0] === '--release') return cmdRelease(args[1] || 'patch');

  // User-facing subcommands
  const sub = args[0];
  const rest = args.slice(1);

  // A target directory is required for every action. Without one, show help.
  if (!sub) return printHelp(version);

  switch (sub) {
    case 'dev':
      if (!rest[0]) return printHelp(version);
      return cmdAddSkill('docmd-dev', rest[0]);
    case 'writer':
      if (!rest[0]) return printHelp(version);
      return cmdAddSkill('docmd-writer', rest[0]);
    case 'remove':
    case 'uninstall': // legacy alias
    case 'rm':        // legacy alias
      if (!rest[0]) return printHelp(version);
      return cmdRemove(rest[0]);
    default:
      // First positional is treated as a target dir.
      return cmdInstallAll(sub);
  }
}

main().catch((err) => {
  console.error(`docmd-skills: ${err.message}`);
  process.exit(1);
});