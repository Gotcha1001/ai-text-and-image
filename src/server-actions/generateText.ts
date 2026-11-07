"use server";

import { ai } from "@/lib/gemini";

export interface GeminiPrompt {
  content: string;
  role: "USER" | "ASSISTANT";
}

const SYSTEM_INSTRUCTION = `You are NextGPT, a helpful AI assistant.
Reply directly to the user's latest message with the final answer only.
Never output your reasoning, plans, JSON, tool calls or function calls.
You cannot generate images in this mode. If the user asks for an image, tell them to switch to IMAGE mode.
Use markdown formatting where it helps readability.`;

export async function generateText({
  history,
  prompt,
}: {
  prompt: string;
  history: GeminiPrompt[];
}) {
  try {
    const contents = [
      ...history.map((message) => ({
        role: message.role === "USER" ? "user" : "model",
        parts: [{ text: message.content }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text ?? "No response generated";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
