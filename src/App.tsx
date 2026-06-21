/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { pcmToBase64, base64ToPcm } from './lib/audioUtils';
import { Mic, MicOff, Stethoscope, Mail, Sparkles, X, Bot, ChevronRight, Clock, TrendingUp, Headset, Globe, Code, Copy, Check, MonitorPlay, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportAgent } from './components/SupportAgent';

export default function App() {
  if (window.location.pathname === '/widget') {
    return <SupportAgent defaultOpen={false} hideAskMe={false} mode="standalone" />;
  }

  const [isRecording, setIsRecording] = useState(false);

  const [appMode, setAppMode] = useState<'saas' | 'agent'>('saas');
  const [isCreating, setIsCreating] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayLink, setDisplayLink] = useState<{url: string, description: string} | null>(null);
  const [saasConfig, setSaasConfig] = useState({
    websiteName: '',
    agentName: '',
    websiteLinks: [''],
    customInstructions: ''
  });
  
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

  const startRecording = async () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const urlParams = new URLSearchParams({
        websiteName: saasConfig.websiteName || 'Acme Corp',
        agentName: saasConfig.agentName || 'Aoede',
        websiteLinks: JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim() !== '')),
        customInstructions: saasConfig.customInstructions || ''
      }).toString();
      const ws = new WebSocket(`${protocol}//${window.location.host}/live?${urlParams}`);
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

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'display_link') {
           setDisplayLink(msg.payload);
        }
        if (msg.audio) {
          playAudioChunk(outputAudioCtx, msg.audio);
        }
        if (msg.interrupted) {
          nextStartTimeRef.current = outputAudioCtx.currentTime;
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
    const buffer = outputAudioCtx.createBuffer(1, pcmMatch.length, outputAudioCtx.sampleRate);
    buffer.getChannelData(0).set(pcmMatch);
    
    const source = outputAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outputAudioCtx.destination);
    
    let nextStart = nextStartTimeRef.current;
    if (nextStart < outputAudioCtx.currentTime) {
      nextStart = outputAudioCtx.currentTime;
    }
    source.start(nextStart);
    nextStartTimeRef.current = nextStart + buffer.duration;
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
    return () => {
       stopRecording();
    };
  }, []);

  if (appMode === 'saas') {
    if (!isCreating) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <header className="border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-50">
             <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-600">
                   <Bot className="w-6 h-6" />
                   <span className="font-semibold text-lg tracking-tight text-slate-900">AgentVox</span>
                </div>
                <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
                   <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
                   <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
                   <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                </nav>
                <button className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</button>
             </div>
          </header>
          
          <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[120px] opacity-60 pointer-events-none" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100 blur-[100px] opacity-60 pointer-events-none" />
             
             <div className="max-w-3xl w-full z-10 text-center space-y-8">
                <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-blue-500/20">
                   <Sparkles className="w-4 h-4" />
                   <span>Next-generation voice experience</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 leading-tight">
                   Supercharge your website with Voice AI
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                   Build, customize, and deploy a superhuman AI voice agent that knows everything about your business in under 60 seconds.
                </p>
                <div className="pt-4">
                   <button 
                      onClick={() => setIsCreating(true)}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white font-medium px-8 py-4 rounded-full text-lg hover:bg-blue-700 transition-colors hover:shadow-lg hover:-translate-y-0.5 duration-200"
                   >
                      <span>Create your voice AI agent</span>
                      <ChevronRight className="w-5 h-5" />
                   </button>
                </div>
             </div>

             {/* Feature Cards Section */}
             <div className="max-w-7xl w-full mx-auto mt-24 mb-12 z-10">
                <div className="text-center mb-12">
                   <h2 className="text-3xl tracking-tight font-medium text-slate-900">Grow your business automatically</h2>
                   <p className="text-slate-500 mt-2 text-lg">Our AI handles the interactions, allowing you to focus on growth.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.9 }} 
                      whileInView={{ 
                         opacity: 1, 
                         y: 0, 
                         scale: [0.9, 1.04, 1],
                         boxShadow: ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 0px rgba(59,130,246,0)", "0px 12px 40px -10px rgba(59,130,246,0.15)"]
                      }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.1, duration: 0.7, times: [0, 0.6, 1], ease: "easeOut" }}
                      className="bg-white p-6 rounded-2xl ring-1 ring-slate-200/60 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300"
                   >
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                         <Clock className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">24/7 Availability</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Never miss a potential lead. Your voice agent works around the clock, answering queries anytime.</p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.9 }} 
                      whileInView={{ 
                         opacity: 1, 
                         y: 0, 
                         scale: [0.9, 1.04, 1],
                         boxShadow: ["0px 0px 0px rgba(34,197,94,0)", "0px 0px 0px rgba(34,197,94,0)", "0px 12px 40px -10px rgba(34,197,94,0.15)"]
                      }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.2, duration: 0.7, times: [0, 0.6, 1], ease: "easeOut" }}
                      className="bg-white p-6 rounded-2xl ring-1 ring-slate-200/60 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300"
                   >
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                         <TrendingUp className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Increased Conversions</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Engage users instantly with human-like voice AI. Turn silent visitors into active, engaged customers.</p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.9 }} 
                      whileInView={{ 
                         opacity: 1, 
                         y: 0, 
                         scale: [0.9, 1.04, 1],
                         boxShadow: ["0px 0px 0px rgba(168,85,247,0)", "0px 0px 0px rgba(168,85,247,0)", "0px 12px 40px -10px rgba(168,85,247,0.15)"]
                      }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.3, duration: 0.7, times: [0, 0.6, 1], ease: "easeOut" }}
                      className="bg-white p-6 rounded-2xl ring-1 ring-slate-200/60 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300"
                   >
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                         <Globe className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Instant Knowledge</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Automatically syncs with your website. Your AI knows every page, pricing plan, and contact detail directly.</p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.9 }} 
                      whileInView={{ 
                         opacity: 1, 
                         y: 0, 
                         scale: [0.9, 1.04, 1],
                         boxShadow: ["0px 0px 0px rgba(249,115,22,0)", "0px 0px 0px rgba(249,115,22,0)", "0px 12px 40px -10px rgba(249,115,22,0.15)"]
                      }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.4, duration: 0.7, times: [0, 0.6, 1], ease: "easeOut" }}
                      className="bg-white p-6 rounded-2xl ring-1 ring-slate-200/60 hover:-translate-y-1 hover:shadow-xl transition-transform duration-300"
                   >
                      <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                         <Headset className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Reduce Support Load</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Free up your human staff. Let AI resolve common repetitive questions so your team can focus on complex tasks.</p>
                   </motion.div>
                </div>
             </div>
          </main>

          <footer className="border-t border-slate-200/60 bg-white py-8 z-10 relative">
             <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                   <Bot className="w-5 h-5 text-slate-400" />
                   <span>© 2026 AgentVox Inc. All rights reserved.</span>
                </div>
                <div className="flex space-x-6">
                   <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                   <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
                </div>
             </div>
          </footer>
          <SupportAgent />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-50">
           <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-600">
                 <Bot className="w-6 h-6" />
                 <span className="font-semibold text-lg tracking-tight text-slate-900">AgentVox</span>
              </div>
           </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-[100px] opacity-60 pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100 blur-[100px] opacity-60 pointer-events-none" />
          
          <div className="max-w-xl w-full z-10 bg-white p-8 rounded-3xl shadow-xl ring-1 ring-slate-900/5 my-8">
            <div className="flex flex-col items-center mb-8">
               <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100 mb-4">
                   <Sparkles className="w-8 h-8 text-blue-500" />
               </div>
               <h1 className="text-3xl font-medium tracking-tight text-slate-900">Create your voice agent</h1>
               <p className="text-slate-500 mt-2 text-center">Configure your website's AI agent in seconds.</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website Name</label>
                  <input 
                     type="text" 
                     value={saasConfig.websiteName}
                     onChange={e => setSaasConfig({...saasConfig, websiteName: e.target.value})}
                     placeholder="e.g. Acme Corp"
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agent Name</label>
                  <input 
                     type="text" 
                     value={saasConfig.agentName}
                     onChange={e => setSaasConfig({...saasConfig, agentName: e.target.value})}
                     placeholder="e.g. Sarah"
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website Pages (Context for AI)</label>
                  {saasConfig.websiteLinks.map((link, idx) => (
                      <div key={idx} className="flex space-x-2 mb-2">
                          <input 
                              type="url" 
                              value={link}
                              onChange={e => {
                                  const newLinks = [...saasConfig.websiteLinks];
                                  newLinks[idx] = e.target.value;
                                  setSaasConfig({...saasConfig, websiteLinks: newLinks});
                              }}
                              placeholder="e.g. https://example.com/about"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          {saasConfig.websiteLinks.length > 1 && (
                              <button 
                                  onClick={() => {
                                      const newLinks = saasConfig.websiteLinks.filter((_, i) => i !== idx);
                                      setSaasConfig({...saasConfig, websiteLinks: newLinks});
                                  }} 
                                  className="px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-colors"
                              >
                                  <X className="w-5 h-5"/>
                              </button>
                          )}
                      </div>
                  ))}
                  <button 
                      onClick={() => setSaasConfig({...saasConfig, websiteLinks: [...saasConfig.websiteLinks, '']})}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1"
                  >
                      + Add another page link
                  </button>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custom Instructions (Optional)</label>
                  <textarea 
                     value={saasConfig.customInstructions}
                     onChange={e => setSaasConfig({...saasConfig, customInstructions: e.target.value})}
                     placeholder="e.g. Be very helpful and focus on pushing our premium plans."
                     rows={3}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  />
               </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                 onClick={() => setAppMode('agent')}
                 disabled={!saasConfig.websiteName || !saasConfig.agentName || saasConfig.websiteLinks.every(l => !l.trim())}
                 className="w-full bg-blue-500 text-white font-medium py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                 Create Voice Agent
              </button>
              <button 
                 onClick={() => setIsCreating(false)}
                 className="w-full bg-slate-100 text-slate-600 font-medium py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                 Cancel
              </button>
            </div>
          </div>
        </main>
        
        <footer className="border-t border-slate-200/60 bg-white py-8 z-10 relative">
           <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                 <Bot className="w-5 h-5 text-slate-400" />
                 <span>© 2026 ClinicVox Inc. All rights reserved.</span>
              </div>
              <div className="flex space-x-6">
                 <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                 <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              </div>
           </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100 blur-[100px] opacity-60 pointer-events-none" />
      
      <div className="absolute top-6 left-6 z-20">
         <button onClick={() => { setAppMode('saas'); stopRecording(); }} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center space-x-1">
            <X className="w-4 h-4" />
            <span>Close Agent</span>
         </button>
      </div>

      <div className="absolute top-6 right-6 z-20 flex space-x-3">
         <button onClick={() => setShowSimulator(true)} className="text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-sm ring-1 ring-slate-900/5">
            <MonitorPlay className="w-4 h-4 text-slate-500" />
            <span>Test Simulator</span>
         </button>
         <button onClick={() => setShowEmbed(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Embed on your website</span>
         </button>
      </div>

      <AnimatePresence>
        {showSimulator && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-slate-50 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden border border-slate-200"
            >
               {/* Browser Top Bar */}
               <div className="bg-slate-200/50 border-b border-slate-300 w-full p-4 flex items-center space-x-4">
                 <div className="flex space-x-2">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="flex-1">
                   <div className="bg-white/70 border border-slate-300 rounded-lg px-4 py-1.5 text-sm font-medium text-slate-500 text-center flex items-center justify-center space-x-2 w-64 mx-auto">
                     <Lock className="w-3 h-3" />
                     <span>yourwebsite.com</span>
                   </div>
                 </div>
                 <button onClick={() => setShowSimulator(false)} className="text-slate-500 hover:text-slate-800 transition-colors bg-white/50 hover:bg-white rounded-full p-1.5 ring-1 ring-slate-900/5">
                    <X className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Browser Body / Iframe */}
               <div className="flex-1 w-full relative bg-white overflow-hidden">
                  <iframe 
                    title="Website Simulator"
                    className="w-full h-full border-none"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>My Test Page</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #334155; overflow-x: hidden; }
                          header { padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
                          .logo { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
                          .nav { display: flex; gap: 1rem; }
                          .nav-item { width: 60px; height: 12px; background: #e2e8f0; border-radius: 6px; }
                          main { padding: 3rem 2rem; max-width: 800px; margin: 0 auto; }
                          h1 { margin: 0 0 1.5rem 0; font-size: 2.5rem; color: #0f172a; line-height: 1.2; }
                          p { font-size: 1.125rem; line-height: 1.6; color: #475569; margin-bottom: 2rem; }
                          .hero-box { height: 240px; background: #e2e8f0; border-radius: 12px; margin-bottom: 3rem; }
                          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
                          .card { height: 140px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                        </style>
                      </head>
                      <body>
                        <header>
                          <div class="logo">${saasConfig.websiteName || 'Acme Corp'}</div>
                          <div class="nav">
                            <div class="nav-item"></div>
                            <div class="nav-item"></div>
                            <div class="nav-item"></div>
                          </div>
                        </header>
                        <main>
                          <h1>Welcome to ${saasConfig.websiteName || 'our website'}</h1>
                          <p>This is a simulated view. The Voice AI Agent widget should appear in the bottom right corner of this frame, just like it will on your real website.</p>
                          <div class="hero-box"></div>
                          <div class="grid">
                            <div class="card"></div>
                            <div class="card"></div>
                            <div class="card"></div>
                          </div>
                        </main>
                        
                        <!-- AI Agent Embed Script -->
                        <script>
                          window.AGENTVOX_CONFIG = {
                            websiteName: "${saasConfig.websiteName.replace(/"/g, '\\"')}",
                            agentName: "${saasConfig.agentName.replace(/"/g, '\\"')}"
                          };
                        </script>
                        <script src="${window.location.origin}/embed.js" async></script>
                      </body>
                      </html>
                    `}
                  />
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmbed && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white max-w-lg w-full rounded-3xl p-8 shadow-2xl relative"
            >
               <button onClick={() => setShowEmbed(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
               </button>
               <h2 className="text-2xl font-medium tracking-tight text-slate-900 mb-2">Embed your agent</h2>
               <p className="text-slate-500 mb-6">Drop this script into the <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-sm">&lt;body&gt;</code> of your website to let your customers talk to your voice agent.</p>
               
               <div className="bg-slate-900 rounded-xl p-4 relative group">
                  <pre className="text-slate-300 text-sm overflow-x-auto font-mono leading-relaxed">
{`<script>
  window.AGENTVOX_CONFIG = {
    websiteName: "${saasConfig.websiteName.replace(/"/g, '\\"')}",
    agentName: "${saasConfig.agentName.replace(/"/g, '\\"')}"
  };
</script>
<script src="${window.location.origin}/embed.js" async></script>`}
                  </pre>
                  <button 
                     onClick={() => {
                        window.navigator.clipboard.writeText(`<script>\n  window.AGENTVOX_CONFIG = {\n    websiteName: "${saasConfig.websiteName.replace(/"/g, '\\"')}",\n    agentName: "${saasConfig.agentName.replace(/"/g, '\\"')}"\n  };\n</script>\n<script src="${window.location.origin}/embed.js" async></script>`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                     }}
                     className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg transition-colors"
                  >
                     {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl w-full flex flex-col items-center justify-center z-10 space-y-12">
         <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center ring-1 ring-slate-900/5">
                <Sparkles className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-medium tracking-tight text-slate-900">{saasConfig.websiteName || 'Acme Corp'}</h1>
                <p className="text-slate-500 mt-2">Tap below to talk to our agent.</p>
            </div>
         </div>
      
         <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={toggleRecording}
             className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-shadow duration-500 shadow-xl ${
                 isRecording 
                 ? 'bg-blue-500 text-white shadow-blue-500/40 ring-4 ring-blue-500/20' 
                 : 'bg-white text-slate-900 hover:shadow-2xl ring-1 ring-slate-900/5 hover:ring-slate-900/10'
             }`}
         >
             <AnimatePresence>
                 {isRecording && (
                     <motion.div 
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"
                     />
                 )}
             </AnimatePresence>
             {isRecording ? <MicOff className="w-12 h-12 relative z-10" /> : <Mic className="w-12 h-12 relative z-10" />}
         </motion.button>
         
         <div className="h-8">
             <AnimatePresence mode="wait">
                 {isRecording ? (
                     <motion.p 
                        key="listening"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-blue-500 font-medium"
                     >
                         Listening... Tap to end call.
                     </motion.p>
                 ) : (
                     <motion.p 
                        key="ready"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-slate-400"
                     >
                         Receptionist is ready
                     </motion.p>
                 )}
             </AnimatePresence>
         </div>

          <AnimatePresence>
              {displayLink && (
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-8 w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl ring-1 ring-slate-900/5 relative overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
                      <h3 className="text-xl font-medium text-slate-900 mb-2 flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-blue-500" />
                          <span>Relevant Link</span>
                      </h3>
                      <p className="text-slate-500 text-sm mb-6">{displayLink.description}</p>
                      
                      <div className="flex flex-col space-y-3">
                          <a 
                              href={displayLink.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors text-center"
                          >
                              Open Link
                          </a>
                          <button
                              onClick={() => setDisplayLink(null)}
                              className="w-full text-slate-500 hover:bg-slate-100 font-medium py-3 rounded-xl transition-colors text-center"
                          >
                              Dismiss
                          </button>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </div>
  );
}
