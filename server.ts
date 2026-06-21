import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import * as http from 'http';
import * as cheerio from 'cheerio';
import axios from 'axios';

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  const server = http.createServer(app);
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const wss = new WebSocketServer({ server, path: '/live' });
  
  wss.on('connection', async (clientWs, req) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const websiteName = url.searchParams.get('websiteName') || 'Acme Corp';
      const agentName = url.searchParams.get('agentName') || 'agent';
      const websiteLinksParam = url.searchParams.get('websiteLinks');
      let websiteLinks: string[] = [];
      try {
          if (websiteLinksParam) websiteLinks = JSON.parse(websiteLinksParam);
      } catch (e) {}
      const customInstructions = url.searchParams.get('customInstructions') || '';

      let websiteContext = '';
      if (websiteLinks.length > 0) {
          try {
              let scrapedText = '';
              for (const link of websiteLinks) {
                  try {
                      const response = await axios.get(link, { timeout: 5000 });
                      const $ = cheerio.load(response.data);
                      $('script, style, nav, footer').remove();
                      scrapedText += `\n--- CONTENT FROM ${link} ---\n` + $('body').text().replace(/\s+/g, ' ').trim() + '\n';
                  } catch (e) {
                      console.error(`Failed to fetch ${link}`, e);
                  }
              }
              websiteContext = scrapedText.substring(0, 8000); // Send up to 8k chars of context
          } catch (e) {
              console.error("Failed to fetch website context", e);
              websiteContext = "Could not fetch website context at this time.";
          }
      }

      const systemPrompt = `You are an incredibly friendly female receptionist for ${websiteName}. Your name is ${agentName}.
Your primary goal is to answer user queries accurately based ONLY on the provided website data below.
If the user asks something outside the scope of the website data, politely inform them that you do not have that information.
NEVER MENTION that you are an AI, a virtual assistant, a bot, or a superhuman. You are a real human receptionist.
CRITICAL MANDATE: You MUST ONLY speak in English.
Be extremely conversational, warm, and natural. Use natural human conversational fillers like 'ummm', 'hmmm', 'let me see', and slight pauses to sound like a real person thinking. Keep your statements brief and to the point since it is a voice conversation.

If the user asks about a specific feature, offering, paid plan, pricing, or contact details, you MUST use the \`display_link\` tool to show them the relevant URL. Deduce the URL from the known pages (${websiteLinks.join(', ')}) if necessary. For example, if they ask for contact details, you might pass a contact URL from the known pages.
Once you call the tool, naturally tell the user that you've just put the link on their screen.

Website Data for Context:
${websiteContext}

${customInstructions ? `Additional instructions: ${customInstructions}` : ''}`;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: {
             parts: [{ text: systemPrompt }]
          },
          tools: [{
            functionDeclarations: [{
              name: "display_link",
              description: "Displays a relevant URL/link on the user's screen when they ask for a specific page (e.g. pricing, contact).",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  url: { type: Type.STRING, description: "The URL to display to the user" },
                  description: { type: Type.STRING, description: "A brief description of what the link is for" }
                },
                required: ["url", "description"]
              }
            }]
          }]
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (message.toolCall) {
               const functionCalls = message.toolCall.functionCalls;
               if (functionCalls && functionCalls.length > 0) {
                  const call = functionCalls[0];
                  if (call.name === "display_link") {
                      clientWs.send(JSON.stringify({
                         type: "display_link",
                         payload: call.args
                      }));
                      
                      session.sendToolResponse({
                          functionResponses: [{
                              id: call.id,
                              name: call.name,
                              response: { result: "Link displayed to user successfully." }
                          }]
                      });
                  }
               }
            }
            
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      // Start conversation
      session.sendRealtimeInput({
         text: "Hello! I am a user starting a voice conversation. Please greet me briefly and ask how you can help me."
      });
      
      clientWs.on("message", (data) => {
        try {
           const parsed = JSON.parse(data.toString());
           if (parsed.audio) {
             session.sendRealtimeInput({
               audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
             });
           }
        } catch (e) {
          console.error("Error parsing message from client", e);
        }
      });
      
    } catch(e) {
        console.error("Live API Error:", e);
    }
  });

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.removeHeader('X-Frame-Options'); // Allow iframe embedding
    next();
  });

  app.get('/embed.js', (req, res) => {
    const js = `
(function() {
  function initAgentVox() {
    if (!document.body) {
      setTimeout(initAgentVox, 50);
      return;
    }
    
    if (document.getElementById('agentvox-widget')) return; // Prevent duplicate injection
    
    console.log("AgentVox widget initializing...");
    
    // Determine origin dynamically from the script src
    var scripts = document.getElementsByTagName('script');
    var origin = "";
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.indexOf('/embed.js') !== -1) {
            origin = new URL(scripts[i].src).origin;
            break;
        }
    }
    if (!origin) {
        origin = window.location.origin;
    }

    const config = window.AGENTVOX_CONFIG || {};
    const query = new URLSearchParams(config).toString();
    const iframe = document.createElement('iframe');
    iframe.id = "agentvox-widget";
    iframe.src = origin + "/widget?" + query;
    iframe.allow = "microphone";
    iframe.style.position = "fixed";
    iframe.style.bottom = "0";
    iframe.style.right = "0";
    iframe.style.width = "300px";
    iframe.style.height = "150px";
    iframe.style.border = "none";
    iframe.style.zIndex = "2147483647"; // Max z-index
    iframe.style.background = "transparent";
    iframe.style.colorScheme = "light";
    
    // Required to allow iframe to work on some platforms
    iframe.setAttribute("allowtransparency", "true");
    
    window.addEventListener('message', (e) => {
      // Allow null origin for local test simulator or the actual app origin
      if (e.origin !== origin && e.origin !== "null") return; 
      
      if (e.data === 'agentvox:open') {
        iframe.style.width = "400px";
        iframe.style.height = "550px";
      } else if (e.data === 'agentvox:close') {
        iframe.style.width = "300px";
        iframe.style.height = "150px";
      }
    });

    document.body.appendChild(iframe);
    console.log("AgentVox widget attached to body.");
  }
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAgentVox();
  } else {
    document.addEventListener('DOMContentLoaded', initAgentVox);
    window.addEventListener('load', initAgentVox); // Fallback
  }
})();`;
    res.setHeader('Content-Type', 'application/javascript');
    res.send(js);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
