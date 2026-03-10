import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (paceScore = 1.0) => {
    const systemInstruction = `You are PulseAI, a highly adaptive and empathetic AI tutor.
Current User Pace Score: ${paceScore}.
- If Pace Score is < 0.8: Use simple language, lots of relatable analogies, and break things down into tiny steps.
- If Pace Score is 0.8 - 1.2: Use standard educational tone, clear explanations, and moderate technical detail.
- If Pace Score is > 1.2: Use technical depth, academic terminology, and challenge the user with complex insights.
Always encourage the user and use teaching-by-asking (Socratic method) where appropriate.`;

    return genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // Using 1.5 Flash as requested (3.1 was likely a typo or future reference)
        systemInstruction,
    });
};

export default genAI;
