/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { pcmToBase64, base64ToPcm } from './lib/audioUtils';
import { Mic, MicOff, Stethoscope, Mail, Sparkles, X, Bot, ChevronRight, Clock, TrendingUp, Headset, Globe, Code, Copy, Check, MonitorPlay, Lock, Undo2, Redo2, Star, Quote, ChevronDown, Layout, ShieldCheck, CheckCircle2, Search, Zap, Loader2, Type, ListFilter, SortAsc, RefreshCcw, Timer, LayoutDashboard, FileText, FilePlus, FileMinus, FileArchive, FileKey, FileUp, FileDown , FileEdit, Image as ImageIcon, FileImage, RotateCw, Droplet, Scissors, Hash} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc, increment, setDoc } from 'firebase/firestore';
import { SupportAgent } from './components/SupportAgent';
import { TOP_100_LANGUAGES } from './data/languages';
import { SEOAnalyzer, SpeedTester, SitemapGenerator, URLExtractor, FAQGenerator, BusinessNameGenerator, PrivacyPolicyGenerator, TermsGenerator, RobotsGenerator, DomainGenerator, WordCounter, ReadingTimeCalculator, CaseConverter, RemoveDuplicateLines, TextSorter, TextReverser, BlogWriter, ArticleWriter, ParagraphGenerator, EssayWriter, VoiceAIUpsell, PDFToText, PDFMerge, PDFSplit, PDFCompress, PDFProtect, PDFUnlock, PDFToWord, PDFToImage, ImageToPDF, PDFRotate, PDFWatermark, PDFDeletePages, PDFPageNumbers } from './components/GrowthTools';
import { FeaturesPage } from './components/Features';
import { InteractiveWaveform } from './components/Waveform';
import { MouseFollowGlow } from './components/GlowEffect';
import { OneMinuteChallenge } from './components/OneMinuteChallenge';
import { FAQItem, COMMON_FAQS } from './components/FAQ';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { Pricing } from './components/Pricing';
import { AdminPanel } from './components/AdminPanel';
import { AgentAnalytics } from './components/AgentAnalytics';
import { UserStats } from './types';

type User = {
  email: string;
  name: string;
  id: string;
  role?: string;
  plan?: 'free' | 'pro' | 'enterprise';
};

