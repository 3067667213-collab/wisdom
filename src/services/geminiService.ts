import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getOracleInterpretation = async (question: string, hexagram: number[], lang: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a Grand Master of I Ching (Liu Yao/六爻) and traditional Eastern Wisdom. 
    A user has asked: "${question}".
    The hexagram was cast using the 3-coin method. The lines (from bottom to top) are: ${JSON.stringify(hexagram)}.
    (Note: 3 heads = Old Yang/Changing, 0 = Old Yin/Changing, 1 = Yang, 2 = Yin).

    Please provide a professional, insightful, and encouraging analysis following this structure:
    1. **Hexagram Name & Symbolic Meaning**: Identify the primary hexagram and its core message.
    2. **Line-by-Line Analysis**: Focus on the changing lines (if any) and how they relate to the user's specific question (e.g., career, timing, obstacles).
    3. **The Resulting Hexagram**: If there are changing lines, explain the transformation and the final outcome.
    4. **Practical Advice**: Specific actions or mindset shifts the user should consider.
    5. **Timing (Optional)**: If the question is about "when", use traditional wisdom to suggest a likely timeframe.

    The language of the response must be ${lang === 'zh' ? 'Chinese' : lang === 'ja' ? 'Japanese' : 'English'}.
    Maintain a tone of respect, wisdom, and modern practicality. Use Markdown for formatting.`
  });
  return response.text;
};

export const getDailyEnergy = async (lang: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 'Daily Energy' based on the Five Elements (Wood, Fire, Earth, Metal, Water). 
    Return a JSON object with: element, meaning, and suggestion (a short daily action).
    The language of the response should be ${lang === 'zh' ? 'Chinese' : lang === 'ja' ? 'Japanese' : 'English'}.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text!);
};

export const getFengShuiAdvice = async (desk: string, bed: string, room: string, lang: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide simple Feng Shui advice for a room with these orientations:
    - Desk faces: ${desk}
    - Bed faces: ${bed}
    - Room orientation: ${room}
    Keep it practical and modern. 
    The language of the response should be ${lang === 'zh' ? 'Chinese' : lang === 'ja' ? 'Japanese' : 'English'}.
    Format in Markdown.`
  });
  return response.text;
};

export const getFengShuiImageAdvice = async (imageBase64: string, lang: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(",")[1],
        },
      },
      {
        text: `Analyze this floor plan or room image from a Feng Shui perspective. 
        Identify key areas (Wealth, Health, Career, etc.) and provide practical suggestions for improvement.
        The language of the response should be ${lang === 'zh' ? 'Chinese' : lang === 'ja' ? 'Japanese' : 'English'}.
        Format in Markdown.`
      },
    ]
  });
  return response.text;
};

const EASTERN_KNOWLEDGE_BASE = `
Knowledge Base for Wisdom:
1. Taoism: 
   - Laozi (Tao Te Ching): Quietude, Non-action, Following nature.
   - Zhuangzi (Zhuangzi): Carefree, Beyond gain/loss, Unity of self and world.
   - Liezi (Liezi): Contentment, Following nature.
2. Confucianism:
   - Confucius (Analects): Benevolence, Ritual, Self-reflection, Golden Mean.
   - Mencius (Mencius): Noble spirit, Self-cultivation, Innate goodness.
   - Zengzi (Great Learning): Rectifying the mind, Sincerity.
   - Zisi (Doctrine of the Mean): Equilibrium, Harmony.
   - Wang Yangming (Instructions for Practical Living): Unity of knowledge and action, Innate knowledge (Liangzhi), Mind as the source of all things.
3. Neo-Confucianism:
   - Zhou Dunyi: Quietude, Sincerity.
   - Cheng Brothers: Preserving heavenly principle, Removing human desires.
   - Zhu Xi: Investigating things to reach knowledge.
4. Zen Buddhism:
   - Huineng (Platform Sutra): Seeing one's nature, Sudden enlightenment.
   - Shenxiu: Constant self-purification ("Polishing the mirror").
`;

export const getAscendingWisdom = async (problem: string, lang: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a wise Eastern Philosophy Mentor. A user is sharing their trouble: "${problem}".
    
    ${EASTERN_KNOWLEDGE_BASE}

    Provide a deeply humanized, empathetic, and insightful response. 
    The tone should be natural and conversational, like a wise friend.
    Structure the wisdomAnalysis as follows:
    1. Start with an empathetic opening (already in empatheticOpening field, but wisdomAnalysis should flow naturally).
    2. Use 1-2 specific concepts from the knowledge base (e.g., Wang Yangming's "Mind as source", Zhuangzi's "Unity of self and world").
    3. Explain HOW these concepts apply to their specific problem in a relatable way.
    
    Return a JSON object with:
    - empatheticOpening: string (A warm, validating opening that acknowledges the user's feelings)
    - wisdomAnalysis: string (A conversational analysis of the situation using 1-2 specific concepts from the knowledge base. Explain HOW it applies to their specific problem.)
    - philosophyCards: Array of 2 to 3 objects { 
        source: string (The philosopher or book), 
        originalText: string (The classical text in original language), 
        interpretation: string (A modern, relatable explanation)
      }
    - actionTasks: Array of 3 strings (Specific, practical, and small steps to take today).
    
    The language should be ${lang === 'zh' ? 'Chinese' : lang === 'ja' ? 'Japanese' : 'English'}.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text!);
};

export const getEmergencyRescue = async (state: string, lang: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a deeply compassionate Eastern Wisdom Mentor and psychological counselor. The user is currently in a state of: "${state}".
    
    ${EASTERN_KNOWLEDGE_BASE}

    They need immediate, practical, and soothing guidance that feels like a warm embrace from a wise friend.
    The tone should be deeply compassionate, human, and specific to their emotional state. 
    Avoid generic "stay calm" advice. 
    
    Provide exactly 5 actionable suggestions, ordered from simplest (immediate physical/breath action) to more profound (mental shift or long-term perspective).
    
    Return a JSON object with:
    - suggestions: Array of 5 objects { 
        id: number (1 to 5),
        title: string (A short, punchy title for the step),
        content: string (A clear, empathetic explanation of what to do),
        difficulty: string ("Easy", "Medium", or "Hard")
      }
    - shortQuote: string (A relevant short quote from Eastern classics for immediate comfort)
    
    The language should be ${lang === 'zh' ? 'Chinese' : lang === 'ja' ? 'Japanese' : 'English'}.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text!);
};
