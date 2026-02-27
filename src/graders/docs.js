import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

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

function findFile(repoPath, candidates) {
  for (const name of candidates) {
    if (existsSync(join(repoPath, name))) return join(repoPath, name);
  }
  return null;
}

function fileLength(filePath) {
  try {
    return readFileSync(filePath, 'utf8').split('\n').length;
  } catch {
    return 0;
  }
}

export function gradeDocs(repoPath) {
  const findings = [];
  let score = 0;

  // README (30 pts)
  const readmePath = findFile(repoPath, ['README.md', 'README.rst', 'README.txt', 'README']);
  if (readmePath) {
    const lines = fileLength(readmePath);
    if (lines >= 50) {
      score += 30;
      findings.push(`README present and detailed (${lines} lines)`);
    } else if (lines >= 20) {
      score += 20;
      findings.push(`README present but brief (${lines} lines) — add usage, examples, install`);
    } else {
      score += 10;
      findings.push(`README too short (${lines} lines) — needs much more content`);
    }
  } else {
    findings.push('No README found — critical for discoverability');
  }

  // LICENSE (20 pts)
  const licensePath = findFile(repoPath, ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE']);
  if (licensePath) {
    score += 20;
    findings.push('LICENSE present');
  } else {
    findings.push('No LICENSE — add one (MIT, Apache 2.0, etc.)');
  }

  // CONTRIBUTING (15 pts)
  const contributingPath = findFile(repoPath, ['CONTRIBUTING.md', 'CONTRIBUTING.rst', 'CONTRIBUTING.txt', '.github/CONTRIBUTING.md']);
  if (contributingPath) {
    score += 15;
    findings.push('CONTRIBUTING guide present');
  } else {
    findings.push('No CONTRIBUTING.md — helps onboard collaborators');
  }

  // CHANGELOG (15 pts)
  const changelogPath = findFile(repoPath, ['CHANGELOG.md', 'CHANGELOG.txt', 'CHANGELOG', 'HISTORY.md', 'RELEASES.md']);
  if (changelogPath) {
    score += 15;
    findings.push('CHANGELOG present');
  } else {
    findings.push('No CHANGELOG — consider Keep a Changelog format');
  }

  // docs/ directory (10 pts)
  if (existsSync(join(repoPath, 'docs')) && statSync(join(repoPath, 'docs')).isDirectory()) {
    const docFiles = readdirSync(join(repoPath, 'docs'));
    if (docFiles.length > 0) {
      score += 10;
      findings.push(`docs/ directory with ${docFiles.length} file(s)`);
    }
  }

  // package.json description (5 pts)
  const pkgPath = join(repoPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      if (pkg.description && pkg.description.trim().length > 10) {
        score += 5;
        findings.push('package.json has description');
      } else {
        findings.push('package.json missing description');
      }
    } catch {
      // ignore parse errors
    }
  }

  // Code of conduct bonus (5 pts)
  const cocPath = findFile(repoPath, ['CODE_OF_CONDUCT.md', '.github/CODE_OF_CONDUCT.md']);
  if (cocPath) {
    score += 5;
    findings.push('Code of Conduct present');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, grade: scoreGrade(score), findings };
}