export default function App() {
  if (window.location.pathname === '/widget' || window.VOICEGPT_CONFIG) {
    return (
      <>
        <style>{'body, html { background-color: transparent !important; }'}</style>
        <SupportAgent 
          defaultOpen={false} 
          hideAskMe={false} 
          mode="standalone" 
          userId={window.VOICEGPT_CONFIG?.userId}
        />
      </>
    );
  }

  const [isRecording, setIsRecording] = useState(false);

  const [appMode, setAppMode] = useState<'saas' | 'agent'>('saas');
  const [currentView, setCurrentView] = useState<'landing' | 'tools' | 'features' | 'pricing' | 'admin' | 'analytics'>('landing');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Optimization' | 'Documentation' | 'Generative' | 'PDF Tools'>('All');
  const [visibleToolsCount, setVisibleToolsCount] = useState(12);
  const [isCreating, setIsCreating] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [displayLink, setDisplayLink] = useState<{url: string, description: string} | null>(null);
  const [saasConfig, setSaasConfig] = useState({
    websiteName: '',
    agentName: '',
    websiteLinks: [''],
    customInstructions: '',
    voiceGender: 'female' as 'male' | 'female',
    language: 'English',
    personality: 'Friendly'
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
    // Check limit first
    const limit = user?.plan === 'enterprise' ? Infinity : (user?.plan === 'pro' ? 10000 : 50);
    if (userStats.totalMessages >= limit) {
      alert("Usage limit reached. Please upgrade your plan to continue using the voice agent.");
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const urlParams = new URLSearchParams({
        websiteName: saasConfig.websiteName || 'Acme Corp',
        agentName: saasConfig.agentName || 'Aoede',
        websiteLinks: JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim() !== '')),
        customInstructions: saasConfig.customInstructions || '',
        voiceGender: saasConfig.voiceGender,
        language: saasConfig.language,
        personality: saasConfig.personality,
        userId: user?.id || ''
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

      let responseLogged = false;
      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'display_link') {
           setDisplayLink(msg.payload);
        }
        if (msg.audio) {
          playAudioChunk(outputAudioCtx, msg.audio);
          
          // Log message to Firestore (only once per agent response)
          if (user && !responseLogged) {
            responseLogged = true;
            try {
              await updateDoc(doc(db, 'users', user.id), {
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
          responseLogged = false; // Reset for next turn
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

  useEffect(() => {
    setAuthLoading(true);
    let unsubDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: data.name || firebaseUser.displayName || 'User',
              role: data.role || (firebaseUser.email === 'admin@voiceagent.com' ? 'admin' : 'user'),
              plan: data.plan || 'free'
            });
            
            setUserStats(prev => ({
              ...prev,
              totalMessages: data.totalMessages || 0,
            }));
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: firebaseUser.email === 'admin@voiceagent.com' ? 'admin' : 'user',
              plan: 'free'
            });
          }
          setAuthLoading(false);
        }, (error) => {
          console.error("User doc snapshot error:", error);
          setAuthLoading(false);
        });
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentView('landing');
  };

  const handleAuthSuccess = (userData: { id: string; email: string; name: string; role?: string }) => {
    setUser(userData as User);
    setShowAuth(false);
    if (pendingAction === 'create_agent') {
      setIsCreating(true);
      setPendingAction(null);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    const planMap: Record<string, string> = {
      'free': 'free',
      'basic': 'basic',
      'pro': 'professional',
      'premium': 'professional',
      'professional': 'professional',
      'enterprise': 'enterprise'
    };
    
    const selectedPlan = planMap[planId] || 'free';
    
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          plan: selectedPlan,
          updatedAt: new Date().toISOString()
        });
        // Note: The onSnapshot listener will update the local user state
      } catch (err) {
        console.error("Failed to update plan:", err);
      }
      setIsCreating(true);
    } else {
      setPendingAction('create_agent');
      setAuthMode('signup');
      setShowAuth(true);
    }
  };

  const getMaxLinks = (plan?: string) => {
    switch (plan) {
      case 'basic': return 500;
      case 'pro':
      case 'professional':
      case 'enterprise':
      case 'premium':
        return 700;
      case 'free':
      default:
        return 3;
    }
  };

  const handleDashboard = () => {
    setCurrentView('analytics');
    setActiveTool(null);
  };

  const [userStats, setUserStats] = useState<UserStats>({
    totalMessages: 0,
    totalMinutes: 0,
    activeAgents: 0,
    satisfactionRate: 0,
    dailyUsage: []
  });

  useEffect(() => {
    if (user) {
      // Initialize with zeroed stats or fetch from DB (currently local state)
      setUserStats({
        totalMessages: 0,
        totalMinutes: 0,
        activeAgents: 1,
        satisfactionRate: 0,
        dailyUsage: []
      });
    }
  }, [user]);

  if (appMode === 'saas') {
    if (currentView === 'tools') {
      const handleCTA = () => {
        setIsCreating(true);
        setCurrentView('landing');
        setActiveTool(null);
      };

      const renderToolContent = () => {
        if (activeTool === 'seo') {
          return <SEOAnalyzer onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'speed') {
          return <SpeedTester onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'sitemap') {
          return <SitemapGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'url-extractor') {
          return <URLExtractor onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'faq-gen') {
          return <FAQGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'name-gen') {
          return <BusinessNameGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'privacy-gen') {
          return <PrivacyPolicyGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'terms-gen') {
          return <TermsGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'robots-gen') {
          return <RobotsGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'domain-gen') {
          return <DomainGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'word-counter') {
          return <WordCounter onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'reading-time') {
          return <ReadingTimeCalculator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'case-converter') {
          return <CaseConverter onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'remove-duplicates') {
          return <RemoveDuplicateLines onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'text-sorter') {
          return <TextSorter onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'text-reverser') {
          return <TextReverser onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'blog-writer') {
          return <BlogWriter onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'article-writer') {
          return <ArticleWriter onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'paragraph-gen') {
          return <ParagraphGenerator onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'essay-writer') {
          return <EssayWriter onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-to-text') {
          return <PDFToText onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-merge') {
          return <PDFMerge onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-split') {
          return <PDFSplit onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-compress') {
          return <PDFCompress onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-protect') {
          return <PDFProtect onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-unlock') {
          return <PDFUnlock onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-to-word') {
          return <PDFToWord onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-to-image') {
          return <PDFToImage onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'image-to-pdf') {
          return <ImageToPDF onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-rotate') {
          return <PDFRotate onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-watermark') {
          return <PDFWatermark onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-delete-pages') {
          return <PDFDeletePages onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }
        if (activeTool === 'pdf-page-numbers') {
          return <PDFPageNumbers onBack={() => setActiveTool(null)} onCTA={handleCTA} onToolSelect={setActiveTool} />;
        }

        return (
          <div className="max-w-6xl mx-auto w-full px-6 py-20">
             <div className="max-w-3xl mx-auto text-center mb-16">
                <button 
                  onClick={() => setCurrentView('landing')}
                  className="inline-flex items-center text-sm font-medium text-blue-600 mb-8 hover:-translate-x-1 transition-transform"
                >
                  <Undo2 className="w-4 h-4 mr-2" /> Back to Home
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight md:leading-tight max-w-2xl mx-auto">
                   Free growth tools
                </h1>
                <p className="text-lg text-slate-600">
                   Optimize your online presence and scale your customer interactions with our collection of free performance tools.
                </p>
             </div>

             <div className="flex flex-wrap justify-center gap-3 mb-12">
                {['All', 'Optimization', 'Documentation', 'Generative', 'PDF Tools'].map((cat) => (
                   <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat as any); setVisibleToolsCount(12); }}
                      className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                         activeCategory === cat 
                         ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                         : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-300 hover:text-blue-600'
                      }`}
                   >
                      {cat}
                   </button>
                ))}
             </div>

             <div className="flex flex-wrap justify-center gap-6">
                {(() => {
                  const allTools = [
                   {
                      id: 'seo',
                      category: 'Optimization',
                      title: "SEO Analyzer",
                      desc: "Complete audit of your website's search engine optimization. Get actionable insights to rank higher.",
                      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
                      color: "bg-blue-50"
                   },
                   {
                      id: 'speed',
                      category: 'Optimization',
                      title: "Website Speed Tester",
                      desc: "Measure your site's load time and performance scores across desktop and mobile devices.",
                      icon: <Clock className="w-6 h-6 text-teal-600" />,
                      color: "bg-teal-50"
                   },
                   {
                      id: 'sitemap',
                      category: 'Documentation',
                      title: "Sitemap Generator",
                      desc: "Automatically crawl your website and generate a production-ready XML sitemap in seconds.",
                      icon: <Globe className="w-6 h-6 text-indigo-600" />,
                      color: "bg-indigo-50"
                   },
                   {
                      id: 'url-extractor',
                      category: 'Generative',
                      title: "Website URL Extractor",
                      desc: "Crawl and extract all URLs from any website. Perfect for site mapping and content auditing.",
                      icon: <Layout className="w-6 h-6 text-purple-600" />,
                      color: "bg-purple-50"
                   },
                   {
                      id: 'faq-gen',
                      category: 'Generative',
                      title: "FAQ Generator",
                      desc: "Generate professional FAQs for your business in seconds based on your services.",
                      icon: <Sparkles className="w-6 h-6 text-amber-600" />,
                      color: "bg-amber-50"
                   },
                   {
                      id: 'name-gen',
                      category: 'Generative',
                      title: "Business Name Generator",
                      desc: "Find the perfect name for your next venture with AI-powered brand suggestions.",
                      icon: <Bot className="w-6 h-6 text-rose-600" />,
                      color: "bg-rose-50"
                   },
                   {
                      id: 'privacy-gen',
                      category: 'Documentation',
                      title: "Privacy Policy Generator",
                      desc: "Create a customized privacy policy for your website to stay compliant with regulations.",
                      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                      color: "bg-emerald-50"
                   },
                   {
                      id: 'terms-gen',
                      category: 'Documentation',
                      title: "Terms & Conditions Generator",
                      desc: "Professional terms of service documents tailored to your specific business model.",
                      icon: <CheckCircle2 className="w-6 h-6 text-slate-600" />,
                      color: "bg-slate-50"
                   },
                   {
                      id: 'robots-gen',
                      category: 'Optimization',
                      title: "Robots.txt Generator",
                      desc: "Generate optimized robots.txt files to guide search engine crawlers correctly.",
                      icon: <Code className="w-6 h-6 text-cyan-600" />,
                      color: "bg-cyan-50"
                   },
                   {
                      id: 'domain-gen',
                      category: 'Generative',
                      title: "Domain Name Generator",
                      desc: "Find the perfect domain for your business with instant availability suggestions.",
                      icon: <Search className="w-6 h-6 text-blue-600" />,
                      color: "bg-blue-50"
                   },
                   {
                      id: 'word-counter',
                      category: 'Optimization',
                      title: "Word Counter",
                      desc: "Analyze your content with real-time word, character, and reading time statistics.",
                      icon: <Zap className="w-6 h-6 text-emerald-600" />,
                      color: "bg-emerald-50"
                   },
                   {
                      id: 'reading-time',
                      category: 'Optimization',
                      title: "Reading Time Calculator",
                      desc: "Accurately estimate how long it will take to read your content at different speeds.",
                      icon: <Timer className="w-6 h-6 text-blue-600" />,
                      color: "bg-blue-50"
                   },
                   {
                      id: 'case-converter',
                      category: 'Optimization',
                      title: "Case Converter",
                      desc: "Instantly switch between UPPERCASE, lowercase, Title Case, and more.",
                      icon: <Type className="w-6 h-6 text-purple-600" />,
                      color: "bg-purple-50"
                   },
                   {
                      id: 'remove-duplicates',
                      category: 'Optimization',
                      title: "Remove Duplicate Lines",
                      desc: "Clean up your lists and data by instantly removing repeating lines or entries.",
                      icon: <ListFilter className="w-6 h-6 text-rose-600" />,
                      color: "bg-rose-50"
                   },
                   {
                      id: 'text-sorter',
                      category: 'Optimization',
                      title: "Text Sorter",
                      desc: "Alphabetize or sort your text lines in ascending or descending order instantly.",
                      icon: <SortAsc className="w-6 h-6 text-amber-600" />,
                      color: "bg-amber-50"
                   },
                   {
                      id: 'text-reverser',
                      category: 'Optimization',
                      title: "Text Reverser",
                      desc: "Flip your text backwards or reverse the order of lines in your content.",
                      icon: <RefreshCcw className="w-6 h-6 text-indigo-600" />,
                      color: "bg-indigo-50"
                   },
                   {
                      id: 'blog-writer',
                      category: 'Generative',
                      title: "AI Blog Writer",
                      desc: "Generate high-quality, SEO-friendly blog posts based on your topic and keywords.",
                      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
                      color: "bg-blue-50"
                   },
                   {
                      id: 'article-writer',
                      category: 'Generative',
                      title: "AI Article Writer",
                      desc: "Create long-form articles with structured headings and professional tone.",
                      icon: <Bot className="w-6 h-6 text-indigo-600" />,
                      color: "bg-indigo-50"
                   },
                   {
                      id: 'paragraph-gen',
                      category: 'Generative',
                      title: "AI Paragraph Generator",
                      desc: "Expand your ideas into well-structured, coherent paragraphs instantly.",
                      icon: <Zap className="w-6 h-6 text-amber-600" />,
                      color: "bg-amber-50"
                   },
                   {
                      id: 'essay-writer',
                      category: 'Generative',
                      title: "AI Essay Writer",
                      desc: "Write academic or informative essays with proper introduction, body, and conclusion.",
                      icon: <Code className="w-6 h-6 text-rose-600" />,
                      color: "bg-rose-50"
                   },
                   {
                      id: 'pdf-to-text',
                      category: 'PDF Tools',
                      title: "PDF to Text",
                      desc: "Extract clean, readable text from any PDF document instantly.",
                      icon: <FileText className="w-6 h-6 text-blue-600" />,
                      color: "bg-blue-50"
                   },
                   {
                      id: 'pdf-merge',
                      category: 'PDF Tools',
                      title: "Merge PDF",
                      desc: "Combine multiple PDF files into a single document easily.",
                      icon: <FilePlus className="w-6 h-6 text-indigo-600" />,
                      color: "bg-indigo-50"
                   },
                   {
                      id: 'pdf-split',
                      category: 'PDF Tools',
                      title: "Split PDF",
                      desc: "Extract pages or split a large PDF into smaller, manageable files.",
                      icon: <FileMinus className="w-6 h-6 text-teal-600" />,
                      color: "bg-teal-50"
                   },
                   {
                      id: 'pdf-compress',
                      category: 'PDF Tools',
                      title: "Compress PDF",
                      desc: "Reduce the file size of your PDFs while maintaining quality.",
                      icon: <FileArchive className="w-6 h-6 text-amber-600" />,
                      color: "bg-amber-50"
                   },
                   {
                      id: 'pdf-protect',
                      category: 'PDF Tools',
                      title: "Protect PDF",
                      desc: "Add password protection to secure your sensitive PDF documents.",
                      icon: <FileKey className="w-6 h-6 text-rose-600" />,
                      color: "bg-rose-50"
                   },
                   {
                      id: 'pdf-unlock',
                      category: 'PDF Tools',
                      title: "Unlock PDF",
                      desc: "Remove passwords and restrictions from your PDF files.",
                      icon: <FileDown className="w-6 h-6 text-purple-600" />,
                      color: "bg-purple-50"
                   },
                   {
                      id: 'pdf-to-word',
                      category: 'PDF Tools',
                      title: "PDF to Word",
                      desc: "Convert PDF documents to editable Microsoft Word files.",
                      icon: <FileEdit className="w-6 h-6 text-blue-600" />,
                      color: "bg-blue-50"
                   },
                   {
                      id: 'pdf-to-image',
                      category: 'PDF Tools',
                      title: "PDF to Image",
                      desc: "Extract images from PDF or convert pages to JPG/PNG.",
                      icon: <ImageIcon className="w-6 h-6 text-emerald-600" />,
                      color: "bg-emerald-50"
                   },
                   {
                      id: 'image-to-pdf',
                      category: 'PDF Tools',
                      title: "Image to PDF",
                      desc: "Convert JPG, PNG, and other images to PDF format.",
                      icon: <FileImage className="w-6 h-6 text-indigo-600" />,
                      color: "bg-indigo-50"
                   },
                   {
                      id: 'pdf-rotate',
                      category: 'PDF Tools',
                      title: "Rotate PDF",
                      desc: "Rotate your PDF pages to the correct orientation.",
                      icon: <RotateCw className="w-6 h-6 text-amber-600" />,
                      color: "bg-amber-50"
                   },
                   {
                      id: 'pdf-watermark',
                      category: 'PDF Tools',
                      title: "Add Watermark",
                      desc: "Stamp an image or text watermark over your PDF.",
                      icon: <Droplet className="w-6 h-6 text-cyan-600" />,
                      color: "bg-cyan-50"
                   },
                   {
                      id: 'pdf-delete-pages',
                      category: 'PDF Tools',
                      title: "Delete Pages",
                      desc: "Remove unwanted pages from your PDF documents.",
                      icon: <Scissors className="w-6 h-6 text-rose-600" />,
                      color: "bg-rose-50"
                   },
                   {
                      id: 'pdf-page-numbers',
                      category: 'PDF Tools',
                      title: "Add Page Numbers",
                      desc: "Insert page numbers into your PDF documents with ease.",
                      icon: <Hash className="w-6 h-6 text-slate-600" />,
                      color: "bg-slate-50"
                   }
                ];
                
                const filteredTools = allTools.filter(t => activeCategory === 'All' || (t as any).category === activeCategory);
                const displayedTools = filteredTools.slice(0, visibleToolsCount);
                
                return (
                  <>
                    {displayedTools.map((tool, i) => (
                      <motion.div
                         key={i}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: (i % 12) * 0.05 }}
                         className="bg-white p-6 rounded-[32px] ring-1 ring-slate-200 shadow-sm hover:shadow-xl hover:ring-blue-100 transition-all group flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)]"
                      >
                         <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            {tool.icon}
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-2">{tool.title}</h3>
                         <p className="text-slate-500 text-base leading-relaxed mb-4">
                            {tool.desc}
                         </p>
                         <button 
                            onClick={() => setActiveTool(tool.id as any)}
                           className="mt-auto flex items-center text-blue-600 font-bold hover:translate-x-1 transition-transform"
                         >
                            Use Tool <ChevronRight className="w-5 h-5 ml-1" />
                         </button>
                      </motion.div>
                    ))}
                    {filteredTools.length > visibleToolsCount && (
                      <div className="w-full flex justify-center mt-10">
                        <button 
                          onClick={() => setVisibleToolsCount(prev => prev + 12)} 
                          className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl ring-1 ring-slate-200 hover:ring-blue-300 hover:text-blue-700 hover:shadow-lg transition-all"
                        >
                          Show More Tools
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
             </div>
          </div>
        );
      };

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <header className="pt-0 mt-0 border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-50">
             <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
                <button onClick={() => {setCurrentView('landing'); setActiveTool(null);}} className="flex items-center space-x-2 text-blue-600 hover:opacity-80 transition-opacity">
                   <Bot className="w-6 h-6" />
                   <span className="font-semibold text-lg tracking-tight text-slate-900">VoiceGPT</span>
                </button>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                   <button onClick={() => {setCurrentView('landing'); setActiveTool(null);}} className="hover:text-blue-600 transition-colors">Home</button>
                   <button onClick={() => {setCurrentView('features'); setActiveTool(null);}} className={`hover:text-blue-600 transition-colors ${currentView === 'features' ? 'text-blue-600 font-bold' : ''}`}>Features</button>
                   <button 
                      onClick={() => {setCurrentView('tools'); setActiveTool(null);}}
                      className="text-blue-600 font-bold"
                   >
                      Free Tools
                   </button>
                   <button onClick={() => {setCurrentView('pricing'); setActiveTool(null);}} className={`hover:text-blue-600 transition-colors ${currentView === 'pricing' ? 'text-blue-600 font-bold' : ''}`}>Pricing</button>
                   <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                </nav>
                <button 
                   onClick={() => setIsCreating(true)}
                   className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                   Create Agent
                </button>
                <div className="flex items-center space-x-4">
                  {user ? (
                    <UserProfile 
                      user={user} 
                      onLogout={handleLogout} 
                      onDashboard={handleDashboard}
                      onAdminPanel={() => setCurrentView("admin")} 
                    />
                  ) : (
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => {setAuthMode('signin'); setShowAuth(true);}}
                        className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => {setCurrentView('pricing'); setActiveTool(null);}}
                        className="text-sm font-medium text-white bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
                      >
                        Let's Get Started
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </header>

          <main className="flex-1">
             {currentView === 'features' && <FeaturesPage />}
             {currentView === 'pricing' && <Pricing onSelectPlan={handleSelectPlan} />}
             {currentView === 'admin' && user?.role === 'admin' && <AdminPanel />}
             {currentView === 'tools' && renderToolContent()}
          </main>

          <footer className="border-t border-slate-200/60 bg-white py-8">
             <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
                <div className="flex items-center space-x-2">
                   <Bot className="w-5 h-5 text-slate-400" />
                   <span>© 2026 VoiceGPT Inc. All rights reserved.</span>
                </div>
             </div>
          </footer>
          <AuthModal 
            isOpen={showAuth} 
            onClose={() => setShowAuth(false)} 
            onSuccess={handleAuthSuccess} initialMode={authMode}
          />
        </div>
      );
    }

    if (!isCreating) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <header className="pt-0 mt-0 border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-50">
             <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
                <button onClick={() => {setCurrentView('landing'); setActiveTool(null);}} className="flex items-center space-x-2 text-blue-600 hover:opacity-80 transition-opacity">
                   <Bot className="w-6 h-6" />
                   <span className="font-semibold text-lg tracking-tight text-slate-900">VoiceGPT</span>
                </button>
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                   <button onClick={() => {setCurrentView('landing'); setActiveTool(null);}} className={`hover:text-blue-600 transition-colors ${currentView === 'landing' ? 'text-blue-600' : ''}`}>Home</button>
                   <button onClick={() => {setCurrentView('features'); setActiveTool(null);}} className={`hover:text-blue-600 transition-colors ${currentView === 'features' ? 'text-blue-600 font-bold' : ''}`}>Features</button>
                   <button 
                      onClick={() => {setCurrentView('tools'); setActiveTool(null);}}
                      className={`hover:text-blue-600 transition-colors ${currentView === 'tools' ? 'text-blue-600' : ''}`}
                   >
                      Free Tools
                   </button>
                   <button onClick={() => {setCurrentView('pricing'); setActiveTool(null);}} className={`hover:text-blue-600 transition-colors ${currentView === 'pricing' ? 'text-blue-600 font-bold' : ''}`}>Pricing</button>
                   <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                </nav>
                <div className="flex items-center space-x-4">
                  {user ? (
                    <UserProfile 
                      user={user} 
                      onLogout={handleLogout} 
                      onDashboard={handleDashboard}
                      onAdminPanel={() => setCurrentView("admin")} 
                    />
                  ) : (
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => {setAuthMode('signin'); setShowAuth(true);}}
                        className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => {setCurrentView('pricing'); setActiveTool(null);}}
                        className="text-sm font-medium text-white bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
                      >
                        Let's Get Started
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </header>
          
          <main className="flex-1 flex flex-col items-center relative overflow-hidden">
             {currentView === 'landing' && (
               <>
                 <MouseFollowGlow />
                 <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[120px] opacity-60 pointer-events-none" />
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100 blur-[100px] opacity-60 pointer-events-none" />
                 
                 <div className="max-w-5xl w-full z-10 text-center space-y-6 px-6 py-10 md:py-16">
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold ring-1 ring-blue-500/20 mb-4"
                 >
                    <Zap className="w-4 h-4" />
                    <span>Create your voice agent in under 60 seconds</span>
                 </motion.div>
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight md:leading-tight max-w-2xl mx-auto"
                 >
                    Supercharge your website with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Voice AI</span>
                 </motion.h1>
                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-lg text-slate-600 max-w-3xl mx-auto"
                 >
                    Train your superhuman AI voice agent instantly by pasting your website URL. Auto-detects your data and handles customer queries in under 60 seconds.
                 </motion.p>
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="py-4"
                 >
                    <InteractiveWaveform />
                 </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
                 >
                   <button 
                      onClick={() => {setCurrentView('pricing'); setActiveTool(null);}}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-blue-800 transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
                   >
                      <span>Create your voice AI agent</span>
                      <ChevronRight className="w-5 h-5" />
                   </button>
                   <button 
                      onClick={() => setShowDemo(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-full text-lg ring-1 ring-slate-200 hover:bg-slate-50 transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
                   >
                      <span>See Demo</span>
                   </button>
                 </motion.div>
              </div>


             {/* Feature Cards Section */}
             <div className="max-w-7xl w-full mx-auto py-10 md:py-16 z-10 px-6">
                <div className="text-center mb-16">
                   <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Grow your business automatically</h2>
                   <p className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto">Our AI handles the interactions, allowing you to focus on growth.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                   <motion.div
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                      className="bg-white p-8 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                   >
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                         <Clock className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111827] mb-3">24/7 Availability</h3>
                      <p className="text-slate-500 text-base font-medium leading-relaxed">Never miss a potential lead. Your voice agent works around the clock, answering queries anytime.</p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                      className="bg-white p-8 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                   >
                      <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                         <TrendingUp className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111827] mb-3">Increased Conversions</h3>
                      <p className="text-slate-500 text-base font-medium leading-relaxed">Engage users instantly with human-like voice AI. Turn silent visitors into active, engaged customers.</p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                      className="bg-white p-8 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                   >
                      <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                         <Globe className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111827] mb-3">Instant Knowledge</h3>
                      <p className="text-slate-500 text-base font-medium leading-relaxed">Automatically syncs with your website. Your AI knows every page, pricing plan, and contact detail directly.</p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                      className="bg-white p-8 rounded-3xl ring-1 ring-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                   >
                      <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                         <Headset className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111827] mb-3">Reduce Support Load</h3>
                      <p className="text-slate-500 text-base font-medium leading-relaxed">Free up your human staff. Let AI resolve common repetitive questions so your team can focus on complex tasks.</p>
                   </motion.div>
                </div>
             </div>

             {/* Before & After Comparison Section */}
             <div className="max-w-5xl w-full mx-auto py-10 md:py-16 px-6 z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                   <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                      Imagine what you could do if you had an <span className="underline decoration-dotted underline-offset-8 decoration-slate-400">expert voice AI answering calls 24/7</span>
                   </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                   {/* Before Card */}
                   <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="bg-white rounded-2xl p-8 md:p-10 ring-1 ring-slate-200 shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
                   >
                      <div>
                         <div className="flex items-center space-x-2 text-slate-500 font-medium text-sm mb-6">
                            <Undo2 className="w-4 h-4 text-slate-400" />
                            <span>Before</span>
                         </div>
                         <h3 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight leading-snug mb-8">
                            Fickle, one-size-fits-all voice bots that do more harm than good
                         </h3>
                      </div>
                      
                      <ul className="space-y-4 pt-4 border-t border-slate-100">
                         <li className="flex items-start space-x-3 text-slate-600 text-base">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                            <span>Generic tools don't answer based on your website data</span>
                         </li>
                         <li className="flex items-start space-x-3 text-slate-600 text-base">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                            <span>Custom systems are finicky and difficult to maintain</span>
                         </li>
                         <li className="flex items-start space-x-3 text-slate-600 text-base">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                            <span>Customer service staff takes 3+ months to train</span>
                         </li>
                      </ul>
                   </motion.div>

                   {/* After Card */}
                   <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                      className="bg-blue-600 rounded-2xl p-8 md:p-10 shadow-lg shadow-blue-600/15 flex flex-col justify-between text-left relative overflow-hidden text-white hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
                   >
                      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                      <div className="relative z-10">
                         <div className="flex items-center space-x-2 text-blue-100 font-medium text-sm mb-6">
                            <span>After</span>
                            <Redo2 className="w-4 h-4 text-blue-200" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight leading-snug mb-8">
                             An automated voice resource that supercharges your support team
                          </h3>
                       </div>

                       <ul className="space-y-4 pt-4 border-t border-blue-500/50 relative z-10">
                          <li className="flex items-start space-x-3 text-blue-50 text-base">
                             <Check className="w-4 h-4 text-white mt-1.5 shrink-0" strokeWidth={3} />
                             <span>Provide 24/7/365 quality human-like responses</span>
                          </li>
                          <li className="flex items-start space-x-3 text-blue-50 text-base">
                             <Check className="w-4 h-4 text-white mt-1.5 shrink-0" strokeWidth={3} />
                             <span>Automate answering the vast majority of calls</span>
                          </li>
                          <li className="flex items-start space-x-3 text-blue-50 text-base">
                             <Check className="w-4 h-4 text-white mt-1.5 shrink-0" strokeWidth={3} />
                             <span>Make your current support team twice as productive</span>
                          </li>
                       </ul>
                    </motion.div>
                </div>
             </div>


             {/* How it Works Section */}
             <div className="max-w-6xl w-full mx-auto py-10 md:py-16 px-6 z-10">
                <div className="text-center mb-16">
                   <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                      You're <span className="text-blue-600">three easy steps</span> away from your own personalized AI voice agent
                   </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
                   <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex flex-col items-start"
                   >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg shadow-blue-600/20">
                         1
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900 mb-4 underline decoration-dotted decoration-slate-400 underline-offset-8">
                         Sync training data
                      </h3>
                      <p className="text-slate-500 text-lg leading-relaxed">
                         Enter your website URL or upload documentation to give your voice agent the instant knowledge it needs to answer any question.
                      </p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex flex-col items-start"
                   >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg shadow-blue-600/20">
                         2
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900 mb-4 underline decoration-dotted decoration-slate-400 underline-offset-8">
                         Customize voice
                      </h3>
                      <p className="text-slate-500 text-lg leading-relaxed">
                         Choose from a variety of human-like voices and define exactly how your agent should greet and assist your callers.
                      </p>
                   </motion.div>

                   <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex flex-col items-start"
                   >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-6 shadow-lg shadow-blue-600/20">
                         3
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900 mb-4 underline decoration-dotted decoration-slate-400 underline-offset-8">
                         Deploy & Go Live
                      </h3>
                      <p className="text-slate-500 text-lg leading-relaxed">
                         Integrate your agent with your phone system or website. Start handling calls 24/7 and improve from every interaction.
                      </p>
                   </motion.div>
                </div>
             </div>

             {/* FAQ Section */}
             <div className="max-w-4xl w-full mx-auto py-10 md:py-16 px-6 z-10 relative">
                <div className="text-center mb-16">
                   <h3 className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-3">
                      Knowledge Base
                   </h3>
                   <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                      Frequently Asked Questions
                   </h2>
                   <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                      Everything you need to know about integrating our next-generation voice AI into your business.
                   </p>
                </div>

                <div className="space-y-2">
                   {[
                      {
                         q: "How long does it take to set up?",
                         a: "Setting up a basic voice agent takes less than 60 seconds. Simply enter your website URL, choose a voice, and you're ready to go live. Integration into your existing phone system usually takes another 5-10 minutes."
                      },
                      {
                         q: "Can I customize the agent's knowledge?",
                         a: "Yes! The agent automatically learns from your website content, but you can also provide custom instructions, upload PDFs, or manually edit responses to ensure 100% accuracy."
                      },
                      {
                         q: "Does it support multiple languages?",
                         a: "Absolutely. Our voice agents are polyglots, supporting over 50+ languages including Spanish, French, German, Mandarin, and many more, with localized accents for each."
                      },
                      {
                         q: "How does human hand-off work?",
                         a: "If the agent encounters a complex query it can't resolve, it can instantly transfer the call to your live support team via SIP or ring your office number directly."
                      },
                      {
                         q: "Is our data secure and private?",
                         a: "Security is our top priority. We use industry-standard encryption for all data at rest and in transit, and we are fully SOC2 and GDPR compliant."
                      },
                      {
                         q: "What phone systems do you support?",
                         a: "We support major cloud phone systems via SIP trunking including RingCentral, Dialpad, and 8x8, and offer a simple web-based embed for direct website calls."
                      }
                   ].map((faq, i) => (
                      <FAQItem key={i} question={faq.q} answer={faq.a} />
                   ))}
                </div>
             </div>
             <Pricing />
               </>
             )}
             {currentView === 'features' && <FeaturesPage />}
             {currentView === 'pricing' && <Pricing onSelectPlan={handleSelectPlan} />}
             {currentView === 'admin' && user?.role === 'admin' && <AdminPanel />}
             {currentView === 'analytics' && (
                <div className="w-full flex-1 flex flex-col">
                  <AgentAnalytics 
                    stats={userStats} 
                    config={saasConfig} 
                    plan={user?.plan || 'free'}
                    userId={user?.id}
                    onUpgrade={() => {
                      setCurrentView('pricing');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onUpdateConfig={(newConfig) => setSaasConfig(newConfig)}
                    onTest={() => setAppMode('agent')}
                    onAddNewAgent={() => setIsCreating(true)}
                  />
                </div>
             )}
          </main>

          <footer className="border-t border-slate-200/60 bg-white py-8 z-10 relative">
             <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                   <Bot className="w-5 h-5 text-slate-400" />
                   <span>© 2026 VoiceGPT Inc. All rights reserved.</span>
                </div>
                <div className="flex space-x-6">
                   <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                   <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
                </div>
             </div>
          </footer>
          <SupportAgent isOpen={showDemo} onOpenChange={setShowDemo} userId={user?.id} />
          <AuthModal 
            isOpen={showAuth} 
            onClose={() => setShowAuth(false)} 
            onSuccess={handleAuthSuccess} initialMode={authMode}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="pt-0 mt-0 border-b border-slate-200/60 bg-white/50 backdrop-blur-md sticky top-0 z-50">
           <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-600">
                 <Bot className="w-6 h-6" />
                 <span className="font-semibold text-lg tracking-tight text-slate-900">VoiceGPT</span>
              </div>
              <div className="flex items-center space-x-4">
                  {user ? (
                    <UserProfile 
                      user={user} 
                      onLogout={handleLogout} 
                      onDashboard={handleDashboard}
                      onAdminPanel={() => setCurrentView("admin")} 
                    />
                  ) : (
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => {setAuthMode('signin'); setShowAuth(true);}}
                        className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => {setCurrentView('pricing'); setActiveTool(null);}}
                        className="text-sm font-medium text-white bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
                      >
                        Let's Get Started
                      </button>
                    </div>
                  )}
                </div>
           </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center py-10 md:py-16 px-6 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-[100px] opacity-60 pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-100 blur-[100px] opacity-60 pointer-events-none" />
          
          <div className="max-w-xl w-full z-10 bg-white p-10 md:p-12 rounded-[32px] shadow-xl ring-1 ring-slate-900/5 my-8">
            <div className="flex flex-col items-center mb-10">
               <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100 mb-6">
                   <Sparkles className="w-8 h-8 text-blue-500" />
               </div>
               <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Create your voice agent</h1>
               <p className="text-slate-500 mt-3 text-center text-lg">Configure your website's AI agent in seconds.</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Website Name</label>
                  <input 
                     type="text" 
                     value={saasConfig.websiteName}
                     onChange={e => setSaasConfig({...saasConfig, websiteName: e.target.value})}
                     placeholder="e.g. Acme Corp"
                     className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Agent Name</label>
                  <input 
                     type="text" 
                     value={saasConfig.agentName}
                     onChange={e => setSaasConfig({...saasConfig, agentName: e.target.value})}
                     placeholder="e.g. Sarah"
                     className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Website Pages (Context for AI)</label>
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
                              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"
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
                      disabled={saasConfig.websiteLinks.length >= getMaxLinks(user?.plan)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      + Add another page link (Max {getMaxLinks(user?.plan)})
                  </button>
               </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Voice Gender</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setSaasConfig({...saasConfig, voiceGender: 'female'})}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        saasConfig.voiceGender === 'female' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <Bot className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="font-medium">Female</span>
                    </button>
                    <button 
                      onClick={() => setSaasConfig({...saasConfig, voiceGender: 'male'})}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        saasConfig.voiceGender === 'male' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <Bot className="w-6 h-6 text-slate-600" />
                      </div>
                      <span className="font-medium">Male</span>
                    </button>
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Primary Language</label>
                  <select 
                    value={saasConfig.language}
                    onChange={(e) => setSaasConfig({...saasConfig, language: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-900"
                  >
                    {TOP_100_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Agent Personality</label>
                  <select 
                    value={saasConfig.personality}
                    onChange={(e) => setSaasConfig({...saasConfig, personality: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-900"
                  >
                    {['Friendly', 'Professional', 'Concise', 'Enthusiastic', 'Empathetic', 'Witty', 'Direct'].map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Custom Instructions (Optional)</label>
                  <textarea 
                     value={saasConfig.customInstructions}
                     onChange={e => setSaasConfig({...saasConfig, customInstructions: e.target.value})}
                     placeholder="e.g. Be very helpful and focus on pushing our premium plans."
                     rows={3}
                     className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed resize-none"
                  />
               </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                 onClick={() => {
                   const maxLinks = getMaxLinks(user?.plan);
                   const cleanedLinks = saasConfig.websiteLinks.filter(l => l.trim() !== '').slice(0, maxLinks);
                   setSaasConfig({ 
                     ...saasConfig, 
                     websiteLinks: cleanedLinks.length > 0 ? cleanedLinks : [''] 
                   });
                   setAppMode('agent');
                 }}
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
                 <span>© 2026 VoiceGPT Inc. All rights reserved.</span>
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
         <button 
            onClick={() => { setAppMode('saas'); setCurrentView('analytics'); setIsCreating(false); stopRecording(); }} 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
         >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
         </button>
         <button onClick={() => setShowEmbed(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-sm">
            <Code className="w-4 h-4" />
            <span>Embed on your website</span>
         </button>
      </div>

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
            className="bg-white max-w-3xl w-full rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
             <button onClick={() => setShowEmbed(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
             </button>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Embed your agent</h2>
                  <p className="text-slate-500 mb-6 text-sm">Copy and paste this script into your website to enable the voice agent.</p>
                  <div className="bg-slate-900 rounded-xl p-4 relative group mb-4">
                     <pre className="text-slate-300 text-xs overflow-x-auto font-mono leading-relaxed h-[300px] whitespace-pre-wrap">
 {`<script type='text/javascript'>
//<![CDATA[
  window.VOICEGPT_CONFIG = {
    websiteName: ${JSON.stringify(saasConfig.websiteName)},
    agentName: ${JSON.stringify(saasConfig.agentName)},
    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},
    customInstructions: ${JSON.stringify(saasConfig.customInstructions)},
    voiceGender: ${JSON.stringify(saasConfig.voiceGender)},
    language: ${JSON.stringify(saasConfig.language)},
    personality: ${JSON.stringify(saasConfig.personality)},
    userId: ${JSON.stringify(user?.id)}
  };
  (function() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = '${window.location.origin}/vagent.js';
    document.body.appendChild(s);
  })();
//]]>
</script>`}
                     </pre>
                     <button 
                        onClick={() => {
                            window.navigator.clipboard.writeText(`<script type='text/javascript'>\n//<![CDATA[\n  window.VOICEGPT_CONFIG = {\n    websiteName: ${JSON.stringify(saasConfig.websiteName)},\n    agentName: ${JSON.stringify(saasConfig.agentName)},\n    websiteLinks: ${JSON.stringify(saasConfig.websiteLinks.filter(l => l.trim()))},\n    customInstructions: ${JSON.stringify(saasConfig.customInstructions)},\n    voiceGender: ${JSON.stringify(saasConfig.voiceGender)},\n    language: ${JSON.stringify(saasConfig.language)},\n    personality: ${JSON.stringify(saasConfig.personality)},\n    userId: ${JSON.stringify(user?.id)}\n  };\n  (function() {\n    var s = document.createElement('script');\n    s.type = 'text/javascript';\n    s.src = '${window.location.origin}/vagent.js';\n    document.body.appendChild(s);\n  })();\n//]]>\n</script>`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg transition-colors"
                     >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                     </button>
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    Tip: Place this just before the closing &lt;/body&gt; tag for best performance. 
                    <strong className="text-amber-400 block mt-1">Important: If using Blogger or WordPress, make sure to paste this into the "HTML" editor, not the "Visual" editor.</strong>
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">How to install</h3>
                  
                  <div className="space-y-6">
                    {[
                      {
                        step: 1,
                        title: "Copy the code",
                        desc: "Click the copy icon to grab your unique integration script."
                      },
                      {
                        step: 2,
                        title: "Open your editor",
                        desc: "Open your website's source code or CMS (WordPress, Webflow, etc)."
                      },
                      {
                        step: 3,
                        title: "Paste script",
                        desc: "Paste the script at the very bottom of your HTML, right before the </body> tag."
                      },
                      {
                        step: 4,
                        title: "Go live",
                        desc: "Save your changes and refresh your site to see your agent in action!"
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="flex space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                          <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500 flex items-center">
                      <Lock className="w-3 h-3 mr-2" /> Secure, high-performance delivery
                    </p>
                  </div>
                </div>
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
          <SupportAgent userId={user?.id} />
          <AuthModal 
            isOpen={showAuth} 
            onClose={() => setShowAuth(false)} 
            onSuccess={handleAuthSuccess} initialMode={authMode}
          />

          <AnimatePresence>
              {authLoading && (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                  >
                      <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 animate-pulse">
                          <ShieldCheck className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-3">Authenticating...</h2>
                      <p className="text-slate-400 text-lg max-w-sm">Verifying your secure magic link. You'll be logged in shortly.</p>
                      <div className="mt-8 flex items-center space-x-2 text-blue-400 font-medium bg-blue-500/10 px-4 py-2 rounded-full">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Finalizing connection</span>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </div>
  );
}
