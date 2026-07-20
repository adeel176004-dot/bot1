import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  try {
    const session = await model.live.connect({ config: {} });
    console.log("Session methods:", Object.keys(session));
    session.close();
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
test();
