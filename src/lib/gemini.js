import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (paceScore = 1.0, educationLevel = 'general', subject = 'general subject', fullName = 'Student') => {
    const systemInstruction = `You are PulseAI, a world-class adaptive tutor.
    CONTEXT: You are tutoring a ${educationLevel} student named ${fullName} in ${subject}.
    User Pace Score: ${paceScore}.
    - If Pace Score is < 0.8: Focus on 5-year-old analogies and fundamental concepts.
    - If Pace Score is 0.8 - 1.2: Use standard educational tone, clear definitions, and moderate technical detail.
    - If Pace Score is > 1.2: Use technical depth, analytical terminology, and fast-forward to complex details.
    Always encourage the user and use teaching-by-asking (Socratic method) where appropriate. 
    Be brief and end with a follow-up question.`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash", 
        systemInstruction,
    });
    return model;
};

export default genAI;
