import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // 只准许 POST 请求
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { contents } = req.body; // 接收前端发来的问题
    const result = await model.generateContent(contents);
    const response = await result.response;
    const text = response.text();
    
    // 把结果传回给前端
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: "AI 感应失败", details: error });
  }
}
