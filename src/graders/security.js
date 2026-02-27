import { existsSync, readFileSync, readdirSync } from 'fs';
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

const SECRET_PATTERNS = [
  { pattern: /(?:API_KEY|api_key)\s*=\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/i, label: 'API key assignment' },
  { pattern: /(?:password|passwd|pwd)\s*=\s*['"][^'"]{4,}['"]/i, label: 'Hardcoded password' },
  { pattern: /(?:secret|token)\s*=\s*['"][A-Za-z0-9_\-]{16,}['"]/i, label: 'Secret/token assignment' },
  { pattern: /(?:PRIVATE_KEY|private_key)\s*=\s*['"][^'"]{10,}['"]/i, label: 'Private key' },
  { pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: 'Private key block' },
  { pattern: /sk-[a-zA-Z0-9]{40,}/, label: 'OpenAI-style key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: 'GitHub personal token' },
];

const SENSITIVE_GITIGNORE_PATTERNS = ['.env', '*.pem', '*.key', 'secrets', 'credentials'];
const CODE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.php', '.go', '.java', '.cs', '.sh', '.yaml', '.yml', '.json', '.env.example']);

function collectCodeFiles(repoPath, maxFiles = 200) {
  const files = [];
  function walk(dir, depth = 0) {
    if (depth > 4 || files.length >= maxFiles) return;
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'vendor') continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full, depth + 1);
        } else if (CODE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
          files.push(full);
        }
      }
    } catch {
      // ignore permission errors
    }
  }
  walk(repoPath);
  return files;
}

export function gradeSecurity(repoPath) {
  const findings = [];
  let score = 100;

  // .env committed (major penalty)
  if (existsSync(join(repoPath, '.env'))) {
    score -= 30;
    findings.push('.env file is committed — NEVER commit secrets, add to .gitignore');
  }

  // .gitignore covers sensitive patterns (20 pts)
  const gitignorePath = join(repoPath, '.gitignore');
  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf8').toLowerCase();
    const covered = SENSITIVE_GITIGNORE_PATTERNS.filter(p => content.includes(p.toLowerCase()));
    if (covered.length >= 3) {
      findings.push('.gitignore covers sensitive file patterns');
    } else {
      score -= 10;
      findings.push(`.gitignore missing sensitive patterns (add: ${SENSITIVE_GITIGNORE_PATTERNS.filter(p => !content.includes(p.toLowerCase())).join(', ')})`);
    }
  }

  // Scan for hardcoded secrets in code files
  const codeFiles = collectCodeFiles(repoPath);
  const secretHits = [];
  for (const file of codeFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      for (const { pattern, label } of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          secretHits.push({ file: file.replace(repoPath + '/', ''), label });
          break;
        }
      }
    } catch {
      // ignore unreadable files
    }
  }

  if (secretHits.length === 0) {
    findings.push('No hardcoded secret patterns detected');
  } else {
    const penalty = Math.min(40, secretHits.length * 15);
    score -= penalty;
    for (const hit of secretHits.slice(0, 3)) {
      findings.push(`Potential ${hit.label} in ${hit.file}`);
    }
    if (secretHits.length > 3) {
      findings.push(`...and ${secretHits.length - 3} more potential secret(s)`);
    }
  }

  // Lockfile present (10 pts)
  const hasLockfile = existsSync(join(repoPath, 'package-lock.json')) ||
    existsSync(join(repoPath, 'yarn.lock')) ||
    existsSync(join(repoPath, 'pnpm-lock.yaml')) ||
    existsSync(join(repoPath, 'bun.lockb'));
  if (hasLockfile) {
    findings.push('Lockfile present (prevents dependency confusion attacks)');
  } else {
    score -= 10;
    findings.push('No lockfile — supply chain risk without pinned dependencies');
  }

  // .env.example present (bonus)
  if (existsSync(join(repoPath, '.env.example')) || existsSync(join(repoPath, '.env.sample'))) {
    findings.push('.env.example present — good practice for documenting required env vars');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, grade: scoreGrade(score), findings };
}
