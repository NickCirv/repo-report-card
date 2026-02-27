<div align="center">
  <img src="banner.svg" alt="Repo Report Card" width="800" />
</div>

<div align="center">
  <strong>Generate a letter-grade report card for any git repo — no API keys required.</strong>
</div>

<br />

<div align="center">

[![npm version](https://img.shields.io/npm/v/repo-report-card?color=%233B82F6)](https://npmjs.com/package/repo-report-card)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

</div>

---

## Install

```bash
npm install -g repo-report-card
```

Or run without installing:

```bash
npx repo-report-card [path]
```

---

## Quick Demo

```
  ╔══════════════════════════════════════╗
  ║       REPO REPORT CARD               ║
  ╚══════════════════════════════════════╝

  ██╗  ██╗
  ███╗ ██╗
  ████╗██╗
  ██╔████╗
  ██║╚███╗
  ╚═╝  ╚═╝

  Overall Score: 82/100 — B+

  ─────────────────────────────────────
  Category Breakdown
  ─────────────────────────────────────
  A-   Commit Hygiene     ██████████░  87/100
  B+   Documentation      ████████░░░  80/100
  A    Code Structure      █████████░░  90/100
  A-   Security           ██████████░  85/100
  C+   CI/CD              ██████░░░░░  65/100

  ─────────────────────────────────────
  Top Improvements
  ─────────────────────────────────────
  1. [CI/CD] No CI/CD configuration — add GitHub Actions or similar
  2. [Documentation] No CHANGELOG — consider Keep a Changelog format
  3. [Commit Hygiene] Only 42% conventional commits (target 80%+)
```

---

## Commands

```bash
# Grade the current directory
repo-report-card

# Grade a specific repo
repo-report-card /path/to/repo

# Compare two repos
repo-report-card compare ./my-repo ./other-repo

# Output a markdown badge
repo-report-card badge ./my-repo

# Show all findings (verbose)
repo-report-card --verbose

# Output as JSON
repo-report-card --format json

# Output as Markdown
repo-report-card --format markdown

# Grade a single category
repo-report-card --category commits
repo-report-card --category docs
repo-report-card --category structure
repo-report-card --category security
repo-report-card --category ci
```

---

## Grading Categories

| Category | Weight | What It Checks |
|----------|--------|----------------|
| **Commit Hygiene** | 20% | Conventional commits %, message length, frequency, author diversity, merge ratio |
| **Documentation** | 20% | README depth, LICENSE, CONTRIBUTING, CHANGELOG, docs/ directory |
| **Code Structure** | 25% | src/lib directory, test files, .gitignore quality, no large binaries, package.json scripts |
| **Security** | 20% | No .env committed, no hardcoded secrets, sensitive .gitignore patterns, lockfile |
| **CI/CD** | 15% | GitHub Actions, Dockerfile, deploy configs, pre-commit hooks, linter setup |

---

## Scoring

| Grade | Score | Meaning |
|-------|-------|---------|
| A+ | 95-100 | Exceptional — reference-quality repo |
| A | 90-94 | Excellent — production ready |
| A- | 85-89 | Very good — minor gaps |
| B+ | 80-84 | Good — a few improvements needed |
| B | 75-79 | Solid — noticeable gaps |
| B- | 70-74 | Decent — several areas to address |
| C+ | 65-69 | Below average — needs work |
| C | 60-64 | Needs improvement |
| C- | 55-59 | Poor |
| D | 40-54 | Very poor |
| F | <40 | Critical issues |

---

## Features

- **Zero API keys** — pure local analysis of git history and repo structure
- **Fast** — runs entirely offline, results in seconds
- **Compare repos** — side-by-side comparison with winner detection
- **Badge generation** — drop a shield into your README
- **Multiple formats** — terminal (chalk), JSON, Markdown
- **Verbose mode** — see every individual finding per category
- **Single category** — drill into one dimension at a time

---

## Development

```bash
git clone https://github.com/NickCirv/repo-report-card.git
cd repo-report-card
npm install
node bin/grade.js .
```

---

## License

MIT — Copyright (c) 2026 [NickCirv](https://github.com/NickCirv)
