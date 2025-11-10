import axios from 'axios';
import { db } from './databaseService';
import store from "../store/index.js";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = import.meta.env.VITE_OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';

class OpenRouterService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getClientConfig() {
    const enabledSelfHosted = store.getState().ui.enabledSelfHosted;
    const llmFrogPath = await db.getSetting('llmFrogPath');

    const isDevelopment = import.meta.env.VITE_DEV;
    const baseURL = isDevelopment ? '/api/local/v1' : llmFrogPath;

    if (enabledSelfHosted && llmFrogPath) {
      return {
        isLocal: true,
        baseURL,
      };
    }

    return {
      isLocal: false,
      baseURL,
    };
  }

  async getClient() {
    const config = await this.getClientConfig();

    if (config.isLocal) {
      return axios.create({
        baseURL: config.baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return this.client;
  }

  async getAvailableModels(searchQuery = 'gguf', limit = 500) {
    try {
      const config = await this.getClientConfig();
      const client = await this.getClient();

      console.log(config);
      if (config.isLocal) {
        const response = await client.get('/models/search', {
          params: {
            q: searchQuery,
          },
        });

        if (response.data.models && Array.isArray(response.data.models)) {
          return response.data.models.map(model => ({
            id: model.id,
            name: model.name,
            description: `${model.quantization} - ${model.repo}`,
            contextLength: 0,
            pricing: { prompt: '0', completion: '0' },
            quantization: model.quantization,
            repo: model.repo,
            file: model.file,
            downloads: model.downloads,
            likes: model.likes,
            tags: model.tags,
          }));
        } else {
          return [{
            id: 'local-model',
            name: 'Local Model',
            description: 'Self-hosted LLM',
            contextLength: 4096,
            pricing: { prompt: '0', completion: '0' },
          }];
        }
      } else {
        const response = await client.get('/models');
        return response.data.data.map(model => ({
          id: model.id,
          name: model.name || model.id,
          description: model.description,
          contextLength: model.context_length,
          pricing: model.pricing,
        }));
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch available models');
    }
  }

  async runTest(testCase, modelId) {
    const startTime = Date.now();

    try {
      const client = await this.getClient();
      const messages = this.buildMessages(testCase);

      const response = await client.post('/chat/completions', {
        model: modelId,
        messages,
        temperature: 0.7,
      });

      const output = response.data.choices[0].message.content;
      const tokensUsed = response.data.usage?.total_tokens || 0;
      const latency = Date.now() - startTime;

      return { output, tokensUsed, latency };
    } catch (error) {
      console.error('Error running test:', error);
      throw new Error(`Failed to run test with ${modelId}: ${error.message}`);
    }
  }

  async runRoundTripTest(testCase, modelId, translationModel = 'openai/gpt-4.1') {
    const startTime = Date.now();

    try {
      const translatedPrompt = await this.translateToEnglish(
          testCase.userPrompt,
          testCase.sourceText,
          translationModel
      );

      const translatedTestCase = {
        ...testCase,
        userPrompt: translatedPrompt.userPrompt,
        sourceText: translatedPrompt.sourceText,
      };

      const client = await this.getClient();
      const messages = this.buildMessages(translatedTestCase);

      const response = await client.post('/chat/completions', {
        model: modelId,
        messages,
        temperature: 0.7,
      });

      const englishOutput = response.data.choices[0].message.content;

      const dutchOutput = await this.translateToDutch(englishOutput, translationModel);

      const tokensUsed = response.data.usage?.total_tokens || 0;
      const latency = Date.now() - startTime;

      const result = {
        output: englishOutput,
        roundTripOutput: dutchOutput,
        translatedPrompt: translatedPrompt.userPrompt,
        tokensUsed,
        latency,
      };

      console.log('Round trip test result:', result);

      return result;
    } catch (error) {
      console.error('Error running round-trip test:', error);
      throw new Error(`Failed to run round-trip test with ${modelId}: ${error.message}`);
    }
  }

  async autoGrade({ testCase, result }) {
    try {
      const gradingPrompt = `
You are an expert evaluator. You will be given a test case with a prompt and the model's response. Evaluate the quality of the response.

Test Case Information:
System Prompt: ${testCase.systemPrompt || 'None'}
User Prompt: ${testCase.userPrompt}
Source Text: ${testCase.sourceText || 'None'}
Expected Result: ${testCase.expectedResult || 'None provided'}

Model Response: ${result.output}

Please evaluate this response and provide:
1. A numeric score from 0-100
2. Brief feedback explaining the score
3. Key strengths and weaknesses

Format your response as:
Score: [number]
Feedback: [your detailed feedback]`;

      const client = await this.getClient();

      const response = await client.post('/chat/completions', {
        model: 'openai/gpt-4.1',
        messages: [
          { role: 'user', content: gradingPrompt }
        ],
        temperature: 0.3,
      });

      const gradeResponse = response.data.choices[0].message.content;

      console.log('OpenRouter autoGrade - Raw response:', gradeResponse);

      const scoreMatch = gradeResponse.match(/Score:\s*(\d{1,3})/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

      const gradeResult = {
        score,
        feedback: gradeResponse,
        method: 'automatic',
        timestamp: new Date().toISOString(),
      };

      console.log('OpenRouter autoGrade - Returning:', gradeResult);

      return gradeResult;
    } catch (error) {
      console.error('Error auto-grading:', error);
      throw new Error('Failed to auto-grade response');
    }
  }

  async translateToEnglish(userPrompt, sourceText, modelId) {
    try {
      const translationPrompt = `Translate the following Dutch text to English. Maintain the exact meaning and tone.

Dutch text: ${userPrompt}
${sourceText ? `\nSource material: ${sourceText}` : ''}

Provide only the English translation without any explanation.`;

      const client = await this.getClient();

      const response = await client.post('/chat/completions', {
        model: modelId,
        messages: [
          { role: 'user', content: translationPrompt }
        ],
        temperature: 0.3,
      });

      const translation = response.data.choices[0].message.content;

      if (sourceText) {
        const parts = translation.split('\nSource material:');
        return {
          userPrompt: parts[0].trim(),
          sourceText: parts[1]?.trim() || '',
        };
      }

      return {
        userPrompt: translation.trim(),
        sourceText: '',
      };
    } catch (error) {
      console.error('Error translating to English:', error);
      throw new Error('Failed to translate to English');
    }
  }

  async translateToDutch(text, modelId) {
    try {
      const translationPrompt = `Translate the following English text to Dutch. Maintain the exact meaning and tone.

English text: ${text}

Provide only the Dutch translation without any explanation.`;

      const client = await this.getClient();

      const response = await client.post('/chat/completions', {
        model: modelId,
        messages: [
          { role: 'user', content: translationPrompt }
        ],
        temperature: 0.3,
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error translating to Dutch:', error);
      throw new Error('Failed to translate to Dutch');
    }
  }

  buildMessages(testCase) {
    const messages = [];
    
    if (testCase.systemPrompt) {
      messages.push({ role: 'system', content: testCase.systemPrompt });
    }
    
    let userContent = testCase.userPrompt;
    if (testCase.sourceText) {
      userContent = `${testCase.userPrompt}\n\nSource text:\n${testCase.sourceText}`;
    }
    
    messages.push({ role: 'user', content: userContent });
    
    return messages;
  }
}

export const openRouterService = new OpenRouterService();