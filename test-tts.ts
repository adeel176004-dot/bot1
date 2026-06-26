import { GoogleGenAI, Modality } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Say 'Hello, how are you?'",
      config: {
        responseModalities: ["AUDIO"],
      }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    console.log(parts?.map(p => p.inlineData ? "AUDIO_DATA" : p.text));
  } catch(e) {
    console.error("ERROR", e);
  }
}
run();
