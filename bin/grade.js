#!/usr/bin/env node

import { program } from 'commander';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { gradeRepo } from '../src/index.js';
import { formatReportCard, formatComparison, formatBadge } from '../src/formatter.js';

program
  .name('repo-report-card')
  .description('Generate a letter-grade report card for any git repo')
  .version('1.0.0');

// Default command: grade a repo
program
  .argument('[path]', 'Path to the git repo', '.')
  .option('-f, --format <type>', 'Output format: text, json, markdown', 'text')
  .option('-v, --verbose', 'Show all findings for each category', false)
  .option('-c, --category <name>', 'Grade a single category: commits, docs, structure, security, ci')
  .action(async (repoPath, opts) => {
    const absPath = resolve(repoPath);

    if (!existsSync(absPath)) {
      console.error(`Error: path does not exist: ${absPath}`);
      process.exit(1);
    }

    if (!existsSync(`${absPath}/.git`)) {
      console.error(`Error: not a git repository: ${absPath}`);
      process.exit(1);
    }

    try {
      const result = await gradeRepo(absPath);

      if (opts.category) {
        const validCategories = ['commits', 'docs', 'structure', 'security', 'ci'];
        if (!validCategories.includes(opts.category)) {
          console.error(`Error: unknown category "${opts.category}". Valid: ${validCategories.join(', ')}`);
          process.exit(1);
        }
        const cat = result.grades[opts.category];
        if (opts.format === 'json') {
          console.log(JSON.stringify(cat, null, 2));
        } else {
          console.log(`\n  ${result.labels[opts.category]}: ${cat.grade} (${cat.score}/100)`);
          for (const f of cat.findings) {
            console.log(`    → ${f}`);
          }
        }
        return;
      }

      const output = formatReportCard(result, { format: opts.format, verbose: opts.verbose });
      console.log(output);
    } catch (err) {
      console.error(`Error grading repo: ${err.message}`);
      process.exit(1);
    }
  });

// Compare two repos
program
  .command('compare <path1> <path2>')
  .description('Compare report cards for two repos')
  .option('-f, --format <type>', 'Output format: text, json', 'text')
  .action(async (path1, path2, opts) => {
    const absPath1 = resolve(path1);
    const absPath2 = resolve(path2);

    for (const [p, label] of [[absPath1, path1], [absPath2, path2]]) {
      if (!existsSync(p)) {
        console.error(`Error: path does not exist: ${label}`);
        process.exit(1);
      }
      if (!existsSync(`${p}/.git`)) {
        console.error(`Error: not a git repository: ${label}`);
        process.exit(1);
      }
    }

    try {
      const [result1, result2] = await Promise.all([gradeRepo(absPath1), gradeRepo(absPath2)]);

      if (opts.format === 'json') {
        console.log(JSON.stringify({ repo1: result1, repo2: result2 }, null, 2));
        return;
      }

      console.log(formatComparison(result1, result2, absPath1, absPath2));
    } catch (err) {
      console.error(`Error comparing repos: ${err.message}`);
      process.exit(1);
    }
  });

// Badge command
program
  .command('badge [path]')
  .description('Output a markdown badge string for the repo grade')
  .action(async (repoPath = '.') => {
    const absPath = resolve(repoPath);

    if (!existsSync(absPath) || !existsSync(`${absPath}/.git`)) {
      console.error('Error: not a valid git repository');
      process.exit(1);
    }

    try {
      const result = await gradeRepo(absPath);
      console.log(formatBadge(result));
    } catch (err) {
      console.error(`Error generating badge: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
