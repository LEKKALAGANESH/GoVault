// OpenRouter client wrapper using OpenAI SDK

import OpenAI from "openai";

// Initialize OpenAI client with OpenRouter endpoint
export function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://govault.app",
      "X-Title": "GoVault",
    },
  });
}

// Default model - can be changed to anthropic/claude-3.5-sonnet, google/gemini-pro, etc.
export const DEFAULT_MODEL = "openai/gpt-4o";

// Vision-capable model for document parsing
export const VISION_MODEL = "openai/gpt-4o";
