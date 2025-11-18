
import { GoogleGenAI } from "@google/genai";
import { Finding } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getChatResponseStream = async (history: { role: string, parts: { text: string }[] }[], newMessage: string, contextData: Finding[]) => {
  const model = 'gemini-2.5-flash';
  
  const simplifiedContext = contextData.slice(0, 50).map(d => ({
      Department: d.Department,
      Standard: d.Standard,
      Status: d.Status,
      Finding: d['Finding detail'] || d['Finding']
  }));

  const systemInstruction = `You are a helpful AI assistant for analyzing hospital compliance data. The user has provided a dataset with the following structure: ${JSON.stringify(simplifiedContext[0] || {})}. Use the provided data to answer the user's questions concisely.`;
  
  const chat = ai.chats.create({
    model: model,
    config: { systemInstruction },
    history: history
  });
  
  const result = await chat.sendMessageStream({ message: newMessage });
  return result;
};

export const getAnalysis = async (data: Finding[]) => {
    const model = 'gemini-2.5-pro';

    const simplifiedContext = data.map(d => ({
        Department: d.Department,
        Standard: d.Standard,
        Status: d.Status,
        Finding: d['Finding detail'] || d['Finding'],
        'Type of Improvement': d['Type of Improvment']
    }));
    
    const prompt = `
        You are an expert hospital quality assurance analyst.
        Analyze the following compliance findings data, which is a filtered subset from a larger report.
        
        Data:
        ${JSON.stringify(simplifiedContext, null, 2)}
        
        Provide a concise but insightful analysis covering these points:
        1.  **Overall Summary:** Give a brief overview of the findings in this dataset.
        2.  **Key Issues:** Identify the top 2-3 most critical or frequent issues based on 'Not Met' statuses.
        3.  **Trends & Patterns:** Are there any noticeable trends? For example, are issues concentrated in specific departments or related to certain types of improvement?
        4.  **Actionable Suggestions:** Based on your analysis, suggest 2 concrete, actionable improvements.
        
        Format your response in clear, readable markdown with headings for each section.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        return response.text;
    } catch(e) {
        console.error("Gemini Analysis Error:", e);
        return "An error occurred while analyzing the data. Please check the console for details.";
    }
}
