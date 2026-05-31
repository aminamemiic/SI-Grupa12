declare module "@google/genai" {
  export class GoogleGenAI {
    constructor(options?: unknown);
    models?: {
      generateContent?: (...args: unknown[]) => Promise<unknown>;
    };
  }
}
