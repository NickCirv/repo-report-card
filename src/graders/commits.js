import { execFileSync } from 'child_process';

const CONVENTIONAL_PATTERN = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .+/;

function runGit(repoPath, args) {
  try {
    return execFileSync('git', args, { cwd: repoPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

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

export function gradeCommits(repoPath) {
  const findings = [];
  let score = 100;

  const logRaw = runGit(repoPath, ['log', '--pretty=format:%s|||%ae|||%H|||%P', '--max-count=200']);
  if (!logRaw) {
    return { score: 0, grade: 'F', findings: ['No git history found'] };
  }

  const commits = logRaw.split('\n').filter(Boolean).map(line => {
    const [subject, email, hash, parents] = line.split('|||');
    return { subject: subject || '', email: email || '', hash: hash || '', parents: parents || '' };
  });

  if (commits.length === 0) {
    return { score: 0, grade: 'F', findings: ['No commits found'] };
  }

  // Conventional commit percentage
  const conventionalCount = commits.filter(c => CONVENTIONAL_PATTERN.test(c.subject)).length;
  const conventionalPct = (conventionalCount / commits.length) * 100;
  if (conventionalPct >= 80) {
    findings.push(`${conventionalPct.toFixed(0)}% conventional commits`);
  } else if (conventionalPct >= 40) {
    score -= 10;
    findings.push(`Only ${conventionalPct.toFixed(0)}% conventional commits (target 80%+)`);
  } else {
    score -= 20;
    findings.push(`Low conventional commit usage: ${conventionalPct.toFixed(0)}% (use feat/fix/docs/etc. prefixes)`);
  }

  // Message length
  const avgLength = commits.reduce((sum, c) => sum + c.subject.length, 0) / commits.length;
  if (avgLength < 10) {
    score -= 20;
    findings.push(`Very short commit messages (avg ${avgLength.toFixed(0)} chars) — add more context`);
  } else if (avgLength < 20) {
    score -= 10;
    findings.push(`Short commit messages (avg ${avgLength.toFixed(0)} chars)`);
  } else if (avgLength > 72) {
    score -= 5;
    findings.push(`Long commit subject lines (avg ${avgLength.toFixed(0)} chars) — keep under 72`);
  } else {
    findings.push(`Good commit message length (avg ${avgLength.toFixed(0)} chars)`);
  }

  // Author diversity
  const authors = new Set(commits.map(c => c.email));
  if (authors.size === 1) {
    findings.push('Single author — solo project');
  } else {
    findings.push(`${authors.size} contributors`);
  }

  // Merge commit ratio
  const mergeCommits = commits.filter(c => c.parents.includes(' ')).length;
  const mergePct = (mergeCommits / commits.length) * 100;
  if (mergePct > 40) {
    score -= 10;
    findings.push(`High merge commit ratio (${mergePct.toFixed(0)}%) — consider squash merges`);
  }

  // Commit frequency
  const firstDate = runGit(repoPath, ['log', '--reverse', '--pretty=format:%at', '--max-count=1']);
  const lastDate = runGit(repoPath, ['log', '--pretty=format:%at', '--max-count=1']);
  if (firstDate && lastDate) {
    const weeks = Math.max(1, (parseInt(lastDate) - parseInt(firstDate)) / (7 * 24 * 3600));
    const commitsPerWeek = commits.length / weeks;
    if (commitsPerWeek >= 1) {
      findings.push(`Active: ~${commitsPerWeek.toFixed(1)} commits/week`);
    } else {
      score -= 5;
      findings.push(`Low frequency: ${commitsPerWeek.toFixed(2)} commits/week`);
    }
  }

  score = Math.max(0, Math.min(100, score));
  return { score, grade: scoreGrade(score), findings };
}
