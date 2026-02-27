import chalk from 'chalk';
import { gradeColor } from './scorer.js';

const ACCENT = chalk.hex('#3B82F6');

// ASCII art grade display (large block letters)
const ASCII_GRADES = {
  'A+': [
    '  ██╗  ██╗',
    '  ███╗ ██╗',
    '  ████╗██╗',
    '  ██╔████╗',
    '  ██║╚███╗',
    '  ╚═╝  ╚═╝  +',
  ],
  'A': [
    '  ██╗  ██╗',
    '  ███╗ ██╗',
    '  ████╗██╗',
    '  ██╔████╗',
    '  ██║╚███╗',
    '  ╚═╝  ╚═╝',
  ],
  'B': [
    '  ██████╗ ',
    '  ██╔══██╗',
    '  ██████╔╝',
    '  ██╔══██╗',
    '  ██████╔╝',
    '  ╚═════╝ ',
  ],
  'C': [
    '   ██████╗',
    '  ██╔════╝',
    '  ██║     ',
    '  ██║     ',
    '  ╚██████╗',
    '   ╚═════╝',
  ],
  'D': [
    '  ██████╗ ',
    '  ██╔══██╗',
    '  ██║  ██║',
    '  ██║  ██║',
    '  ██████╔╝',
    '  ╚═════╝ ',
  ],
  'F': [
    '  ███████╗',
    '  ██╔════╝',
    '  █████╗  ',
    '  ██╔══╝  ',
    '  ██║     ',
    '  ╚═╝     ',
  ],
};

function getAsciiGrade(grade) {
  if (grade === 'A+') return ASCII_GRADES['A+'];
  const letter = grade[0];
  const modifier = grade.slice(1);
  const lines = (ASCII_GRADES[letter] || ASCII_GRADES['F']).map(l => l);
  if (modifier === '-') {
    lines[lines.length - 1] += '  -';
  } else if (modifier === '+' && letter !== 'A') {
    lines[lines.length - 1] += '  +';
  }
  return lines;
}

function colorByGrade(text, grade) {
  const color = gradeColor(grade);
  return chalk[color](text);
}

