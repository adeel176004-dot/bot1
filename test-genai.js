import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { apiVersion: 'v1alpha' } });
async function run() {
    const session = await ai.live.connect({ 
        model: 'gemini-2.0-flash', 
        config: { responseModalities: ["AUDIO"] },
        callbacks: { 
            onmessage: (msg) => {
                console.log('MSG', JSON.stringify(Object.keys(msg)));
                if (msg.serverContent) {
                   console.log('Server content received');
                }
            },
            onerror: (e) => console.log('ERROR', e),
            onclose: (e) => console.log('CLOSE', e)
        }
    });
    session.sendClientContent({ turns: [{ role: "user", parts: [{ text: "Hello" }] }], turnComplete: true });
    await new Promise(r => setTimeout(r, 5000));
}
run();
