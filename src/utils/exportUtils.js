import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export async function exportToExcel(data) {
  const { testCases, results, grades } = data;

  const workbook = XLSX.utils.book_new();

  const testCasesData = testCases.map((tc) => ({
    'Test ID': tc.id,
    Name: tc.name,
    'System Prompt': tc.systemPrompt,
    'User Prompt': tc.userPrompt,
    'Source Text': tc.sourceText,
    'Expected Result': tc.expectedResult,
    Created: new Date(tc.createdAt).toLocaleString(),
    Updated: new Date(tc.updatedAt).toLocaleString(),
  }));

  const resultsData = [];
  Object.entries(results).forEach(([testCaseId, modelResults]) => {
    Object.entries(modelResults).forEach(([modelId, result]) => {
      resultsData.push({
        'Test ID': testCaseId,
        Model: modelId,
        Output: result.output,
        'Round Trip Output': result.roundTripOutput || '',
        'Tokens Used': result.tokensUsed,
        'Latency (ms)': result.latency,
        Status: result.status,
        Error: result.error || '',
        Timestamp: new Date(result.timestamp).toLocaleString(),
      });
    });
  });

  const gradesData = [];
  Object.entries(grades).forEach(([testCaseId, modelGrades]) => {
    Object.entries(modelGrades).forEach(([modelId, grade]) => {
      gradesData.push({
        'Test ID': testCaseId,
        Model: modelId,
        Score: grade.score,
        Method: grade.method,
        Comments: grade.comments || grade.feedback || '',
        'Graded At': new Date(grade.timestamp).toLocaleString(),
      });
    });
  });

  const testCasesSheet = XLSX.utils.json_to_sheet(testCasesData);
  XLSX.utils.book_append_sheet(workbook, testCasesSheet, 'Test Cases');

  if (resultsData.length > 0) {
    const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Results');
  }

  if (gradesData.length > 0) {
    const gradesSheet = XLSX.utils.json_to_sheet(gradesData);
    XLSX.utils.book_append_sheet(workbook, gradesSheet, 'Grades');
  }

  const summaryData = testCases.map((tc) => {
    const row = {
      'Test Name': tc.name,
    };

    const testResults = results[tc.id] || {};
    const testGrades = grades[tc.id] || {};

    Object.keys(testResults).forEach((modelId) => {
      const result = testResults[modelId];
      const grade = testGrades[modelId];

      row[`${modelId} - Status`] = result.status;
      row[`${modelId} - Score`] = grade?.score || 'N/A';
      row[`${modelId} - Similarity`] = result.diff?.similarity
        ? `${result.diff.similarity.toFixed(1)}%`
        : 'N/A';
    });

    return row;
  });

  if (summaryData.length > 0) {
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const filename = `prompt-test-results-${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
}

export async function exportToCSV(data) {
  const { testCases, results, grades } = data;

  const rows = ['Test Name,Model,Status,Output,Score,Similarity,Tokens,Latency'];

  testCases.forEach((tc) => {
    const testResults = results[tc.id] || {};
    const testGrades = grades[tc.id] || {};

    Object.entries(testResults).forEach(([modelId, result]) => {
      const grade = testGrades[modelId];
      const similarity = result.diff?.similarity?.toFixed(1) || 'N/A';

      const row = [
        tc.name,
        modelId,
        result.status,
        `"${result.output?.replace(/"/g, '""') || ''}"`,
        grade?.score || 'N/A',
        similarity,
        result.tokensUsed || 0,
        result.latency || 0,
      ].join(',');

      rows.push(row);
    });
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `prompt-test-results-${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, filename);
}

export async function exportToJSON(data) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const filename = `prompt-test-export-${new Date().toISOString().split('T')[0]}.json`;
  saveAs(blob, filename);
}
