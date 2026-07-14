import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import * as http from 'http';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (moved inside startServer)

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Initialize Firebase Admin
  if (getApps().length === 0) {
    console.log('[FIREBASE] Initializing Admin SDK with explicit project ID...');
    try {
      initializeApp({
        projectId: 'gen-lang-client-0676055838'
      });
    } catch (err) {
      console.error('[FIREBASE] Error initializing Firebase app:', err);
    }
  }

  const DB_ID = 'ai-studio-voiceagentbuilde-49d60089-d04c-4ee8-a68c-15f8844a9979';
  let adminDb: FirebaseFirestore.Firestore;
  
  // Try initializing with the named database first
  const firebaseApp = getApps()[0];
  const namedDb = getFirestore(firebaseApp, DB_ID);
  
  // Test named database connection/permissions with a small operation if possible
  // Since we can't easily "test" without a call, we'll use a safer approach:
  // We'll wrap the OTP operations in a try-catch that can fallback to default DB if it hits PERMISSION_DENIED
  adminDb = namedDb;
  console.log(`[FIREBASE] Defaulting to named database: ${DB_ID}`);

  const adminAuth = getAuth();

  app.use(cors({ origin: '*' }));
  app.options('*', cors({ origin: '*' }));
  
  // Logging middleware for troubleshooting
  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  app.get('/health', (req, res) => res.status(200).send('OK'));

  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options'); // Allow iframe embedding
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    next();
  });

  app.get('/api/usage-status/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.json({ allowed: true, totalMessages: 0, plan: 'free', limit: 50 });
      }
      const data = userDoc.data()!;
      const totalMessages = data.totalMessages || 0;
      const plan = data.plan || 'free';
      const limit = plan === 'enterprise' ? Infinity : (plan === 'pro' ? 10000 : 50);
      res.json({
        allowed: totalMessages < limit,
        totalMessages,
        limit,
        plan
      });
    } catch (err) {
      console.error('[SERVER] Usage status error:', err);
      res.status(500).json({ error: 'Failed to fetch usage status' });
    }
  });

  app.post('/api/log-message', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).send('Missing userId');
      
      await adminDb.collection('users').doc(userId).update({
        totalMessages: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (err) {
      console.error('[SERVER] Log message error:', err);
      res.status(500).json({ error: 'Failed to log message' });
    }
  });

  app.get('/vagent.js', (req, res) => {
    console.log('[SERVER] Serving vagent.js');
    try {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.get('host');
      let serverOrigin = host ? `${protocol}://${host}` : '';
      
      // Ensure no trailing slash
      if (serverOrigin.endsWith('/')) {
        serverOrigin = serverOrigin.slice(0, -1);
      }
      
      if (serverOrigin && !serverOrigin.includes('localhost') && !serverOrigin.includes('127.0.0.1') && serverOrigin.startsWith('http:')) {
        serverOrigin = serverOrigin.replace('http:', 'https:');
      }

      const js = `
(function() {
  var debug = true;
  function log() { if (debug) console.log.apply(console, ["VoiceGPT:"].concat(Array.prototype.slice.call(arguments))); }
  
  log("Script loading...");

  function initVoiceGpt() {
    log("initVoiceGpt called");
    if (window.VOICEGPT_LOADED) {
        log("Already loaded, skipping");
        return;
    }
    if (!document.body && !document.documentElement) {
      log("No body/document yet, retrying...");
      setTimeout(initVoiceGpt, 50);
      return;
    }
    
    if (document.getElementById('voicegpt-vanilla-widget')) {
        log("Widget element already exists");
        return;
    }
    window.VOICEGPT_LOADED = true;
    
    log("Initializing widget...");
    
    var config = window.VOICEGPT_CONFIG || {};
    var websiteName = config.websiteName || 'Voice Agent';
    var agentName = config.agentName || 'Agent';
    var serverOrigin = "${serverOrigin}";
    var origin = serverOrigin;
    
    try {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var s = scripts[i];
            if (s.src && (s.src.indexOf('/vagent.js') !== -1 || s.src.indexOf('ais-') !== -1)) {
                var scriptUrl = new URL(s.src);
                if (!origin || origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1 || origin === "" || origin.indexOf('example.com') !== -1) {
                    origin = scriptUrl.origin;
                    log("Detected origin from script tag:", origin);
                }
                break;
            }
        }
    } catch(e) { log("Error detecting origin:", e); }

    if (!origin || origin === "null") origin = window.location.origin;
    window.VOICEGPT_ORIGIN = origin;
    log("Final origin being used:", origin);
    
    var container = document.createElement('div');
    container.id = 'voicegpt-vanilla-widget';
    container.style.cssText = 'position: fixed !important; bottom: 24px !important; right: 24px !important; z-index: 2147483647 !important; width: 340px !important; height: 500px !important; pointer-events: none !important; display: block !important;';
    
    var inject = function() {
        var target = document.body || document.documentElement;
        if (target && !document.getElementById('voicegpt-vanilla-widget')) {
            target.appendChild(container);
            log("Container injected into", target.tagName);
        }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        inject();
    } else {
        window.addEventListener('load', inject);
        window.addEventListener('DOMContentLoaded', inject);
    }

    var style = document.createElement('style');
    style.innerHTML = \`
        #voicegpt-vanilla-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .av-fab { width: 60px; height: 60px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: none; transition: transform 0.2s; z-index: 2147483647; position: absolute; bottom: 0; right: 0; pointer-events: auto; }
        .av-fab:hover { transform: scale(1.05); }
        .av-window { position: absolute; bottom: 80px; right: 0; width: 340px; height: 480px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; border: 1px solid #e5e7eb; transition: opacity 0.3s; opacity: 0; transform: translateY(10px); z-index: 2147483647; pointer-events: auto; }
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

    var isRecording = false;
    var isLimitReached = false;
    var ws = null;
    var inputAudioCtx = null;
    var outputAudioCtx = null;
    var mediaStream = null;
    var nextStartTime = 0;

    async function checkUsage() {
      var latestCfg = window.VOICEGPT_CONFIG || config || {};
      var userId = latestCfg.userId;
      if (!userId) return;
      
      try {
        var response = await fetch(origin + '/api/usage-status/' + userId);
        var data = await response.json();
        if (data.allowed === false) {
          isLimitReached = true;
          statusText.innerText = 'Usage limit reached';
          statusText.style.color = '#ef4444';
          startBtn.style.opacity = '0.5';
          startBtn.style.cursor = 'not-allowed';
          btnText.innerText = 'Limit Reached';
        }
      } catch (e) { log("Error checking usage:", e); }
    }
    
    checkUsage();
    setInterval(checkUsage, 30000); // Check every 30s

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
      var buffer = outputCtx.createBuffer(1, pcmMatch.length, 24000);
      buffer.getChannelData(0).set(pcmMatch);
      var source = outputCtx.createBufferSource();
      buffer.getChannelData(0).set(pcmMatch);
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
        if (isLimitReached) {
            alert("Usage limit reached. Please contact the administrator.");
            return;
        }
        if (isRecording) {
            stopRecording();
            return;
        }

        try {
            var latestCfg = window.VOICEGPT_CONFIG || config || {};
            var curWebName = latestCfg.websiteName || websiteName || 'Voice Agent';
            var curAgName = latestCfg.agentName || agentName || 'Agent';
            var linksObj = latestCfg.websiteLinks || [];
            var instructionsObj = latestCfg.customInstructions || "";
            var genderObj = latestCfg.voiceGender || "female";
            var languageObj = latestCfg.language || "English";
            var personalityObj = latestCfg.personality || "Friendly";
            var userIdObj = latestCfg.userId || "";
            var paramsObj = {
                websiteName: curWebName,
                agentName: curAgName,
                customInstructions: instructionsObj,
                voiceGender: genderObj,
                language: languageObj,
                personality: personalityObj,
                userId: userIdObj
            };
            if (linksObj && linksObj.length > 0) {
                paramsObj.websiteLinks = JSON.stringify(linksObj);
            }
            if (document && document.body) {
                paramsObj.websiteContext = document.body.innerText.substring(0, 5000);
            }
            var urlParams = new URLSearchParams(paramsObj).toString();
            
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

            var responseLogged = false;
            ws.onmessage = function(event) {
                var msg = JSON.parse(event.data);
                if (msg.type === 'display_link') {
                    linkBox.style.display = 'block';
                    linkUrl.href = msg.payload.url;
                    linkUrl.innerText = msg.payload.url;
                    linkDesc.innerText = msg.payload.description;
                }
                if (msg.audio) {
                    playAudioChunk(outputAudioCtx, msg.audio);
                    
                    if (!responseLogged) {
                        responseLogged = true;
                        var userId = (window.VOICEGPT_CONFIG || config || {}).userId;
                        if (userId) {
                            fetch(origin + '/api/log-message', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: userId })
                            }).catch(function(e) { log("Error logging message:", e); });
                        }
                    }
                }
                if (msg.interrupted) {
                    nextStartTime = outputAudioCtx.currentTime;
                    responseLogged = false;
                }
            };
            
            isRecording = true;
            statusText.innerText = 'Listening...';
            startBtn.classList.add('av-recording');
            btnText.innerText = 'Stop Speaking';
            
            if (!hasGreeted) {
                hasGreeted = true;
                statusText.innerText = 'Waking up...';
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
    initVoiceGpt();
  } else {
    document.addEventListener('DOMContentLoaded', initVoiceGpt);
    window.addEventListener('load', initVoiceGpt);
  }
})();`;
      res.send(js);
    } catch (err) {
      console.error('Error serving embed.js:', err);
      res.status(500).send('console.error("Internal Server Error serving embed.js")');
    }
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
            contents: [{ role: 'user', parts: [{ text: message || "Hello" }] }],
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

  app.post('/api/generate-content', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
             return res.status(500).json({ error: "API key is missing on the server." });
        }
        const { prompt, systemInstruction } = req.body;
        
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt || "Write a short blog post about AI.",
            config: {
                systemInstruction: systemInstruction || "You are a professional content writer."
            }
        });

        res.json({ content: response.text || "" });
    } catch (e: any) {
        console.error("Error in /api/generate-content:", e);
        res.status(500).json({ error: e.message || "Failed to generate content." });
    }
  });

  const wss = new WebSocketServer({ server, path: '/live' });
  
  wss.on('connection', async (clientWs, req) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const websiteName = url.searchParams.get('websiteName') || 'Acme Corp';
      const agentName = url.searchParams.get('agentName') || 'agent';
      console.log(`Connection received for website: ${websiteName}, agent: ${agentName}`);
      const websiteLinksParam = url.searchParams.get('websiteLinks');
      let websiteLinks: string[] = [];
      try {
          if (websiteLinksParam) websiteLinks = JSON.parse(websiteLinksParam);
      } catch (e) {}
      const customInstructions = url.searchParams.get('customInstructions') || '';
      const voiceGender = url.searchParams.get('voiceGender') || 'female';
      const language = url.searchParams.get('language') || 'English';
      const personality = url.searchParams.get('personality') || 'Friendly';
      const userId = url.searchParams.get('userId');

      let transcript = '';
      const startTime = Date.now();

      let clientContext = url.searchParams.get('websiteContext') || '';
      let fetchedContext = '';
      if (websiteLinks.length > 0) {
          try {
              for (const link of websiteLinks) {
                  try {
                      // Try r.jina.ai first as it cleanly extracts markdown from any modern URL, SPA, TikTok, Cloudflare protected sites, etc.
                      const jinaUrl = `https://r.jina.ai/${link}`;
                      const jinaRes = await axios.get(jinaUrl, { timeout: 6000 });
                      if (jinaRes.data && typeof jinaRes.data === 'string' && jinaRes.data.length > 50) {
                          fetchedContext += `\n--- CONTENT FROM ${link} ---\n` + jinaRes.data.substring(0, 4000) + '\n';
                          continue;
                      }
                  } catch (e) {}

                  try {
                      const response = await axios.get(link, { 
                          timeout: 5000,
                          headers: {
                              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                          }
                      });
                      const $ = cheerio.load(response.data);
                      $('script, style, nav, footer, noscript, iframe').remove();
                      fetchedContext += `\n--- CONTENT FROM ${link} ---\n` + $('body').text().replace(/\s+/g, ' ').trim() + '\n';
                  } catch (e) {
                      console.error(`Failed to fetch ${link}`, e);
                  }
              }
          } catch (e) {
              console.error("Failed to fetch website context", e);
          }
      }

      let websiteContext = fetchedContext.trim();
      if (!websiteContext && websiteLinks.length === 0 && clientContext.trim()) {
          websiteContext = clientContext.substring(0, 8000);
      }
      if (!websiteContext) {
          websiteContext = `General FAQ and business details for ${websiteName}.${websiteLinks.length > 0 ? ` Official website URLs: ${websiteLinks.join(', ')}.` : ''}`;
      }

      const systemPrompt = `You are an incredibly ${personality.toLowerCase()} ${voiceGender} receptionist representing ${websiteName}. Your name is ${agentName}.
Your primary goal is to answer user queries accurately based ONLY on the provided Website Data for ${websiteName} below.
CRITICAL MANDATE: You represent ${websiteName}. Do NOT discuss unrelated websites or products even if stray text appears in your context.
If the user asks something outside the scope of ${websiteName}, politely inform them that you do not have that information.
NEVER MENTION that you are an AI, a virtual assistant, a bot, or a superhuman. You are a real human receptionist for ${websiteName}.
CRITICAL MANDATE: You MUST ONLY speak in ${language}.
Your tone should be consistently ${personality.toLowerCase()}. Be conversational and natural. Use natural human conversational fillers like 'ummm', 'hmmm', 'let me see', and slight pauses to sound like a real person thinking. Keep your statements brief and to the point since it is a voice conversation.

If the user asks about a specific feature, offering, paid plan, pricing, or contact details, you MUST use the \`display_link\` tool to show them the relevant URL. Deduce the URL from the known pages (${websiteLinks.join(', ')}) if necessary.
Once you call the tool, naturally tell the user that you've just put the link on their screen.

Website Data for Context (${websiteName}):
${websiteContext}

${customInstructions ? `Additional instructions from ${websiteName}: ${customInstructions}` : ''}`;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceGender === 'male' ? 'Charon' : 'Aoede' } },
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

            // Capture text transcript from model
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) {
              transcript += `Agent: ${text}\n`;
            }

            // Capture user transcript if provided by the API
            const userText = (message.serverContent as any)?.userContent?.parts?.[0]?.text || (message.serverContent as any)?.transcription?.text;
            if (userText) {
              transcript += `User: ${userText}\n`;
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

      clientWs.on("close", async () => {
        console.log(`Connection closed for user: ${userId}`);
        if (session) session.close();
        
        // Save transcript if there's content and a userId
        if (userId && transcript.trim()) {
          try {
            await adminDb.collection('conversations').add({
              userId,
              transcript,
              createdAt: FieldValue.serverTimestamp()
            });
            console.log(`[FIREBASE] Transcript saved for user ${userId}`);
          } catch (err) {
            console.error('[FIREBASE] Error saving transcript:', err);
          }
        }
      });
      
    } catch(e) {
        console.error("Live API Error:", e);
    }
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
