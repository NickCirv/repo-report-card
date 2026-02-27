export { gradeCommits } from './graders/commits.js';
export { gradeDocs } from './graders/docs.js';
export { gradeStructure } from './graders/structure.js';
export { gradeSecurity } from './graders/security.js';
export { gradeCI } from './graders/ci.js';
export { calculateOverall, scoreToGrade, gradeColor } from './scorer.js';
export { formatReportCard, formatComparison, formatBadge } from './formatter.js';

import { gradeCommits } from './graders/commits.js';
import { gradeDocs } from './graders/docs.js';
import { gradeStructure } from './graders/structure.js';
import { gradeSecurity } from './graders/security.js';
import { gradeCI } from './graders/ci.js';
import { calculateOverall } from './scorer.js';

export async function gradeRepo(repoPath) {
  const grades = {
    commits: gradeCommits(repoPath),
    docs: gradeDocs(repoPath),
    structure: gradeStructure(repoPath),
    security: gradeSecurity(repoPath),
    ci: gradeCI(repoPath),
  };
  return calculateOverall(grades);
}
