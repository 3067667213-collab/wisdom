import { GoogleGenerativeAI } from "@google/generative-ai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
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
    return data.text;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDailyEnergy = async (lang: string) => {
  try {
    const response = await fetch("/api/server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate a 'Daily Energy' based on the Five Elements. Return JSON: {element, meaning, suggestion}. Language: ${lang}.` }] }]
      })
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
