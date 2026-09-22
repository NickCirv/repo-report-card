# repo-report-card — rubric and command reference

[Overview](../README.md) · [Scoring source](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/scorer.js) · [CLI source](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/bin/grade.js)

## Weighted score

The overall score is the rounded sum of category scores multiplied by these weights. Missing category results contribute zero.

| Category | Weight | What the rubric observes |
| --- | --- | --- |
| Commit hygiene | 20% | Git-history heuristics |
| Documentation | 20% | README length, supporting-file presence and package description |
| Code structure | 25% | Repository layout and structural heuristics |
| Security | 20% | Bounded pattern checks and selected file/configuration signals |
| CI/CD | 15% | Workflow, container, deployment, hook and lint configuration presence |

Documentation earns up to 30 points for README length, 20 for a license, 15 each for contribution and changelog files, 10 for a nonempty docs directory, 5 for a package description and 5 for a code of conduct. These are presence/length proxies; they do not establish that documentation is correct.

CI/CD assigns up to 35 points to CI configuration, 20 each to container and deployment configuration, 15 to hook configuration and 10 to lint/format configuration. It does not query successful CI runs, execute a build or establish that deployment works.

## Grade thresholds

| Score | Grade | Score | Grade |
| --- | --- | --- | --- |
| 95–100 | A+ | 65–69 | C+ |
| 90–94 | A | 60–64 | C |
| 85–89 | A− | 55–59 | C− |
| 80–84 | B+ | 50–54 | D+ |
| 75–79 | B | 45–49 | D |
| 70–74 | B− | 40–44 | D− |
| Below 40 | F | | |

The three highlighted issues are selected using text heuristics and category weight. They are not a measured ranking of engineering risk. Read all findings before choosing work.

## Commands and options

| Invocation | Purpose |
| --- | --- |
| `node bin/grade.js [path]` | Grade a local repository; path defaults to `.` |
| `node bin/grade.js compare <path1> <path2>` | Compare two repositories |
| `node bin/grade.js badge [path]` | Print Markdown for a grade badge |

| Option | Scope and behavior |
| --- | --- |
| `-f, --format <type>` | Default command: `text`, `json`, `markdown`; compare: `text`, `json`; default `text` |
| `-v, --verbose` | Default command: show all findings in text output |
| `-c, --category <name>` | Default command: `commits`, `docs`, `structure`, `security`, or `ci` |

Category selection changes output after the repository is graded; it does not avoid the other scans. Category JSON contains that category's result; other formats print the category grade and findings. The badge command only prints a string.

## Exit behavior

Invalid paths, missing `.git`, unknown categories and caught grading errors exit 1. A low grade does **not** fail the process. For CI thresholds, consume the JSON score and implement an explicit decision in your own workflow. These commands are source-inspected, not runtime-tested in this review.
