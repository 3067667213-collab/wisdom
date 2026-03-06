// 统一请求函数，直接走你项目的后端 API 路由
const callApi = async (data: any) => {
  const response = await fetch("/api/server", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('网络感应失败');
  const result = await response.json();
  return result.text;
};

export const getOracleInterpretation = async (question: string, hexagram: number[], lang: string) => {
  return callApi({
    contents: [{ parts: [{ text: `你是一位周易大师。用户问："${question}"。卦象是：${JSON.stringify(hexagram)}。请用${lang === 'zh' ? '中文' : '英文'}解析。` }] }]
  });
};

export const getDailyEnergy = async (lang: string) => {
  return callApi({
    contents: [{ parts: [{ text: `Generate Daily Energy (Five Elements). Language: ${lang}.` }] }]
  });
};

export const getFengShuiAdvice = async (desk: string, bed: string, room: string, lang: string) => {
  return callApi({
    contents: [{ parts: [{ text: `Feng Shui advice. Desk: ${desk}, Bed: ${bed}, Room: ${room}. Language: ${lang}.` }] }]
  });
};

export const getFengShuiImageAdvice = async (imageBase64: string, lang: string) => {
  return callApi({
    image: imageBase64,
    contents: [{ parts: [{ text: `Analyze room Feng Shui. Language: ${lang}.` }] }]
  });
};

// 补齐 App.tsx 报错里提到的这个缺失函数
export const getAscendingWisdom = async (lang: string) => {
  return callApi({
    contents: [{ parts: [{ text: `Provide one sentence of Eastern wisdom. Language: ${lang}.` }] }]
  });
};