function categoryBar(score) {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return ACCENT('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

export function formatReportCard(result, opts = {}) {
  if (opts.format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  if (opts.format === 'markdown') {
    return formatMarkdown(result);
  }

  const lines = [];
  const { score, grade, grades, topIssues, labels } = result;

  // Header
  lines.push('');
  lines.push(ACCENT('  ╔══════════════════════════════════════╗'));
  lines.push(ACCENT('  ║') + chalk.bold('       REPO REPORT CARD               ') + ACCENT('║'));
  lines.push(ACCENT('  ╚══════════════════════════════════════╝'));
  lines.push('');

  // Big grade letter
  const asciiLines = getAsciiGrade(grade);
  for (const line of asciiLines) {
    lines.push(colorByGrade(line, grade));
  }
  lines.push('');
  lines.push(colorByGrade(`  Overall Score: ${score}/100 — ${grade}`, grade));
  lines.push('');

  // Category breakdown
  lines.push(ACCENT('  ─────────────────────────────────────'));
  lines.push(chalk.bold('  Category Breakdown'));
  lines.push(ACCENT('  ─────────────────────────────────────'));

  for (const [key, label] of Object.entries(labels)) {
    const r = grades[key];
    if (!r) continue;
    const gradeStr = colorByGrade(r.grade.padEnd(3), r.grade);
    const bar = categoryBar(r.score);
    const scoreStr = chalk.gray(`${r.score}/100`);
    lines.push(`  ${gradeStr}  ${label.padEnd(18)}  ${bar}  ${scoreStr}`);

    if (opts.verbose && r.findings) {
      for (const finding of r.findings) {
        lines.push(chalk.gray(`       → ${finding}`));
      }
    }
  }

  lines.push('');

  // Top issues
  if (topIssues && topIssues.length > 0) {
    lines.push(ACCENT('  ─────────────────────────────────────'));
    lines.push(chalk.bold('  Top Improvements'));
    lines.push(ACCENT('  ─────────────────────────────────────'));
    for (let i = 0; i < topIssues.length; i++) {
      lines.push(`  ${chalk.yellow(`${i + 1}.`)} ${topIssues[i]}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function formatComparison(result1, result2, path1, path2) {
  const lines = [];

  lines.push('');
  lines.push(ACCENT('  ╔══════════════════════════════════════════════════════╗'));
  lines.push(ACCENT('  ║') + chalk.bold('              REPO COMPARISON                         ') + ACCENT('║'));
  lines.push(ACCENT('  ╚══════════════════════════════════════════════════════╝'));
  lines.push('');

  const winner = result1.score >= result2.score ? 1 : 2;
  lines.push(`  ${chalk.bold(path1.split('/').pop())} vs ${chalk.bold(path2.split('/').pop())}`);
  lines.push('');

  // Overall
  const g1 = colorByGrade(`${result1.grade} (${result1.score})`, result1.grade);
  const g2 = colorByGrade(`${result2.grade} (${result2.score})`, result2.grade);
  lines.push(chalk.bold('  Overall:'));
  lines.push(`    ${path1.split('/').pop().padEnd(25)}  ${g1}`);
  lines.push(`    ${path2.split('/').pop().padEnd(25)}  ${g2}`);
  lines.push('');

  // Category by category
  lines.push(chalk.bold('  Categories:'));
  lines.push(ACCENT('  ─────────────────────────────────────────────────────'));
  for (const [key, label] of Object.entries(result1.labels)) {
    const r1 = result1.grades[key];
    const r2 = result2.grades[key];
    if (!r1 || !r2) continue;
    const diff = r1.score - r2.score;
    const indicator = diff > 0 ? chalk.green('▲') : diff < 0 ? chalk.red('▼') : chalk.gray('=');
    lines.push(`  ${label.padEnd(18)}  ${colorByGrade(r1.grade, r1.grade)} vs ${colorByGrade(r2.grade, r2.grade)}  ${indicator} ${Math.abs(diff)}pts`);
  }

  lines.push('');
  lines.push(`  ${chalk.bold('Winner:')} ${colorByGrade((winner === 1 ? path1 : path2).split('/').pop(), winner === 1 ? result1.grade : result2.grade)}`);
  lines.push('');

  return lines.join('\n');
}

export function formatBadge(result) {
  const { grade, score } = result;
  const color = grade.startsWith('A') ? 'brightgreen' :
    grade.startsWith('B') ? 'green' :
    grade.startsWith('C') ? 'yellow' :
    grade.startsWith('D') ? 'orange' : 'red';
  const label = encodeURIComponent('repo grade');
  const message = encodeURIComponent(`${grade} (${score}/100)`);
  return `![Repo Report Card](https://img.shields.io/badge/${label}-${message}-${color})`;
}

function formatMarkdown(result) {
  const { score, grade, grades, topIssues, labels } = result;
  const lines = [];

  lines.push('# Repo Report Card');
  lines.push('');
  lines.push(`**Overall Grade: ${grade} (${score}/100)**`);
  lines.push('');
  lines.push('## Category Breakdown');
  lines.push('');
  lines.push('| Category | Grade | Score |');
  lines.push('|----------|-------|-------|');

  for (const [key, label] of Object.entries(labels)) {
    const r = grades[key];
    if (!r) continue;
    lines.push(`| ${label} | ${r.grade} | ${r.score}/100 |`);
  }

  if (topIssues && topIssues.length > 0) {
    lines.push('');
    lines.push('## Top Improvements');
    lines.push('');
    for (const issue of topIssues) {
      lines.push(`- ${issue}`);
    }
  }

  return lines.join('\n');
}
