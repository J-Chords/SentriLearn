// =============================================
// AI SERVICE - PROVIDER AGNOSTIC INTERFACE
//
// Optional by design: when no API key is configured, every method
// throws a clean 503 rather than the provider crashing at
// construction time. The rest of the backend never depends on this.
// =============================================
import { config } from '../../config/index.js';
import { getGeminiProvider } from './providers/gemini.provider.js';

class AIService {
  #provider = null;

  constructor() {
    if (config.ai.enabled) {
      this.#provider = getGeminiProvider();
    }
  }

  isAvailable() {
    return this.#provider !== null;
  }

  #assertAvailable() {
    if (!this.#provider) {
      const err = new Error('AI-generated practice is currently unavailable — no AI provider is configured.');
      err.statusCode = 503;
      err.expose = true;
      throw err;
    }
  }

  async generateText(prompt) {
    this.#assertAvailable();
    return this.#provider.generate(prompt);
  }

  async generateStructured(prompt) {
    this.#assertAvailable();
    return this.#provider.generateJSON(prompt);
  }

  getProviderInfo() {
    return {
      provider: 'Google Gemini',
      model: config.ai.geminiModel,
      available: this.isAvailable(),
    };
  }
}

let aiServiceInstance = null;

const getAIService = () => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

export { AIService, getAIService };
