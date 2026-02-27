const WEIGHTS = {
  commits: 0.20,
  docs: 0.20,
  structure: 0.25,
  security: 0.20,
  ci: 0.15,
};

const CATEGORY_LABELS = {
  commits: 'Commit Hygiene',
  docs: 'Documentation',
  structure: 'Code Structure',
  security: 'Security',
  ci: 'CI/CD',
};

export function scoreToGrade(score) {
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

export function gradeColor(grade) {
  if (grade.startsWith('A')) return 'green';
  if (grade.startsWith('B')) return 'cyan';
  if (grade.startsWith('C')) return 'yellow';
  if (grade.startsWith('D')) return 'red';
  return 'redBright';
}

export function calculateOverall(grades) {
  const overall = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + (grades[key]?.score ?? 0) * weight;
  }, 0);

  const score = Math.round(overall);
  const grade = scoreToGrade(score);

  // Collect all findings that indicate issues (negatives) sorted by impact
  const allIssues = [];
  for (const [key, result] of Object.entries(grades)) {
    if (!result) continue;
    const weight = WEIGHTS[key] ?? 0;
    for (const finding of result.findings) {
      // Heuristic: findings without "present", "found", "Active", "Good", digits-only positive signals are issues
      const isPositive = /present|found|Active|Good|configured|covered|detected|located|\d+%/.test(finding) &&
        !/missing|No |low|short|sparse|penalty|NEVER|add|consider|risk|detected.*potential|potential/i.test(finding);
      if (!isPositive) {
        allIssues.push({ category: CATEGORY_LABELS[key], finding, weight });
      }
    }
  }

  // Sort by weight (higher weight category issues first), take top 3
  allIssues.sort((a, b) => b.weight - a.weight);
  const topIssues = allIssues.slice(0, 3).map(i => `[${i.category}] ${i.finding}`);

  return { score, grade, grades, topIssues, weights: WEIGHTS, labels: CATEGORY_LABELS };
}
