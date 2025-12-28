
import { GoogleGenAI } from "@google/genai";
import { UserStats, UserProfile } from "../types";

export const generateOracleAdvice = async (stats: UserStats, profile: UserProfile): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a wise RPG Oracle and Mentor in a medieval setting. 
    The hero's name is ${profile.name} (age ${profile.age}), who belongs to the ${profile.characterClassName} class.
    
    Here are their current life stats (0-100 range usually):
    - Physical/Body: ${stats.Physical}
    - Intellect: ${stats.Intellect}
    - Vitality/Health: ${stats.Health}
    - Mastery/Professional: ${stats.Professional}
    - Current Level: ${stats.level}

    Analyze their strongest and weakest areas based on these numbers.
    Provide a short, immersive, fantasy-themed piece of advice (max 2 sentences) in Russian.
    Address them directly by name and acknowledge their chosen path (${profile.characterClassName}).
    Encourage them to work on their weakest stat or praise their highest achievement.
    Do not use markdown formatting like bold or italics. Keep it raw text.
    Speak with gravity and ancient wisdom.
    Language: Russian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Туман скрывает будущее, герой...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Связь с астральным планом прервана. Храни свою дисциплину сам.";
  }
};
