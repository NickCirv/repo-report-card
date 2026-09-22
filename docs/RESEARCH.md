# Source review — repo-report-card

## Revision and method

Inspected public commit: [`1d672e037e985aab1b063cd2c04730af03e7e562`](https://github.com/NickCirv/repo-report-card/commit/1d672e037e985aab1b063cd2c04730af03e7e562). Source tree: `1dd00f4ffc2326b15ec98660e94beb158bed07fc`. Capture scope: all eligible text files; 14 of 14 eligible files.

This review read captured implementation and documentation. It did not install dependencies, execute project commands, call project APIs, check package publication or establish live CI status. Examples are source-derived, not captured execution transcripts.

## Claim ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| CLI categories and comparison | [bin/grade.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/bin/grade.js) | Verified in inspected source; execution unverified |
| Bounded security scan and .env existence check | [src/graders/security.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/graders/security.js) | Verified in inspected source; execution unverified |
| CI file checks | [src/graders/ci.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/graders/ci.js) | Verified in inspected source; execution unverified |
| Weighted overall score | [src/scorer.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/scorer.js) | Verified in inspected source; execution unverified |

## Findings and verification gaps

A high grade is not a certification of software quality or security. The security scanner is capped and pattern-based; its `.env` finding tests file existence, not whether Git tracks the file. CI checks inspect configuration, not successful runs. Comparison is meaningful only with these rubric limitations understood.

The captured smoke test only asks Node to syntax-check the entrypoint. It does not exercise behavior, integrations or failure paths. Neither that test nor installation was run in this review.

| Dimension | Result |
| --- | --- |
| Purpose and documented commands | Partially verified: static source inspection |
| Clean installation and examples | Unverified |
| Test suite and live CI | Unverified |
| Performance and security guarantees | Unverified |
| Publication | Local documentation only |

## Documentation inventory

- [README.md](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/README.md) — Rewritten; historic section anchors retained where practical.
- [LICENSE](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/LICENSE) — protected document preserved unchanged.

## Captured source inventory

- [LICENSE](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/LICENSE) — Git blob `481c289c06c96c07330f8c7dedd847c5c07ca384`.
- [README.md](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/README.md) — Git blob `c99242e5e7195c50fbe9767585874f5b7c04c77c`.
- [package.json](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/package.json) — Git blob `da7a1b98cc1496351e2ca05cdd93d3e180681038`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/.github/workflows/ci.yml) — Git blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [bin/grade.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/bin/grade.js) — Git blob `e4c2da8c281c48eadc167fe1a70f44ec24206321`.
- [src/formatter.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/formatter.js) — Git blob `1cd4775846c45f30113f57f152d003c29c2cba74`.
- [src/graders/ci.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/graders/ci.js) — Git blob `e8efbe82456548a21b68d3410c4dbc1abe6b72f7`.
- [src/graders/commits.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/graders/commits.js) — Git blob `5e851e3c44416899b48005ca497dbd5676a1a3b1`.
- [src/graders/docs.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/graders/docs.js) — Git blob `1aeb0795cb5484d7a72af0cd69c9c945a3d9ee4d`.
- [src/graders/security.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/graders/security.js) — Git blob `f86221b05b6c7a7aa66c404443bda961ed9fd435`.
- [src/graders/structure.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/graders/structure.js) — Git blob `d5e189e92c7a4c5e52446ba70e6f5c01118e4579`.
- [src/index.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/index.js) — Git blob `4e2264d1b21ca55561f25c79467525cef673648f`.
- [src/scorer.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/src/scorer.js) — Git blob `bc46a47eaedc014625ee4fe088291607ce1bdde6`.
- [test/smoke.test.js](https://github.com/NickCirv/repo-report-card/blob/1d672e037e985aab1b063cd2c04730af03e7e562/test/smoke.test.js) — Git blob `8a48d3334c1844e987d6ab00d90818c9c5c4ce54`.

## Scope boundary

Capture excludes lockfiles, binary artwork, generated output, vendored dependencies and files above the acquisition size limit. The tree records their existence; no verification claim is made for omitted content. Protected documents and historical records are not replaced.
