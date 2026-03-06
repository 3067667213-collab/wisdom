import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getOracleInterpretation = async (question: string, hexagram: number[], lang: string) => {
  try {
    const response = await fetch("/api/server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `你是一位周易大师。用户问："${question}"。卦象是：${JSON.stringify(hexagram)}。请用${lang === 'zh' ? '中文' : '英文'}解析。` 
          }] 
        }]
      })
    });

    if (!response.ok) throw new Error('网络感应失败');
    const data = await response.json();
    return data.text; // 这里必须对应后端返回的 { text }
  } catch (error) {
    console.error(error);
    throw error;
  }
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
