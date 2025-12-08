import { GoogleGenAI } from "@google/genai";
import { UserStats } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateOracleAdvice = async (stats: UserStats): Promise<string> => {
  const ai = getClient();
  if (!ai) return "The Oracle is silent (Missing API Key).";

  const prompt = `
    You are a wise RPG Dungeon Master or Mentor. The user is a hero tracking their real-life stats.
    Here are their current stats:
    - Physical Strength: ${stats.Physical}
    - Intellect/Mana: ${stats.Intellect}
    - Health/Vitality: ${stats.Health}
    - Professional Skills: ${stats.Professional}
    - Current Level: ${stats.level}

    Analyze their strongest and weakest areas.
    Provide a short, immersive, fantasy-themed piece of advice (max 2 sentences) encouraging them to improve their weakest stat or praising their strongest.
    Do not use markdown formatting like bold or italics. Keep it raw text.
    Speak as if they are a character in a game.
    Language: Russian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "The mists obscure the future...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The connection to the ethereal plane is broken.";
  }
};
