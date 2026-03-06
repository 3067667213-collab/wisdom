// 这里的代码不再直接依赖 Google 库，而是通过 fetch 访问你自己的后端
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

export const getFengShuiAdvice = async (desk: string, bed: string, room: string, lang: string) => {
  try {
    const response = await fetch("/api/server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Provide Feng Shui advice. Desk: ${desk}, Bed: ${bed}, Room: ${room}. Language: ${lang}.` }] }]
      })
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFengShuiImageAdvice = async (imageBase64: string, lang: string) => {
  try {
    const response = await fetch("/api/server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageBase64,
        contents: [{ parts: [{ text: `Analyze this room image for Feng Shui. Language: ${lang}.` }] }]
      })
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
