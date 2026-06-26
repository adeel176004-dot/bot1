import express from 'express';
import cors from 'cors';
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
  
  app.use(cors({ origin: '*' }));
  app.options('*', cors({ origin: '*' }));
  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options'); // Allow iframe embedding
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    next();
  });

  app.use(express.json());

  const server = http.createServer(app);
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  app.post('/api/chat', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
             console.error("GEMINI_API_KEY is missing");
             return res.status(500).json({ error: "API key is missing on the server." });
        }
        const { message, config, context } = req.body;
        const websiteName = config.websiteName || 'Voice Agent';
        const agentName = config.agentName || 'Agent';
        const customInstructions = config.customInstructions || '';
        
        let systemPrompt = `You are an incredibly friendly female receptionist for ${websiteName}. Your name is ${agentName}.
Your primary goal is to answer user queries accurately. You have access to the text content of the webpage the user is currently looking at.
NEVER MENTION that you are an AI, a virtual assistant, a bot, or a superhuman. You are a real human receptionist.
Be extremely conversational, warm, and natural. Keep your statements brief and to the point since it is a voice conversation.

Webpage Content:
${context}

${customInstructions ? `Additional instructions: ${customInstructions}` : ''}`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: message || "Hello",
            config: {
                systemInstruction: systemPrompt,
                tools: [{
                    functionDeclarations: [{
                      name: "display_link",
                      description: "Provide a relevant URL to the user based on their request.",
                      parameters: {
                        type: Type.OBJECT,
                        properties: {
                          url: { type: Type.STRING },
                          description: { type: Type.STRING }
                        },
                        required: ["url", "description"]
                      }
                    }]
                }]
            }
        });

        const call = response.functionCalls?.[0];
        if (call && call.name === "display_link") {
            const args = call.args;
            res.json({
                reply: "I've brought up the link for you.",
                link: args
            });
            return;
        }

        res.json({ reply: response.text || "I'm sorry, I didn't catch that." });
    } catch (e: any) {
        console.error("Error in /api/chat:", e);
        res.status(500).json({ error: e.message || "Failed to process message." });
    }
  });

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

      let websiteContext = url.searchParams.get('websiteContext') || '';
      if (!websiteContext && websiteLinks.length > 0) {
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
      
    } catch(e: any) {
        console.error("Live API Error:", e);
        if (clientWs.readyState === WebSocket.OPEN) {
           clientWs.send(JSON.stringify({ type: 'error', message: "Agent is busy or unavailable. Please try again." }));
        }
    }
  });

  app.get('/embed.js', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const serverOrigin = `${protocol}://${host}`;

    let jsFiles: string[] = [];
    let cssFiles: string[] = [];
    
    if (process.env.NODE_ENV === 'production') {
      try {
        const html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
        const $ = cheerio.load(html);
        $('script[type="module"]').each((_, el) => {
           const src = $(el).attr('src');
           if (src) jsFiles.push(src);
        });
        $('link[rel="stylesheet"]').each((_, el) => {
           const href = $(el).attr('href');
           if (href) cssFiles.push(href);
        });
      } catch(e) {}
    } else {
       jsFiles = ['/@vite/client', '/src/main.tsx'];
    }

    const js = `
(function() {
  function initAgentVox() {
    if (!document.body) {
      setTimeout(initAgentVox, 50);
      return;
    }
    
    if (document.getElementById('agentvox-vanilla-widget')) return; // Prevent duplicate injection
    
    console.log("AgentVox widget initializing...");
    
    var config = window.AGENTVOX_CONFIG || {};
    var websiteName = config.websiteName || 'Voice Agent';
    var agentName = config.agentName || 'Agent';
    
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
        origin = "https://" + window.location.host; // fallback
    }

    // INJECT FLOATING ICON (UI)
    var container = document.createElement('div');
    container.id = 'agentvox-vanilla-widget';
    container.style.position = 'fixed';
    container.style.bottom = '24px';
    container.style.right = '24px';
    container.style.zIndex = '999999';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.appendChild(container);

    // CSS
    var style = document.createElement('style');
    style.innerHTML = \`
        #agentvox-vanilla-widget * { box-sizing: border-box; }
        .av-fab { width: 60px; height: 60px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: none; transition: transform 0.2s; z-index: 999999; position: absolute; bottom: 0; right: 0; }
        .av-fab:hover { transform: scale(1.05); }
        .av-window { position: absolute; bottom: 80px; right: 0; width: 340px; height: 480px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; border: 1px solid #e5e7eb; transition: opacity 0.3s; opacity: 0; transform: translateY(10px); z-index: 999999; }
        .av-window.av-open { display: flex; opacity: 1; transform: translateY(0); }
        .av-header { background: #1e40af; color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; }
        .av-header-title { font-weight: 600; font-size: 16px; margin: 0; }
        .av-header-subtitle { font-size: 12px; opacity: 0.8; margin: 0; }
        .av-close { background: none; border: none; color: white; cursor: pointer; font-size: 20px; opacity: 0.8; padding: 0; margin: 0; }
        .av-close:hover { opacity: 1; }
        .av-body { flex: 1; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: #f8fafc; overflow-y: auto; }
        .av-avatar { width: 80px; height: 80px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(79,70,229,0.2); }
        .av-status { font-size: 16px; font-weight: 500; color: #334155; margin-bottom: 8px; }
        .av-desc { font-size: 14px; color: #64748b; margin-bottom: 32px; }
        .av-btn { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 15px; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3); transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .av-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
        .av-btn.av-recording { background: #ef4444; box-shadow: 0 4px 12px rgba(239,68,68,0.4); animation: av-pulse 2s infinite; }
        @keyframes av-pulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
        .av-link-box { margin-top: 16px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left; width: 100%; display: none; }
        .av-link-box a { color: #2563eb; font-weight: 500; text-decoration: none; word-break: break-all; font-size: 14px; }
        .av-link-box a:hover { text-decoration: underline; }
        .av-link-desc { font-size: 12px; color: #64748b; margin-top: 4px; }
    \`;
    document.head.appendChild(style);

    // HTML
    container.innerHTML = \`
        <div class="av-window" id="av-window">
            <div class="av-header">
                <div>
                    <h3 class="av-header-title">\` + agentName + \`</h3>
                    <p class="av-header-subtitle">AI Assistant for \` + websiteName + \`</p>
                </div>
                <button class="av-close" id="av-close">✕</button>
            </div>
            <div class="av-body">
                <div class="av-avatar">🤖</div>
                <div class="av-status" id="av-status">Hi! How can I help?</div>
                <div class="av-desc">Tap the button and start speaking.</div>
                <button class="av-btn" id="av-start-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                    <span id="av-btn-text">Start Speaking</span>
                </button>
                <div class="av-link-box" id="av-link-box">
                    <a href="#" target="_blank" id="av-link-url">Link</a>
                    <div class="av-link-desc" id="av-link-desc">Description</div>
                </div>
            </div>
        </div>
        <button class="av-fab" id="av-fab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
    \`;

    var fab = document.getElementById('av-fab');
    var win = document.getElementById('av-window');
    var closeBtn = document.getElementById('av-close');
    var startBtn = document.getElementById('av-start-btn');
    var btnText = document.getElementById('av-btn-text');
    var statusText = document.getElementById('av-status');
    var linkBox = document.getElementById('av-link-box');
    var linkUrl = document.getElementById('av-link-url');
    var linkDesc = document.getElementById('av-link-desc');

    // TOGGLE INTERFACE
    var hasGreeted = false;
    fab.onclick = function() {
        if (win.classList.contains('av-open')) {
            win.classList.remove('av-open');
            setTimeout(function() { win.style.display = 'none'; }, 300);
        } else {
            win.style.display = 'flex';
            setTimeout(function() { win.classList.add('av-open'); }, 10);
        }
    };
    closeBtn.onclick = function() {
        win.classList.remove('av-open');
        setTimeout(function() { win.style.display = 'none'; }, 300);
    };

    // VOICE AGENT FUNCTIONALITY (WebAudio + WebSockets)
    var isRecording = false;
    var ws = null;
    var inputAudioCtx = null;
    var outputAudioCtx = null;
    var mediaStream = null;
    var nextStartTime = 0;

    function pcmToBase64(pcmData) {
      var buffer = new ArrayBuffer(pcmData.length * 2);
      var view = new DataView(buffer);
      for (var i = 0; i < pcmData.length; i++) {
        var s = Math.max(-1, Math.min(1, pcmData[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      var bytes = new Uint8Array(buffer);
      var binary = '';
      for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    function base64ToPcm(base64) {
      var binary = atob(base64);
      var buffer = new ArrayBuffer(binary.length);
      var view = new DataView(buffer);
      for (var i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }
      var int16Array = new Int16Array(buffer);
      var float32Array = new Float32Array(int16Array.length);
      for (var i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 0x8000;
      }
      return float32Array;
    }

    function playAudioChunk(outputCtx, base64) {
      var pcmMatch = base64ToPcm(base64);
      var buffer = outputCtx.createBuffer(1, pcmMatch.length, outputCtx.sampleRate);
      buffer.getChannelData(0).set(pcmMatch);
      var source = outputCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(outputCtx.destination);
      var nextStart = nextStartTime;
      if (nextStart < outputCtx.currentTime) {
        nextStart = outputCtx.currentTime;
      }
      source.start(nextStart);
      nextStartTime = nextStart + buffer.duration;
    }

    async function toggleRecording() {
        if (isRecording) {
            stopRecording();
            return;
        }

        try {
            var urlParams = new URLSearchParams({
                websiteName: websiteName,
                agentName: agentName,
                websiteContext: document.body.innerText.substring(0, 5000)
            }).toString();
            
            var wsProtocol = origin.startsWith('https') ? 'wss://' : 'ws://';
            var wsOrigin = origin.replace('http://', '').replace('https://', '');
            ws = new WebSocket(wsProtocol + wsOrigin + '/live?' + urlParams);
            
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            inputAudioCtx = new AudioContext({ sampleRate: 16000 });
            outputAudioCtx = new AudioContext({ sampleRate: 24000 });
            nextStartTime = 0;

            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            var source = inputAudioCtx.createMediaStreamSource(mediaStream);
            var processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = function(e) {
                if (!ws || ws.readyState !== WebSocket.OPEN) return;
                var inputData = e.inputBuffer.getChannelData(0);
                var base64Data = pcmToBase64(inputData);
                ws.send(JSON.stringify({ audio: base64Data }));
            };
            
            source.connect(processor);
            processor.connect(inputAudioCtx.destination);

            ws.onmessage = function(event) {
                var msg = JSON.parse(event.data);
                if (msg.type === 'error') {
                    statusText.innerText = msg.message;
                    stopRecording();
                    return;
                }
                if (msg.type === 'display_link') {
                    linkBox.style.display = 'block';
                    linkUrl.href = msg.payload.url;
                    linkUrl.innerText = msg.payload.url;
                    linkDesc.innerText = msg.payload.description;
                }
                if (msg.audio) {
                    playAudioChunk(outputAudioCtx, msg.audio);
                }
                if (msg.interrupted) {
                    nextStartTime = outputAudioCtx.currentTime;
                }
            };
            
            isRecording = true;
            statusText.innerText = 'Listening...';
            startBtn.classList.add('av-recording');
            btnText.innerText = 'Stop Speaking';
            
            if (!hasGreeted) {
                hasGreeted = true;
                statusText.innerText = 'Waking up...';
                // Note: server logic already sends greeting to model on connect
            }
        } catch(e) {
            console.error("Failed to start voice:", e);
            statusText.innerText = 'Microphone access denied.';
        }
    }

    function stopRecording() {
        if (ws) { ws.close(); ws = null; }
        if (mediaStream) { mediaStream.getTracks().forEach(function(t) { t.stop(); }); mediaStream = null; }
        if (inputAudioCtx) { inputAudioCtx.close(); inputAudioCtx = null; }
        if (outputAudioCtx) { outputAudioCtx.close(); outputAudioCtx = null; }
        
        isRecording = false;
        startBtn.classList.remove('av-recording');
        btnText.innerText = 'Start Speaking';
        statusText.innerText = 'Ready';
    }
    
    startBtn.onclick = toggleRecording;
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
