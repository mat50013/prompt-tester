export function calculateDiff(expected, actual) {
  if (!expected || !actual) {
    return null;
  }

  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  
  const diff = {
    added: [],
    removed: [],
    modified: [],
    similarity: 0,
  };

  const maxLength = Math.max(expectedLines.length, actualLines.length);
  let matchingLines = 0;

  for (let i = 0; i < maxLength; i++) {
    const expectedLine = expectedLines[i];
    const actualLine = actualLines[i];

    if (expectedLine === actualLine) {
      matchingLines++;
    } else if (!actualLine && expectedLine) {
      diff.removed.push({ line: i, content: expectedLine });
    } else if (actualLine && !expectedLine) {
      diff.added.push({ line: i, content: actualLine });
    } else if (actualLine !== expectedLine) {
      diff.modified.push({
        line: i,
        expected: expectedLine,
        actual: actualLine,
      });
    }
  }

  diff.similarity = maxLength > 0 ? (matchingLines / maxLength) * 100 : 100;

  return diff;
}

export function formatDiffForDisplay(diff) {
  if (!diff) return [];

  const lines = [];

  diff.removed.forEach(({ line, content }) => {
    lines.push({
      type: 'removed',
      lineNumber: line + 1,
      content: `- ${content}`,
    });
  });

  diff.added.forEach(({ line, content }) => {
    lines.push({
      type: 'added',
      lineNumber: line + 1,
      content: `+ ${content}`,
    });
  });

  diff.modified.forEach(({ line, expected, actual }) => {
    lines.push({
      type: 'removed',
      lineNumber: line + 1,
      content: `- ${expected}`,
    });
    lines.push({
      type: 'added',
      lineNumber: line + 1,
      content: `+ ${actual}`,
    });
  });

  return lines.sort((a, b) => a.lineNumber - b.lineNumber);
}