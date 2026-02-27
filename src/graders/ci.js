import { existsSync, readdirSync } from 'fs';
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

function dirHasFiles(dirPath) {
  try {
    return readdirSync(dirPath).length > 0;
  } catch {
    return false;
  }
}

export function gradeCI(repoPath) {
  const findings = [];
  let score = 0;

  // CI workflows (35 pts)
  const workflowsDir = join(repoPath, '.github', 'workflows');
  if (existsSync(workflowsDir) && dirHasFiles(workflowsDir)) {
    const workflows = readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    score += 35;
    findings.push(`GitHub Actions: ${workflows.length} workflow(s) (${workflows.join(', ')})`);
  } else {
    // Check for other CI configs
    const ciConfigs = [
      { path: '.circleci/config.yml', label: 'CircleCI' },
      { path: '.travis.yml', label: 'Travis CI' },
      { path: 'Jenkinsfile', label: 'Jenkins' },
      { path: '.gitlab-ci.yml', label: 'GitLab CI' },
      { path: 'bitbucket-pipelines.yml', label: 'Bitbucket Pipelines' },
      { path: 'azure-pipelines.yml', label: 'Azure Pipelines' },
    ];
    const foundCI = ciConfigs.find(c => existsSync(join(repoPath, c.path)));
    if (foundCI) {
      score += 30;
      findings.push(`${foundCI.label} config present`);
    } else {
      findings.push('No CI/CD configuration — add GitHub Actions or similar');
    }
  }

  // Dockerfile / containerization (20 pts)
  if (existsSync(join(repoPath, 'Dockerfile'))) {
    score += 20;
    findings.push('Dockerfile present');
    if (existsSync(join(repoPath, 'docker-compose.yml')) || existsSync(join(repoPath, 'docker-compose.yaml'))) {
      findings.push('docker-compose.yml present');
    }
  } else if (existsSync(join(repoPath, 'docker-compose.yml')) || existsSync(join(repoPath, 'docker-compose.yaml'))) {
    score += 10;
    findings.push('docker-compose.yml present (no Dockerfile)');
  }

  // Deploy config (20 pts)
  const deployConfigs = [
    { path: 'render.yaml', label: 'Render' },
    { path: 'vercel.json', label: 'Vercel' },
    { path: 'netlify.toml', label: 'Netlify' },
    { path: '.vercel', label: 'Vercel (legacy)' },
    { path: 'fly.toml', label: 'Fly.io' },
    { path: 'railway.json', label: 'Railway' },
    { path: 'app.yaml', label: 'Google App Engine' },
    { path: 'Procfile', label: 'Heroku' },
  ];
  const foundDeploy = deployConfigs.filter(c => existsSync(join(repoPath, c.path)));
  if (foundDeploy.length > 0) {
    score += 20;
    findings.push(`Deploy config: ${foundDeploy.map(d => d.label).join(', ')}`);
  } else {
    findings.push('No deploy config (render.yaml, vercel.json, netlify.toml, etc.)');
  }

  // Pre-commit hooks (15 pts)
  const huskyDir = join(repoPath, '.husky');
  const preCommitLint = existsSync(join(repoPath, '.lintstagedrc')) || existsSync(join(repoPath, '.lintstagedrc.json'));
  if (existsSync(huskyDir) && dirHasFiles(huskyDir)) {
    score += 15;
    findings.push('Husky pre-commit hooks configured');
  } else if (existsSync(join(repoPath, '.pre-commit-config.yaml'))) {
    score += 15;
    findings.push('pre-commit hooks configured');
  } else if (preCommitLint) {
    score += 8;
    findings.push('lint-staged configured (add husky for full pre-commit hooks)');
  }

  // Lint config (10 pts)
  const lintConfigs = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js', '.eslintrc.cjs'];
  const prettierConfigs = ['.prettierrc', '.prettierrc.js', '.prettierrc.json', 'prettier.config.js'];
  const hasEslint = lintConfigs.some(c => existsSync(join(repoPath, c)));
  const hasPrettier = prettierConfigs.some(c => existsSync(join(repoPath, c)));
  if (hasEslint && hasPrettier) {
    score += 10;
    findings.push('ESLint + Prettier configured');
  } else if (hasEslint || hasPrettier) {
    score += 5;
    findings.push(`${hasEslint ? 'ESLint' : 'Prettier'} configured (add ${hasEslint ? 'Prettier' : 'ESLint'} too)`);
  } else {
    findings.push('No linter/formatter config — add ESLint and Prettier');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, grade: scoreGrade(score), findings };
}
