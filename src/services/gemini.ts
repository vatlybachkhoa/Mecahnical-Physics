import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePhysicsProblem(topic: string, difficulty: string) {
  const prompt = `You are a university physics professor. Generate a new, unique physics problem about "${topic}" at a "${difficulty}" difficulty level.
The problem should have a random but physically realistic context and numbers.
Provide the problem statement, and then provide a detailed, step-by-step solution.
Format the output in Markdown, using LaTeX for all math formulas (e.g., $F = ma$ for inline, $$E = mc^2$$ for block).

Return a JSON object with two fields:
- "problem": The problem statement in Markdown.
- "solution": The step-by-step solution in Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problem: {
              type: Type.STRING,
              description: "The physics problem statement in Markdown with LaTeX.",
            },
            solution: {
              type: Type.STRING,
              description: "The step-by-step solution in Markdown with LaTeX.",
            },
          },
          required: ["problem", "solution"],
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error generating problem:", error);
    throw error;
  }
}
