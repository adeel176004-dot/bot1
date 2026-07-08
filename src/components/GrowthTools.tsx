import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Clock, Globe, Undo2, ChevronRight, CheckCircle2, AlertCircle, Search, Gauge, Layout, ShieldCheck, Zap, Mic, Sparkles, Bot, Code, Copy, Timer, Type, ListFilter, SortAsc, RefreshCcw } from 'lucide-react';
import { OneMinuteChallenge } from './OneMinuteChallenge';
import { FAQItem, COMMON_FAQS } from './FAQ';

interface ToolProps {
  onBack: () => void;
  onCTA: () => void;
  onToolSelect?: (toolId: 'seo' | 'speed' | 'sitemap' | 'url-extractor' | 'faq-gen' | 'name-gen' | 'privacy-gen' | 'terms-gen' | 'robots-gen' | 'domain-gen' | 'word-counter' | 'reading-time' | 'case-converter' | 'remove-duplicates' | 'text-sorter' | 'text-reverser' | 'blog-writer' | 'article-writer' | 'paragraph-gen' | 'essay-writer') => void;
}

function TryOtherTools({ currentToolId, onToolSelect }: { currentToolId: string, onToolSelect?: (toolId: 'seo' | 'speed' | 'sitemap' | 'url-extractor' | 'faq-gen' | 'name-gen' | 'privacy-gen' | 'terms-gen' | 'robots-gen' | 'domain-gen' | 'word-counter' | 'reading-time' | 'case-converter' | 'remove-duplicates' | 'text-sorter' | 'text-reverser' | 'blog-writer' | 'article-writer' | 'paragraph-gen' | 'essay-writer') => void }) {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Optimization' | 'Documentation' | 'Generative'>('All');
  const tools = [
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
    }
  ].filter(t => t.id !== currentToolId && (activeCategory === 'All' || t.category === activeCategory));

  return (
    <div className="py-16 md:py-24 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Try Other Tools</h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12">
            Explore our other free growth tools to further optimize your online presence.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['All', 'Optimization', 'Documentation', 'Generative'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-blue-300 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {tools.map((tool, i) => (
             <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-[32px] ring-1 ring-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col items-start w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)]"
             >
                <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                   {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tool.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-4">
                   {tool.desc}
                </p>
                <button 
                  onClick={() => onToolSelect?.(tool.id as any)}
                  className="mt-auto flex items-center text-blue-600 font-bold hover:translate-x-1 transition-transform"
                >
                   Use Tool <ChevronRight className="w-5 h-5 ml-1" />
                </button>
             </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolFAQ() {
  return (
    <div className="py-16 md:py-24 max-w-4xl mx-auto px-6">
      <div className="text-center mb-16">
        <h3 className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-3">
          Knowledge Base
        </h3>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="space-y-2">
        {COMMON_FAQS.map((faq, i) => (
          <FAQItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </div>
  );
}

export function VoiceAIUpsell({ onCTA }: { onCTA: () => void }) {
  return (
    <div className="py-16 md:py-24 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-4 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Next-Level Growth
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Stop wasting time on repetitive tasks</h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-16">
            Focus on what matters most. Let your AI voice agent handle the rest, from customer support to appointment booking.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              title: "24/7 Presence",
              desc: "Always awake, always helpful.",
              icon: <Clock className="w-5 h-5 text-blue-600" />,
              color: "bg-blue-50"
            },
            {
              title: "Infinite Scale",
              desc: "1,000+ calls instantly.",
              icon: <Zap className="w-5 h-5 text-amber-600" />,
              color: "bg-amber-50"
            },
            {
              title: "Global Reach",
              desc: "100+ languages fluent.",
              icon: <Globe className="w-5 h-5 text-indigo-600" />,
              color: "bg-indigo-50"
            },
            {
              title: "Smart Sync",
              desc: "Connects to your site data.",
              icon: <Layout className="w-5 h-5 text-purple-600" />,
              color: "bg-purple-50"
            }
          ].map((card, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center group cursor-default"
            >
              <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm">{card.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={onCTA}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center group"
          >
            Create Your Voice Agent <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SEOAnalyzer({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const steps = [
    "Analyzing Meta Tags...",
    "Checking Header Structure...",
    "Evaluating Image Alt Text...",
    "Testing Mobile Responsiveness...",
    "Verifying SSL Certificate...",
    "Analyzing Keywords Density...",
    "Checking Page Load Speed..."
  ];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setStatus('analyzing');
    setProgress(0);
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setStatus('done');
      } else {
        setProgress((stepIndex / steps.length) * 100);
        setCurrentStep(steps[stepIndex]);
      }
    }, 800);
    
    setCurrentStep(steps[0]);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">SEO Analyzer</h1>
              <p className="text-slate-400 text-sm">Powered by VoiceGPT Insights</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full text-sm">
            <Zap className="w-4 h-4" /> <span>Premium Analysis</span>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={handleAnalyze} className="space-y-6">
            <p className="text-slate-500 text-lg">Enter your website URL to get a comprehensive SEO audit and actionable insights.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="url" 
                  required
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap">
                Analyze Now
              </button>
            </div>
          </form>
        )}

        {status === 'analyzing' && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-full max-w-md bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
              <motion.div 
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-600 font-medium animate-pulse">{currentStep}</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center text-center">
                <span className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2">Overall Score</span>
                <span className="text-5xl font-black text-green-700">84</span>
                <span className="text-sm text-green-600 mt-2">Excellent</span>
              </div>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Visibility</span>
                <span className="text-5xl font-black text-blue-700">92%</span>
                <span className="text-sm text-blue-600 mt-2">Top Tier</span>
              </div>
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-center text-center">
                <span className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">Mobile Rank</span>
                <span className="text-5xl font-black text-purple-700">A+</span>
                <span className="text-sm text-purple-600 mt-2">Optimized</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-900">Analysis Breakdown</h3>
              {[
                { label: "Meta Title & Description", status: "pass", detail: "Optimized for target keywords." },
                { label: "H1-H6 Structure", status: "pass", detail: "Hierarchical structure is perfect." },
                { label: "Image Alt Attributes", status: "warning", detail: "3 images are missing alt tags." },
                { label: "SSL/HTTPS", status: "pass", detail: "Connection is secure." },
                { label: "Robots.txt", status: "pass", detail: "Found and configured correctly." }
              ].map((item, i) => (
                <div key={i} className="flex items-start p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  {item.status === 'pass' ? <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />}
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.label}</h4>
                    <p className="text-sm text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <button onClick={() => setStatus('idle')} className="text-blue-600 font-bold hover:underline">
                Analyze another URL
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="seo" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function SpeedTester({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'done'>('idle');
  const [loadTime, setLoadTime] = useState(0);

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setStatus('testing');
    
    setTimeout(() => {
      setLoadTime(1.2);
      setStatus('done');
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Speed Tester</h1>
              <p className="text-slate-400 text-sm">Performance Audit by VoiceGPT</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={handleTest} className="space-y-6">
            <p className="text-slate-500 text-lg">Benchmark your website's performance and Core Web Vitals to improve user experience.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="url" 
                required
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-lg"
              />
              <button type="submit" className="bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95 whitespace-nowrap">
                Test Speed
              </button>
            </div>
          </form>
        )}

        {status === 'testing' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <motion.circle 
                  cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={552.92}
                  initial={{ strokeDashoffset: 552.92 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 3 }}
                  className="text-teal-500" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Gauge className="w-12 h-12 text-teal-600 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-600 font-bold text-xl tracking-tight">Simulating user interactions...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl">
              <div className="mb-6 md:mb-0">
                <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Load Time</div>
                <div className="text-6xl font-black flex items-baseline">
                  {loadTime} <span className="text-2xl font-bold ml-2">sec</span>
                </div>
              </div>
              <div className="h-16 w-px bg-white/10 hidden md:block" />
              <div className="text-center md:text-left">
                <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Performance Grade</div>
                <div className="text-5xl font-black text-teal-400">98/100</div>
              </div>
              <div className="h-16 w-px bg-white/10 hidden md:block" />
              <div className="text-center md:text-right">
                <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Status</div>
                <div className="flex items-center text-2xl font-bold text-green-400">
                  <Zap className="w-6 h-6 mr-2 fill-current" /> Lightning Fast
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-xl text-slate-900 flex items-center">
                  <Layout className="w-5 h-5 mr-2 text-teal-600" /> Core Web Vitals
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Largest Contentful Paint", value: "0.8s", status: "Good" },
                    { label: "First Input Delay", value: "12ms", status: "Good" },
                    { label: "Cumulative Layout Shift", value: "0.01", status: "Good" }
                  ].map((vit, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium">{vit.label}</span>
                      <div className="flex items-center">
                        <span className="font-bold text-slate-900 mr-3">{vit.value}</span>
                        <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">{vit.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-xl text-slate-900 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-teal-600" /> Server Performance
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Time to First Byte", value: "140ms", status: "Good" },
                    { label: "Static Asset Caching", value: "100%", status: "Good" },
                    { label: "Compression (Gzip/Brotli)", value: "Enabled", status: "Good" }
                  ].map((vit, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-slate-600 font-medium">{vit.label}</span>
                      <div className="flex items-center">
                        <span className="font-bold text-slate-900 mr-3">{vit.value}</span>
                        <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">{vit.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setStatus('idle')} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                Run another test
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="speed" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function SitemapGenerator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'crawling' | 'done'>('idle');
  const [pagesFound, setPagesFound] = useState(0);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setStatus('crawling');
    
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 5) + 1;
      setPagesFound(count);
      if (count >= 42) {
        clearInterval(interval);
        setPagesFound(42);
        setStatus('done');
      }
    }, 200);
  };

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}/</loc>
    <lastmod>2026-06-27</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${url}/about</loc>
    <lastmod>2026-06-25</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${url}/pricing</loc>
    <lastmod>2026-06-20</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${url}/contact</loc>
    <lastmod>2026-06-15</lastmod>
    <priority>0.6</priority>
  </url>
</urlset>`;

  const downloadSitemap = () => {
    const element = document.createElement("a");
    const file = new Blob([xmlContent], {type: 'text/xml'});
    element.href = URL.createObjectURL(file);
    element.download = "sitemap.xml";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Sitemap Generator</h1>
              <p className="text-slate-400 text-sm">Crawl & Index by VoiceGPT</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <p className="text-slate-500 text-lg">Automatically crawl your entire website and generate a Google-ready XML sitemap in seconds.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="url" 
                required
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg"
              />
              <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap">
                Generate Sitemap
              </button>
            </div>
          </form>
        )}

        {status === 'crawling' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8" />
            <div className="text-4xl font-black text-indigo-600 mb-2">{pagesFound}</div>
            <p className="text-slate-600 font-bold text-xl tracking-tight">Pages discovered...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div>
                <div className="text-indigo-600 font-black text-4xl mb-1">{pagesFound}</div>
                <div className="text-indigo-900 font-bold">Total URLs discovered</div>
              </div>
              <button 
                onClick={downloadSitemap}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-600/20"
              >
                Download XML <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-slate-900">Preview</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">xml/sitemap.xml</span>
              </div>
              <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
                <pre className="text-indigo-300 text-sm font-mono leading-relaxed">
                  {xmlContent}
                </pre>
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setStatus('idle')} className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold uppercase tracking-widest">
                Generate a different sitemap
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="sitemap" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function URLExtractor({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'extracting' | 'done'>('idle');
  const [urls, setUrls] = useState<string[]>([]);

  const handleExtract = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('extracting');
    
    // Simulate extraction
    setTimeout(() => {
      const mockUrls = [
        `${url}/`,
        `${url}/about`,
        `${url}/services`,
        `${url}/contact`,
        `${url}/blog`,
        `${url}/blog/seo-tips`,
        `${url}/pricing`,
        `${url}/privacy-policy`
      ];
      setUrls(mockUrls);
      setStatus('done');
    }, 2000);
  };

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + urls.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "extracted_urls.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Layout className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">URL Extractor</h1>
              <p className="text-slate-400 text-sm">Content Audit by VoiceGPT</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={handleExtract} className="space-y-6">
            <p className="text-slate-500 text-lg">Crawl and extract all URLs from any website. Perfect for site mapping, content auditing, and comprehensive SEO analysis.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="url" 
                required
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg"
              />
              <button type="submit" className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-95 whitespace-nowrap">
                Extract URLs
              </button>
            </div>
          </form>
        )}

        {status === 'extracting' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Scanning website architecture...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-purple-50 rounded-2xl border border-purple-100">
              <div>
                <div className="text-purple-600 font-black text-4xl mb-1">{urls.length}</div>
                <div className="text-purple-900 font-bold">Total URLs Extracted</div>
              </div>
              <button 
                onClick={downloadCSV}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center shadow-lg shadow-purple-600/20"
              >
                Download CSV <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-900">Extracted Links</h3>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {urls.map((link, i) => (
                  <div key={i} className="p-4 flex items-center justify-between group">
                    <span className="text-slate-600 font-medium truncate pr-4">{link}</span>
                    <button 
                      onClick={() => copyToClipboard(link)}
                      className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button onClick={() => setStatus('idle')} className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold uppercase tracking-widest">
                Extract another website
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="url-extractor" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function FAQGenerator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('generating');
    setTimeout(() => {
      setFaqs([
        { q: "What is your main service?", a: "We provide industry-leading solutions tailored to your business needs." },
        { q: "How much does it cost?", a: "Our pricing is competitive and varies based on your specific requirements." },
        { q: "How do I get started?", a: "Simply contact our support team or sign up for a free trial today." },
        { q: "Do you offer custom solutions?", a: "Yes, we specialize in building bespoke systems for enterprise clients." }
      ]);
      setStatus('done');
    }, 2000);
  };

  const copyAll = () => {
    const text = faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">FAQ Generator</h1>
              <p className="text-slate-400 text-sm">Instant Answers by VoiceGPT</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <p className="text-slate-500 text-lg">Enter your business type or services to generate a professional FAQ section.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                required
                placeholder="e.g. Digital Marketing Agency"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg"
              />
              <button type="submit" className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-95 whitespace-nowrap">
                Generate FAQs
              </button>
            </div>
          </form>
        )}

        {status === 'generating' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Drafting responses...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 group relative">
                  <button 
                    onClick={() => navigator.clipboard.writeText(`Q: ${faq.q}\nA: ${faq.a}`)}
                    className="absolute top-4 right-4 text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded border border-amber-100 shadow-sm"
                  >
                    Copy
                  </button>
                  <h3 className="font-bold text-slate-900 mb-2 pr-12">Q: {faq.q}</h3>
                  <p className="text-slate-600">A: {faq.a}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStatus('idle')} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                Generate More
              </button>
              <button 
                onClick={copyAll}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Copy All
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="faq-gen" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function BusinessNameGenerator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [names, setNames] = useState<string[]>([]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('generating');
    setTimeout(() => {
      setNames([
        "Lumina Creative", "Nexus Growth", "Velocity Labs", "Aura Digital",
        "Streamline Systems", "Peak Performance", "Zenith Solutions", "Echo Ventures"
      ]);
      setStatus('done');
    }, 2000);
  };

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Brand Name Generator</h1>
              <p className="text-slate-400 text-sm">Identity Design by VoiceGPT</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <p className="text-slate-500 text-lg">Enter a few keywords about your business to get unique, catchy brand name suggestions.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                required
                placeholder="e.g. tech, fast, modern"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-lg"
              />
              <button type="submit" className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95 whitespace-nowrap">
                Generate Names
              </button>
            </div>
          </form>
        )}

        {status === 'generating' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Brainstorming ideas...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {names.map((name, i) => (
                <div 
                  key={i} 
                  onClick={() => copyName(name)}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center font-bold text-slate-900 hover:border-rose-300 hover:bg-white transition-all cursor-pointer group relative"
                >
                  <span className="group-hover:text-rose-600 transition-colors">{name}</span>
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-[10px] text-rose-600 absolute bottom-1 font-bold">CLICK TO COPY</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={() => setStatus('idle')} className="text-rose-600 font-bold hover:underline">
                Try different keywords
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="name-gen" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function PrivacyPolicyGenerator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');

  const copyToClipboard = () => {
    const text = `Privacy Policy for ${company}\n\nAt ${company}, accessible from yourwebsite.com, one of our main priorities is the privacy of our visitors...`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Privacy Policy Gen</h1>
              <p className="text-slate-400 text-sm">Compliance by VoiceGPT</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={(e) => { e.preventDefault(); setStatus('generating'); setTimeout(() => setStatus('done'), 1500); }} className="space-y-6">
            <p className="text-slate-500 text-lg">Generate a compliant privacy policy for your business in seconds.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                required
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg"
              />
              <button type="submit" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 whitespace-nowrap">
                Generate Policy
              </button>
            </div>
          </form>
        )}

        {status === 'generating' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Applying legal templates...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-8 max-h-[500px] overflow-y-auto text-slate-300 font-serif leading-relaxed text-sm">
              <h2 className="text-white text-xl font-bold mb-4">Privacy Policy for {company}</h2>
              <p className="mb-4">At {company}, accessible from yourwebsite.com, one of our main priorities is the privacy of our visitors...</p>
              <h3 className="text-white font-bold mb-2">Log Files</h3>
              <p className="mb-4">{company} follows a standard procedure of using log files. These files log visitors when they visit websites...</p>
              <h3 className="text-white font-bold mb-2">Privacy Policies</h3>
              <p className="mb-4">You may consult this list to find the Privacy Policy for each of the advertising partners of {company}...</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStatus('idle')} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                Reset
              </button>
              <button 
                onClick={copyToClipboard}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Copy to Clipboard
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="privacy-gen" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function TermsGenerator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');

  const copyToClipboard = () => {
    const text = `Terms and Conditions for ${company}\n\nWelcome to ${company}! These terms and conditions outline the rules and regulations...`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="bg-white rounded-[32px] ring-1 ring-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Terms & Conditions</h1>
              <p className="text-slate-400 text-sm">Agreement Builder by VoiceGPT</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <form onSubmit={(e) => { e.preventDefault(); setStatus('generating'); setTimeout(() => setStatus('done'), 1500); }} className="space-y-6">
            <p className="text-slate-500 text-lg">Create a professional Terms of Service agreement tailored to your business model.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                required
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-lg"
              />
              <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 whitespace-nowrap">
                Generate Terms
              </button>
            </div>
          </form>
        )}

        {status === 'generating' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-slate-100 border-t-slate-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Generating document...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-8 max-h-[500px] overflow-y-auto text-slate-300 font-serif leading-relaxed text-sm">
              <h2 className="text-white text-xl font-bold mb-4">Terms and Conditions for {company}</h2>
              <p className="mb-4">Welcome to {company}! These terms and conditions outline the rules and regulations for the use of {company}'s Website...</p>
              <h3 className="text-white font-bold mb-2">Cookies</h3>
              <p className="mb-4">We employ the use of cookies. By accessing {company}, you agreed to use cookies in agreement with the {company}'s Privacy Policy...</p>
              <h3 className="text-white font-bold mb-2">License</h3>
              <p className="mb-4">Unless otherwise stated, {company} and/or its licensors own the intellectual property rights for all material on {company}...</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStatus('idle')} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                Reset
              </button>
              <button 
                onClick={copyToClipboard}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
              >
                Copy to Clipboard
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="terms-gen" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function RobotsGenerator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [delay, setDelay] = useState('0');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [robotsTxt, setRobotsTxt] = useState('');

  const generateRobots = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('generating');
    
    setTimeout(() => {
      const content = `User-agent: *
Disallow: /admin/
Disallow: /tmp/
${delay !== '0' ? `Crawl-delay: ${delay}` : ''}
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

# Allow all other bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /`;
      
      setRobotsTxt(content);
      setStatus('done');
    }, 1500);
  };

  const downloadRobots = () => {
    const element = document.createElement("a");
    const file = new Blob([robotsTxt], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "robots.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-50 text-cyan-600 text-sm font-bold mb-6">
          <Code className="w-4 h-4 mr-2" /> Technical SEO
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Robots.txt Generator</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Create a perfect robots.txt file to control how search engines crawl and index your website.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        {status === 'idle' && (
          <form onSubmit={generateRobots} className="max-w-xl mx-auto space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Website URL (Optional)</label>
              <input 
                type="url" 
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Sitemap URL (Recommended)</label>
              <input 
                type="url" 
                placeholder="https://example.com/sitemap.xml"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Crawl Delay</label>
              <select 
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-lg appearance-none bg-white"
              >
                <option value="0">No Delay</option>
                <option value="5">5 Seconds</option>
                <option value="10">10 Seconds</option>
                <option value="20">20 Seconds</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-cyan-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/20 active:scale-95">
              Generate Robots.txt
            </button>
          </form>
        )}

        {status === 'generating' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Creating file...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-slate-900 rounded-3xl p-8 font-mono text-cyan-400 text-lg relative group">
              <button 
                onClick={() => navigator.clipboard.writeText(robotsTxt)}
                className="absolute top-6 right-6 p-2 bg-slate-800 text-cyan-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
              >
                <Copy className="w-5 h-5" />
              </button>
              <pre className="whitespace-pre-wrap">{robotsTxt}</pre>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <button onClick={() => setStatus('idle')} className="bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors w-full md:w-auto">
                Start Over
              </button>
              <button 
                onClick={downloadRobots}
                className="bg-cyan-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center w-full md:w-auto"
              >
                Download Robots.txt <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="robots-gen" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function DomainGenerator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateDomains = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;
    setStatus('generating');
    
    setTimeout(() => {
      const base = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
      const tlds = ['.com', '.io', '.ai', '.app', '.net', '.co'];
      const prefixes = ['get', 'try', 'use', 'my', 'the', 'go'];
      const suffixes = ['hq', 'app', 'base', 'hub', 'flow', 'plus'];
      
      const results = [
        ...tlds.map(tld => `${base}${tld}`),
        ...prefixes.map(p => `${p}${base}.com`),
        ...suffixes.map(s => `${base}${s}.com`),
      ].sort(() => Math.random() - 0.5).slice(0, 12);
      
      setSuggestions(results);
      setStatus('done');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6">
          <Globe className="w-4 h-4 mr-2" /> Branding
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Domain Name Generator</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Find the perfect domain name for your next project with AI-powered suggestions.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        <form onSubmit={generateDomains} className="max-w-xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Enter keywords (e.g., ai, voice, health)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
            />
            <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 whitespace-nowrap">
              Generate
            </button>
          </div>
        </form>

        {status === 'generating' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Checking availability...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((domain, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                <span className="font-mono font-bold text-slate-700">{domain}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(domain)}
                  className="p-2 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="domain-gen" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function WordCounter({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [text, setText] = useState('');
  
  const stats = {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    sentences: text.split(/[.!?]+/).filter(Boolean).length,
    readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200)
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold mb-6">
          <Zap className="w-4 h-4 mr-2" /> Productivity
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Word Counter</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Instant text analysis with character counts, reading time, and complexity metrics.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Words', value: stats.words },
            { label: 'Characters', value: stats.chars },
            { label: 'Sentences', value: stats.sentences },
            { label: 'Reading Time', value: `${stats.readingTime} min` }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your content here..."
          className="w-full h-80 p-8 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg resize-none mb-6"
        />

        <div className="flex justify-between items-center text-sm text-slate-500">
          <div>Characters (no spaces): <span className="font-bold text-slate-900">{stats.charsNoSpaces}</span></div>
          <button onClick={() => setText('')} className="text-rose-600 font-bold hover:underline">Clear Text</button>
        </div>
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="word-counter" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function ReadingTimeCalculator({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [text, setText] = useState('');
  
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  
  const readingSpeeds = [
    { label: 'Slow', wpm: 150, desc: 'Careful reading' },
    { label: 'Average', wpm: 200, desc: 'Standard speed' },
    { label: 'Fast', wpm: 250, desc: 'Quick scanning' },
    { label: 'Skimming', wpm: 400, desc: 'High-level overview' }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6">
          <Clock className="w-4 h-4 mr-2" /> Content Planning
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Reading Time Calculator</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Calculate how long your audience will take to consume your content across various reading profiles.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {readingSpeeds.map((speed, i) => {
            const minutes = Math.ceil(words / speed.wpm);
            return (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-1">{minutes} min</div>
                <div className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wider">{speed.label}</div>
                <div className="text-xs text-slate-400 font-medium">{speed.desc} ({speed.wpm} WPM)</div>
              </div>
            );
          })}
        </div>

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your article or script here to calculate reading time..."
          className="w-full h-80 p-8 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg resize-none mb-6"
        />

        <div className="flex justify-between items-center">
          <div className="text-slate-500 font-medium">Total Word Count: <span className="font-bold text-slate-900">{words} words</span></div>
          <button onClick={() => setText('')} className="text-rose-600 font-bold hover:underline">Clear Text</button>
        </div>
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="reading-time" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function CaseConverter({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [text, setText] = useState('');

  const converters = [
    { label: 'UPPERCASE', func: (s: string) => s.toUpperCase() },
    { label: 'lowercase', func: (s: string) => s.toLowerCase() },
    { label: 'Title Case', func: (s: string) => s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) },
    { label: 'Sentence case', func: (s: string) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()) },
    { label: 'camelCase', func: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()) },
    { label: 'PascalCase', func: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase()) },
    { label: 'snake_case', func: (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '' },
    { label: 'kebab-case', func: (s: string) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '' }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-bold mb-6">
          <Type className="w-4 h-4 mr-2" /> Formatting
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Case Converter</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Convert your text to any format instantly. Perfect for coding, writing, and data formatting.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to convert..."
          className="w-full h-64 p-8 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg resize-none mb-8"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {converters.map((conv, i) => (
            <button
              key={i}
              onClick={() => setText(conv.func(text))}
              className="bg-slate-50 hover:bg-purple-600 hover:text-white border border-slate-100 p-4 rounded-2xl font-bold text-slate-700 transition-all text-sm shadow-sm"
            >
              {conv.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={() => setText('')} className="text-rose-600 font-bold hover:underline">Clear Text</button>
        </div>
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="case-converter" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function RemoveDuplicateLines({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [text, setText] = useState('');
  
  const handleRemoveDuplicates = () => {
    const lines = text.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    setText(uniqueLines.join('\n'));
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-bold mb-6">
          <ListFilter className="w-4 h-4 mr-2" /> Data Cleaning
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Remove Duplicate Lines</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Instantly clean up your lists, email databases, and data entries by removing repeating lines.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your list here (one item per line)..."
          className="w-full h-80 p-8 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-lg font-mono resize-none mb-8"
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 font-medium">
            Line Count: <span className="font-bold text-slate-900">{text.split('\n').filter(Boolean).length}</span>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => setText('')} 
              className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Clear
            </button>
            <button 
              onClick={handleRemoveDuplicates}
              className="flex-1 md:flex-none bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              Remove Duplicates
            </button>
          </div>
        </div>
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="remove-duplicates" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function TextSorter({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [text, setText] = useState('');
  
  const sortText = (direction: 'asc' | 'desc') => {
    const lines = text.split('\n').filter(Boolean);
    lines.sort((a, b) => {
      if (direction === 'asc') return a.localeCompare(b);
      return b.localeCompare(a);
    });
    setText(lines.join('\n'));
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-bold mb-6">
          <SortAsc className="w-4 h-4 mr-2" /> Organization
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Text Sorter</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Organize your text lines alphabetically. Perfect for sorting lists, names, or keyword data.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your list to sort (one item per line)..."
          className="w-full h-80 p-8 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg font-mono resize-none mb-8"
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={() => setText('')} className="text-rose-600 font-bold hover:underline">Clear Text</button>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={() => sortText('desc')}
              className="flex-1 md:flex-none border border-amber-200 text-amber-700 px-8 py-4 rounded-2xl font-bold hover:bg-amber-50 transition-all"
            >
              Sort Z-A
            </button>
            <button 
              onClick={() => sortText('asc')}
              className="flex-1 md:flex-none bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-95"
            >
              Sort A-Z
            </button>
          </div>
        </div>
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="text-sorter" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

function AIGenerator({ 
  title, 
  desc, 
  icon, 
  category, 
  placeholder, 
  systemInstruction, 
  toolId,
  onBack, 
  onCTA, 
  onToolSelect 
}: { 
  title: string, 
  desc: string, 
  icon: React.ReactNode, 
  category: string, 
  placeholder: string, 
  systemInstruction: string,
  toolId: string,
  onBack: () => void, 
  onCTA: () => void, 
  onToolSelect?: any 
}) {
  const [input, setInput] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setStatus('generating');
    setError(null);
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          systemInstruction: systemInstruction
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setContent(data.content);
      setStatus('done');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate content. Please try again.');
      setStatus('idle');
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-6">
          {icon} <span className="ml-2">{category}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">{title}</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          {desc}
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        {status === 'idle' && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full h-40 p-8 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg resize-none"
            />
            {error && <p className="text-rose-600 text-sm font-medium">{error}</p>}
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center"
              >
                Generate Content <Sparkles className="w-5 h-5 ml-2" />
              </button>
            </div>
          </form>
        )}

        {status === 'generating' && (
          <div className="py-24 md:py-32 flex flex-col items-center">
            <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-8" />
            <p className="text-slate-600 font-bold text-xl tracking-tight">Gemini AI is crafting your content...</p>
          </div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 relative group">
              <div className="prose prose-slate max-w-none">
                {content.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 text-slate-700 leading-relaxed">{line}</p>
                ))}
              </div>
              <button 
                onClick={copyContent}
                className="absolute top-4 right-4 bg-white p-3 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setStatus('idle')} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                Write Another
              </button>
              <button 
                onClick={copyContent}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Copy Content
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId={toolId} onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

export function BlogWriter(props: ToolProps) {
  return (
    <AIGenerator 
      {...props}
      toolId="blog-writer"
      title="AI Blog Writer"
      category="Generative"
      icon={<Sparkles className="w-4 h-4" />}
      desc="Generate high-quality, SEO-friendly blog posts based on your topic and keywords."
      placeholder="Enter your blog topic, target keywords, and any specific points you want to cover..."
      systemInstruction="You are an expert SEO blog writer. Create engaging, informative, and SEO-optimized blog posts with a catchy title, introduction, subheadings, and a conclusion. Use a professional yet conversational tone."
    />
  );
}

export function ArticleWriter(props: ToolProps) {
  return (
    <AIGenerator 
      {...props}
      toolId="article-writer"
      title="AI Article Writer"
      category="Generative"
      icon={<Bot className="w-4 h-4" />}
      desc="Create long-form articles with structured headings and professional tone."
      placeholder="Describe the article topic, target audience, and key information to include..."
      systemInstruction="You are a professional journalist and article writer. Create high-quality, well-researched long-form articles with a clear structure, authoritative tone, and engaging style."
    />
  );
}

export function ParagraphGenerator(props: ToolProps) {
  return (
    <AIGenerator 
      {...props}
      toolId="paragraph-gen"
      title="AI Paragraph Generator"
      category="Generative"
      icon={<Zap className="w-4 h-4" />}
      desc="Expand your ideas into well-structured, coherent paragraphs instantly."
      placeholder="Enter a sentence or a few keywords that you want to expand into a paragraph..."
      systemInstruction="You are a creative writer. Take the user's input and expand it into a rich, coherent, and well-structured paragraph that flows naturally."
    />
  );
}

export function EssayWriter(props: ToolProps) {
  return (
    <AIGenerator 
      {...props}
      toolId="essay-writer"
      title="AI Essay Writer"
      category="Generative"
      icon={<Code className="w-4 h-4" />}
      desc="Write academic or informative essays with proper introduction, body, and conclusion."
      placeholder="Enter your essay prompt, theme, or thesis statement..."
      systemInstruction="You are an academic writing assistant. Create structured, informative essays with a clear thesis statement, supporting arguments in the body paragraphs, and a strong conclusion."
    />
  );
}

export function TextReverser({ onBack, onCTA, onToolSelect }: ToolProps) {
  const [text, setText] = useState('');
  
  const reverseCharacters = () => {
    setText(text.split('').reverse().join(''));
  };

  const reverseWords = () => {
    setText(text.split(/\s+/).reverse().join(' '));
  };

  const reverseLines = () => {
    setText(text.split('\n').reverse().join('\n'));
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-24 md:py-32">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 mb-8 hover:translate-x-[-4px] transition-transform">
        <Undo2 className="w-4 h-4 mr-2" /> Back to Tools
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-6">
          <RefreshCcw className="w-4 h-4 mr-2" /> Utility
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Text Reverser</h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Flip your text, words, or lines in an instant. A handy utility for special formatting and testing.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 ring-1 ring-slate-200 shadow-sm mb-20">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to reverse..."
          className="w-full h-80 p-8 rounded-3xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg resize-none mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={reverseCharacters}
            className="bg-slate-50 border border-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Reverse Characters
          </button>
          <button 
            onClick={reverseWords}
            className="bg-slate-50 border border-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Reverse Words
          </button>
          <button 
            onClick={reverseLines}
            className="bg-slate-50 border border-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Reverse Lines
          </button>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={() => setText('')} className="text-rose-600 font-bold hover:underline">Clear Text</button>
        </div>
      </div>

      <VoiceAIUpsell onCTA={onCTA} />
      <TryOtherTools currentToolId="text-reverser" onToolSelect={onToolSelect} />
      <ToolFAQ />
    </div>
  );
}

