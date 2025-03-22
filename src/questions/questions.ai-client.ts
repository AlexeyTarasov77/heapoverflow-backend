import { Question } from './entities/question.entity';
import { IAnswerGenerator } from './questions.types';

type LlamaResponse = { response: string };

export class LlamaAPIClient implements IAnswerGenerator {
  private baseUrl: string;
  private defaultOptions: object;
  constructor() {
    this.defaultOptions = {
      model: 'llama3.2',
      stream: false,
    };
    this.baseUrl = 'http://localhost:11434/api';
  }
  generateAnswerForQuestion = async (question: Question): Promise<string> => {
    const resp = await fetch(this.baseUrl + '/generate', {
      method: 'POST',
      body: JSON.stringify({
        ...this.defaultOptions,
        prompt: `Answer the question with short informative answer: ${question.title}`,
      }),
    });
    const data: LlamaResponse = await resp.json();
    return data.response;
  };
}
