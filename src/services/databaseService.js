import Dexie from 'dexie';

class DatabaseService extends Dexie {
  constructor() {
    super('PromptTesterDB');

    this.version(1).stores({
      testCases: 'id, name, createdAt, updatedAt',
      results: '[testCaseId+modelId], testCaseId, modelId, timestamp',
      grades: '[testCaseId+modelId], testCaseId, modelId, score',
      settings: 'key, value',
    });

    // Version 2 to add feedback field
    this.version(2).stores({
      testCases: 'id, name, createdAt, updatedAt',
      results: '[testCaseId+modelId], testCaseId, modelId, timestamp',
      grades: '[testCaseId+modelId], testCaseId, modelId, score, method, feedback, comments',
      settings: 'key, value',
    });

    this.testCases = this.table('testCases');
    this.results = this.table('results');
    this.grades = this.table('grades');
    this.settings = this.table('settings');
  }

  async saveTestCase(testCase) {
    return await this.testCases.put(testCase);
  }

  async getAllTestCases() {
    return await this.testCases.toArray();
  }

  async deleteTestCase(id) {
    await this.transaction('rw', this.testCases, this.results, this.grades, async () => {
      await this.testCases.delete(id);
      await this.results.where('testCaseId').equals(id).delete();
      await this.grades.where('testCaseId').equals(id).delete();
    });
  }

  async saveResult(result) {
    return await this.results.put(result);
  }

  async getResultsForTestCase(testCaseId) {
    return await this.results.where('testCaseId').equals(testCaseId).toArray();
  }

  async getAllResults() {
    return await this.results.toArray();
  }

  async saveGrade(grade) {
    console.log('DatabaseService - Saving grade:', grade);
    console.log('DatabaseService - Grade feedback:', grade.feedback);
    const result = await this.grades.put(grade);
    console.log('DatabaseService - Grade saved, result:', result);
    return result;
  }

  async getGradesForTestCase(testCaseId) {
    return await this.grades.where('testCaseId').equals(testCaseId).toArray();
  }

  async getAllGrades() {
    const grades = await this.grades.toArray();
    console.log('DatabaseService - Loading all grades:', grades);
    grades.forEach((grade) => {
      console.log(`Grade ${grade.testCaseId}/${grade.modelId} feedback:`, grade.feedback);
    });
    return grades;
  }

  async saveSetting(key, value) {
    return await this.settings.put({ key, value });
  }

  async getSetting(key) {
    const setting = await this.settings.get(key);
    return setting?.value;
  }

  async exportAllData() {
    const testCases = await this.getAllTestCases();
    const results = await this.getAllResults();
    const grades = await this.getAllGrades();

    return {
      testCases,
      results,
      grades,
      exportDate: new Date().toISOString(),
    };
  }

  async importData(data) {
    await this.transaction('rw', this.testCases, this.results, this.grades, async () => {
      if (data.testCases) {
        await this.testCases.bulkPut(data.testCases);
      }
      if (data.results) {
        await this.results.bulkPut(data.results);
      }
      if (data.grades) {
        await this.grades.bulkPut(data.grades);
      }
    });
  }

  async clearAllData() {
    await this.transaction('rw', this.testCases, this.results, this.grades, async () => {
      await this.testCases.clear();
      await this.results.clear();
      await this.grades.clear();
    });
  }
}

export const db = new DatabaseService();
