"use server";
import { ai } from "@/lib/gemini";

export interface GeminiPrompt {
  content: string;
  role: "USER" | "ASSISTANT";
}

export async function generateText({
  history,
  prompt,
}: {
  prompt: string;
  history: GeminiPrompt[];
}) {
  try {
    // first message
    if (history.length === 0) {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });

      return response.text ?? "No response generated";
    }

    const contents = [
      ...history.map((message) => ({
        role: message.role === "USER" ? "user" : "model",
        parts: [{ text: message.content }],
      })),
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
    });

    return aiResponse.text ?? "No response generated";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
