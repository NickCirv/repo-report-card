import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';

function scoreGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D+';
  if (score >= 45) return 'D';
  if (score >= 40) return 'D-';
  return 'F';
}

const BINARY_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dmg', '.dll', '.so', '.dylib', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.wav']);
const TEST_PATTERNS = [/\.test\.[jt]sx?$/, /\.spec\.[jt]sx?$/, /_test\.[jt]sx?$/, /\.test\.py$/, /\.spec\.rb$/];

function walkDir(dirPath, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = join(dirPath, entry.name);
      results.push({ name: entry.name, path: fullPath, isDir: entry.isDirectory() });
      if (entry.isDirectory() && depth < maxDepth) {
        results.push(...walkDir(fullPath, depth + 1, maxDepth));
      }
    }
    return results;
  } catch {
    return [];
  }
}

export function gradeStructure(repoPath) {
  const findings = [];
  let score = 0;

  // Source directory (20 pts)
  const hasSrc = existsSync(join(repoPath, 'src'));
  const hasLib = existsSync(join(repoPath, 'lib'));
  if (hasSrc || hasLib) {
    score += 20;
    findings.push(`Source organized in ${hasSrc ? 'src/' : 'lib/'} directory`);
  } else {
    findings.push('No src/ or lib/ directory — consider organizing source files');
  }

  // Tests present (25 pts)
  const allFiles = walkDir(repoPath);
  const hasTestDir = allFiles.some(f => f.isDir && (f.name === 'tests' || f.name === '__tests__' || f.name === 'test' || f.name === 'spec'));
  const hasTestFiles = allFiles.some(f => !f.isDir && TEST_PATTERNS.some(p => p.test(f.name)));
  if (hasTestDir || hasTestFiles) {
    score += 25;
    findings.push('Tests found' + (hasTestDir ? ' (dedicated test directory)' : ' (co-located test files)'));
  } else {
    findings.push('No tests detected — add unit/integration tests');
  }

  // .gitignore (15 pts)
  const gitignorePath = join(repoPath, '.gitignore');
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#')).length;
    if (lines >= 5) {
      score += 15;
      findings.push(`.gitignore present (${lines} rules)`);
    } else {
      score += 8;
      findings.push(`.gitignore present but sparse (${lines} rules) — expand it`);
    }
  } else {
    findings.push('No .gitignore — add one immediately');
  }

  // No large binaries tracked (15 pts)
  const largeFiles = allFiles.filter(f => {
    if (f.isDir) return false;
    const ext = extname(f.name).toLowerCase();
    if (!BINARY_EXTENSIONS.has(ext)) return false;
    try {
      return statSync(f.path).size > 1024 * 1024; // 1MB
    } catch {
      return false;
    }
  });
  if (largeFiles.length === 0) {
    score += 15;
    findings.push('No large binary files tracked in git');
  } else {
    score += 5;
    findings.push(`${largeFiles.length} large binary file(s) tracked — consider git-lfs`);
  }

  // package.json scripts (15 pts)
  const pkgPath = join(repoPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const scripts = pkg.scripts || {};
      const hasTest = 'test' in scripts;
      const hasLint = 'lint' in scripts;
      const hasBuild = 'build' in scripts;
      const scriptScore = (hasTest ? 5 : 0) + (hasLint ? 5 : 0) + (hasBuild ? 5 : 0);
      score += scriptScore;
      const present = [hasTest && 'test', hasLint && 'lint', hasBuild && 'build'].filter(Boolean);
      const missing = [!hasTest && 'test', !hasLint && 'lint', !hasBuild && 'build'].filter(Boolean);
      if (present.length) findings.push(`Scripts present: ${present.join(', ')}`);
      if (missing.length) findings.push(`Missing scripts: ${missing.join(', ')}`);
    } catch {
      // ignore
    }
  }

  // Lockfile (10 pts)
  const hasLockfile = existsSync(join(repoPath, 'package-lock.json')) ||
    existsSync(join(repoPath, 'yarn.lock')) ||
    existsSync(join(repoPath, 'pnpm-lock.yaml')) ||
    existsSync(join(repoPath, 'bun.lockb'));
  if (hasLockfile) {
    score += 10;
    findings.push('Lockfile present (reproducible installs)');
  } else {
    findings.push('No lockfile — add package-lock.json or yarn.lock');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, grade: scoreGrade(score), findings };
}
