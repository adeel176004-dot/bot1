import { useState, useRef, useEffect } from 'react';
import { pcmToBase64, base64ToPcm } from '../lib/audioUtils';
import { Bot, Mic, MicOff, X, Sparkles, AlertCircle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface SupportAgentProps {
  defaultOpen?: boolean;
  hideAskMe?: boolean;
  mode?: "saas" | "standalone";
  layout?: "fixed" | "inline";
  agentName?: string;
  customInstructions?: string;
  userId?: string; // Add userId to track limits
  config?: {
    websiteName: string;
    agentName: string;
    websiteLinks: string[];
    customInstructions: string;
    voiceGender: string;
    language: string;
    personality: string;
    bookingEnabled?: boolean;
    bookingUrl?: string;
    themeColor?: string;
    botIcon?: string;
  };
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SupportAgent({ 
  defaultOpen = false, 
  hideAskMe = false, 
  mode = "saas", 
  layout = "fixed",
  agentName: propAgentName,
  customInstructions: propCustomInstructions,
  config,
  userId: propUserId,
  isOpen: propIsOpen,
  onOpenChange
}: SupportAgentProps) {
  const [localIsOpen, setLocalIsOpen] = useState(defaultOpen);
  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen;
  
  const [userStats, setUserStats] = useState({ totalMessages: 0, plan: 'free' });
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Sync user stats if userId is provided
  useEffect(() => {
    const userId = propUserId || (mode === 'standalone' && window.VOICEGPT_CONFIG?.userId);
    if (userId) {
      const unsub = onSnapshot(doc(db, 'users', userId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const stats = {
            totalMessages: data.totalMessages || 0,
            plan: data.plan || 'free'
          };
          setUserStats(stats);
          
          const limit = stats.plan === 'enterprise' ? Infinity : (stats.plan === 'pro' ? 10000 : 50);
          if (stats.totalMessages >= limit) {
            setIsLimitReached(true);
          } else {
            setIsLimitReached(false);
          }
        }
      });
      return () => unsub();
    }
  }, [propUserId, mode]);

  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setLocalIsOpen(val);
  };

  const [isRecording, setIsRecording] = useState(false);
  const [displayLink, setDisplayLink] = useState<{url: string, description: string} | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const currentThemeColor = config?.themeColor || (mode === 'standalone' ? window.VOICEGPT_CONFIG?.themeColor : null) || '#2563eb';
  const currentBotIcon = config?.botIcon || (mode === 'standalone' ? window.VOICEGPT_CONFIG?.botIcon : null);

  const startRecording = async () => {
    if (isLimitReached) {
      alert("Usage limit reached for this agent. Please contact the administrator.");
      return;
    }
    try {
      const hostUrl = (window as any).VOICEGPT_ORIGIN ? new URL((window as any).VOICEGPT_ORIGIN) : window.location;
      const protocol = hostUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      
      let queryParams: string;
      if (config) {
        const userId = propUserId || (mode === 'standalone' && window.VOICEGPT_CONFIG?.userId);
        queryParams = new URLSearchParams({
          websiteName: config.websiteName || '',
          agentName: config.agentName || '',
          websiteLinks: JSON.stringify(config.websiteLinks || []),
          customInstructions: config.customInstructions || '',
          voiceGender: config.voiceGender || '',
          language: config.language || '',
          personality: config.personality || '',
          bookingEnabled: String(config.bookingEnabled || false),
          bookingUrl: config.bookingUrl || '',
          themeColor: config.themeColor || '',
          botIcon: config.botIcon || '',
          userId: userId || ''
        }).toString();
      } else if (mode === "standalone") {
        if (window.VOICEGPT_CONFIG) {
           const safeConfig: any = {};
           for (const key in window.VOICEGPT_CONFIG) {
              if (typeof window.VOICEGPT_CONFIG[key] === 'object') {
                  safeConfig[key] = JSON.stringify(window.VOICEGPT_CONFIG[key]);
              } else {
                  safeConfig[key] = window.VOICEGPT_CONFIG[key];
              }
           }
           queryParams = new URLSearchParams(safeConfig).toString();
        } else {
           queryParams = window.location.search.replace('?', '');
        }
      } else {
        const customInstructions = propCustomInstructions || `
          You are the Support Agent for our VoiceAgent Builder SaaS app.
          Our SaaS app lets businesses create custom voice AI agents for their own websites.
          Features of our SaaS app:
          - 24/7 Availability: Voice agents answer queries around the clock.
          - Increased Conversions: Turn silent visitors into active customers.
          - Instant Knowledge: Automatically learns from website pages.
          - Reduce Support Load: Frees up human staff.
          Pricing Plans:
          - Basic: $19/mo (1 custom agent, up to 5 web pages).
          - Pro: $49/mo (Unlimited web pages, custom instructions).
          - Enterprise: Custom pricing for high volume.
          Contact Info: support@voiceagentbuilder.com
          
          Important Links to provide if asked:
          - Pricing: https://voiceagentbuilder.com/pricing
          - Contact: https://voiceagentbuilder.com/contact
          - Features: https://voiceagentbuilder.com/features
        `.trim();

        const userId = propUserId;
        queryParams = new URLSearchParams({
          websiteName: 'VoiceAgent Builder',
          agentName: propAgentName || 'Support Bot',
          websiteLinks: '[]',
          customInstructions: customInstructions,
          userId: userId || ''
        }).toString();
      }

      const ws = new WebSocket(`${protocol}//${hostUrl.host}/live?${queryParams}`);
      wsRef.current = ws;

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputAudioCtx;
      
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputAudioCtx;
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      let responseLogged = false;
      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'display_link') {
           setDisplayLink(msg.payload);
        }
        if (msg.type === 'display_booking') {
           setShowBooking(true);
        }
        if (msg.audio) {
          playAudioChunk(outputAudioCtx, msg.audio);
          
          // Log message to Firestore (only once per agent response)
          const userId = propUserId || (mode === 'standalone' && window.VOICEGPT_CONFIG?.userId);
          if (userId && !responseLogged) {
            responseLogged = true;
            try {
              await updateDoc(doc(db, 'users', userId), {
                totalMessages: increment(1),
                updatedAt: new Date().toISOString()
              });
            } catch (err) {
              console.error("Failed to log message:", err);
            }
          }
        }
        if (msg.interrupted) {
          nextStartTimeRef.current = outputAudioCtx.currentTime;
          responseLogged = false;
        }
      };
      
      setIsRecording(true);
    } catch (e) {
      console.error("Failed to start recording:", e);
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  const playAudioChunk = (outputAudioCtx: AudioContext, base64: string) => {
    const pcmMatch = base64ToPcm(base64);
    const buffer = outputAudioCtx.createBuffer(1, pcmMatch.length, 24000);
    buffer.getChannelData(0).set(pcmMatch);
    
    const source = outputAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outputAudioCtx.destination);
    
    const scheduleTime = Math.max(outputAudioCtx.currentTime, nextStartTimeRef.current);
    source.start(scheduleTime);
    nextStartTimeRef.current = scheduleTime + buffer.duration;
  };

  const stopRecording = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    if (mode === "standalone") {
      window.parent.postMessage(isOpen ? 'voicegpt:open' : 'voicegpt:close', '*');
    }
  }, [isOpen, mode]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const AgentUI = (
    <div className={`flex flex-col items-center justify-center gap-6 ${layout === 'fixed' ? 'bg-slate-50 min-h-[250px] p-6' : 'w-full'}`}>
      <div className="relative">
        {isRecording && (
            <>
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-4 bg-blue-400 rounded-full blur-md opacity-30"
                />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -inset-2 bg-blue-300 rounded-full blur-sm opacity-40"
                />
            </>
        )}
        <button
            onClick={toggleRecording}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
                ${isRecording 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                    : 'bg-white text-blue-500 ring-4 ring-blue-50'
                }
            `}
        >
            {isRecording ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10 text-slate-400" />}
        </button>
      </div>
      <div className="text-center">
          {showBooking && config?.bookingUrl ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
              <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Book an Appointment</h3>
                  <button 
                    onClick={() => setShowBooking(false)}
                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <iframe 
                  src={config.bookingUrl}
                  className="w-full flex-1"
                  frameBorder="0"
                />
              </div>
            </motion.div>
          ) : null}

          {isLimitReached ? (
            <div className="flex flex-col items-center text-red-500 gap-2">
              <AlertCircle className="w-6 h-6" />
              <p className="text-xs font-bold uppercase tracking-tight">Limit Reached</p>
            </div>
          ) : (
            <p className="text-slate-600 font-medium">{isRecording ? "Listening..." : "Tap to start speaking"}</p>
          )}
      </div>

      <AnimatePresence>
        {displayLink && (
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-white rounded-xl p-4 shadow-sm ring-1 ring-slate-200"
          >
              <h3 className="text-sm font-medium text-slate-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Link</span>
              </h3>
              <p className="text-slate-500 text-xs mb-3 truncate">{displayLink.description}</p>
              
              <div className="flex flex-col gap-2">
                  <a 
                      href={displayLink.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-blue-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-600 transition-colors text-center"
                  >
                      Open URL
                  </a>
                  <button
                      onClick={() => setDisplayLink(null)}
                      className="w-full text-slate-500 text-xs hover:bg-slate-100 font-medium py-1.5 rounded-lg transition-colors text-center"
                  >
                      Close Link
                  </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (layout === 'inline') {
    return AgentUI;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <div className="bg-white px-4 py-2 rounded-full shadow-lg ring-1 ring-slate-900/5 font-medium text-slate-700 whitespace-nowrap">
              Ask me!
            </div>
            <div style={{ backgroundColor: currentThemeColor }} className="shadow-xl text-white w-14 h-14 rounded-full flex items-center justify-center transition-colors">
              {currentBotIcon ? (
                <img src={currentBotIcon} alt="Agent" className="w-8 h-8 rounded-full" />
              ) : (
                <Bot className="w-7 h-7" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col"
          >
            <div style={{ backgroundColor: currentThemeColor }} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                {currentBotIcon ? (
                  <img src={currentBotIcon} alt="Agent" className="w-6 h-6 rounded-full border border-white/20" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
                <span className="font-medium text-lg">Support Agent</span>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  stopRecording();
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {AgentUI}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

