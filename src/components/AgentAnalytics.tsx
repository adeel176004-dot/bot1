import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Activity, BarChart2,
  Globe,
  Bot,
  ScrollText,
  Settings2,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Undo2,
  Code,
  Copy,
  Check,
  Languages,
  User,
  Zap,
  ShieldCheck,
  ChevronDown,
  Info,
  History,
  ChevronRight,
  LayoutDashboard,
  Layout,
  Menu,
  Calendar,
  ChevronLeft,
  Palette,
  Image as ImageIcon
} from 'lucide-react';

import { UserStats, VoiceGPTConfig } from '../types';
import { TOP_100_LANGUAGES } from '../data/languages';
import { doc, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';

interface Conversation {
  id: string;
  transcript: string;
  createdAt: any;
}

interface AgentAnalyticsProps {
  stats: UserStats;
  config?: VoiceGPTConfig;
  plan?: 'free' | 'pro' | 'enterprise';
  userId?: string;
  onUpgrade?: () => void;
  onUpdateConfig?: (config: VoiceGPTConfig) => void;
  onTest?: () => void;
  onAddNewAgent?: () => void;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="group relative inline-block">
      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
};

export const AgentAnalytics: React.FC<AgentAnalyticsProps> = ({ stats: propStats, config, plan: propPlan = 'free', userId, onUpgrade, onUpdateConfig, onTest, onAddNewAgent }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<UserStats>(propStats);
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>(propPlan);
  const [activeTab, setActiveTab] = useState<'config' | 'embed' | 'history'>('config');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [localConfig, setLocalConfig] = useState<VoiceGPTConfig>(config || {
    websiteName: '',
    agentName: '',
    websiteLinks: [''],
    customInstructions: '',
    voiceGender: 'female',
    language: 'English',
    personality: 'Friendly',
    bookingEnabled: false,
    bookingUrl: ''
  });


  const chartData = React.useMemo(() => {
    if (stats.dailyUsage && stats.dailyUsage.length > 0) return stats.dailyUsage;
    
    // Generate fallback data if totalMessages exists but no daily usage recorded yet
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        messages: i === 0 ? stats.totalMessages : 0,
        minutes: 0
      });
    }
    return data;
  }, [stats.dailyUsage, stats.totalMessages]);

  // Real-time Firestore listener for live message count updates
  useEffect(() => {
    if (userId) {
      const unsub = onSnapshot(doc(db, 'users', userId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStats(prev => ({
            ...prev,
            totalMessages: data.totalMessages || 0,
          }));
          if (data.plan) {
            setPlan(data.plan as any);
          }
        }
      });
      return () => unsub();
    }
  }, [userId]);

  // Real-time listener for conversation history
  useEffect(() => {
    if (userId && activeTab === 'history') {
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId)
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        const convs: Conversation[] = [];
        snapshot.forEach((doc) => {
          convs.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        // Sort by createdAt desc locally to avoid requiring a composite index
        convs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        setConversations(convs);
      });
      
      return () => unsub();
    }
  }, [userId, activeTab]);

  // Sync with prop updates
  useEffect(() => {
    setStats(propStats);
  }, [propStats]);

  useEffect(() => {
    setPlan(propPlan);
  }, [propPlan]);

  // Check server health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setIsServerOnline(data.status === 'ok');
      } catch (err) {
        setIsServerOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync local config if prop changes (e.g. from creation flow)
  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleSave = () => {
    setSaveStatus('saving');
    
    // Enforce limits on save
    const maxLinks = getMaxLinks(plan);
    const cleanedLinks = localConfig.websiteLinks.filter(l => l.trim() !== '').slice(0, maxLinks);
    const finalConfig = {
      ...localConfig,
      websiteLinks: cleanedLinks.length > 0 ? cleanedLinks : ['']
    };
    
    setLocalConfig(finalConfig);

    // Simulate API delay
    setTimeout(() => {
      onUpdateConfig?.(finalConfig);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
        onTest?.();
      }, 1000);
    }, 800);
  };

  const getMaxLinks = (currentPlan?: string) => {
    switch (currentPlan) {
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

  const generateEmbedCode = () => {
    const configJson = JSON.stringify({
      websiteName: localConfig.websiteName,
      agentName: localConfig.agentName,
      websiteLinks: localConfig.websiteLinks.filter(l => l.trim() !== ''),
      customInstructions: localConfig.customInstructions,
      voiceGender: localConfig.voiceGender,
      language: localConfig.language,
      personality: localConfig.personality
    }, null, 2);

    return `<!-- VoiceAgent AI Embed Code -->
<script>
  window.VOICEGPT_CONFIG = ${configJson};
</script>
<script src="${window.location.origin}/widget.js" async></script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metrics = [
    { 
      label: 'Total Messages', 
      value: stats.totalMessages.toLocaleString(), 
      icon: MessageSquare, 
      color: 'indigo',
      tooltip: 'The cumulative number of messages handled by your voice agents. Message counts are reset at the start of each billing month.'
    },
  ];

  const getPlanLimit = () => {
    switch (plan) {
      case 'pro': return 10000;
      case 'enterprise': return Infinity;
      default: return 50;
    }
  };

  const limit = getPlanLimit();
  const remaining = limit === Infinity ? 'Unlimited' : Math.max(0, limit - stats.totalMessages).toLocaleString();
  const usagePercent = limit === Infinity ? 0 : Math.min(100, (stats.totalMessages / limit) * 100);

  const billingMetrics = [
    { 
      label: 'Remaining Messages', 
      value: remaining, 
      subValue: limit === Infinity ? 'Enterprise Power' : `of ${limit.toLocaleString()} limit`,
      icon: Zap, 
      color: 'amber',
      progress: usagePercent
    },
    { 
      label: 'Current Plan', 
      value: plan.charAt(0).toUpperCase() + plan.slice(1), 
      subValue: plan === 'free' ? 'Basic Features' : 'Premium Access',
      icon: ShieldCheck, 
      color: 'emerald',
      tooltip: 'Your active subscription tier. Message limits and advanced capabilities are determined by your chosen plan level.'
    },
    ...(plan !== 'free' ? [{ 
      label: 'Billing Cycle', 
      value: 'Monthly', 
      subValue: 'Renews on Aug 01',
      icon: Clock, 
      color: 'indigo' 
    }] : [])
  ];

  const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'agents', label: 'My Agents', icon: Bot },
    { id: 'config', label: 'Agent Configuration', icon: Settings2 },
    { id: 'deployment', label: 'Deployment', icon: Code },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'billing', label: 'Billing & Plan', icon: ShieldCheck },
  ];


  const renderContent = () => {
    switch (activeSidebarItem) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Performance Overview</h2>
                  <p className="text-slate-500 mt-1 font-medium">Track your agents' performance and message volume.</p>
                </div>
                <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  plan === 'enterprise' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm shadow-indigo-100' :
                  plan === 'pro' ? 'bg-purple-50 text-purple-600 border-purple-100 shadow-sm shadow-purple-100' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {plan} Plan
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Download Report
                </button>
                <button 
                  onClick={onAddNewAgent}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  Add New Agent
                </button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              
{metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow min-w-[280px] flex-1 max-w-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl bg-${metric.color}-50 border border-${metric.color}-100`}>
                  <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                </div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                  {metric.tooltip && <InfoTooltip text={metric.tooltip} />}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
            </div>
          </motion.div>
        ))}

        {billingMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (metrics.length + idx) * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden min-w-[280px] flex-1 max-w-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl bg-${metric.color}-50 border border-${metric.color}-100`}>
                  <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                </div>
                <div className="flex items-center space-x-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                  {metric.tooltip && <InfoTooltip text={metric.tooltip} />}
                </div>
              </div>
              {metric.label === 'Current Plan' && plan !== 'free' && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider">Active</span>
              )}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
                {metric.subValue && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.subValue}</span>}
              </div>
            </div>

            {metric.progress !== undefined && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Consumption</span>
                  <span className={`text-${metric.color}-600`}>{Math.round(metric.progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]`}
                    />
                  </div>
                </div>
              </div>
            )}

            {metric.label === 'Remaining Messages' && plan === 'free' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUpgrade}
                className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Upgrade to Pro</span>
              </motion.button>
            )}
          </motion.div>
        ))}

            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">My Agents</h2>
              <p className="text-slate-500 mt-1 font-medium">Manage your active voice agents.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <motion.div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-4 mb-4">
                     <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Bot className="w-6 h-6" /></div>
                     <div>
                       <h3 className="text-lg font-bold text-slate-900">{localConfig.agentName || 'Agent'}</h3>
                       <p className="text-xs text-slate-500 font-medium">{localConfig.websiteName || 'Your Website'}</p>
                     </div>
                  </div>
                  <button onClick={() => setActiveSidebarItem('config')} className="w-full py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                    Configure
                  </button>
               </motion.div>
               <motion.button onClick={onAddNewAgent} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all min-h-[160px]">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="font-bold text-sm">Create New Agent</span>
               </motion.button>
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto px-4 sm:px-6 pb-12">
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Agent Configuration</h3>
                  <p className="text-slate-500 text-sm">Fine-tune your agent's identity, behavior, and capabilities.</p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-all active:scale-95"
                  >
                    <Settings2 className="w-4 h-4" />
                    <span>Edit Settings</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => { setIsEditing(false); setLocalConfig(config); }}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-95"
                    >
                      {saveStatus === 'saving' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : saveStatus === 'saved' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Identity & Persona Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center space-x-3 pb-2 border-b border-slate-50">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-slate-900">Identity & Persona</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Website Name</label>
                      <div className="relative group">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={localConfig.websiteName}
                          onChange={(e) => setLocalConfig({ ...localConfig, websiteName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                          placeholder="e.g. Acme Corp"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Agent Name</label>
                      <div className="relative group">
                        <Bot className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={localConfig.agentName}
                          onChange={(e) => setLocalConfig({ ...localConfig, agentName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                          placeholder="e.g. Sarah"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Personality Tone</label>
                    <div className="relative group">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={localConfig.personality}
                        onChange={(e) => setLocalConfig({ ...localConfig, personality: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                        placeholder="e.g. Professional, Friendly, Witty"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Voice Profile</label>
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 h-[42px]">
                        <button
                          disabled={!isEditing}
                          onClick={() => setLocalConfig({ ...localConfig, voiceGender: 'female' })}
                          className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                            localConfig.voiceGender === 'female'
                              ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                              : 'text-slate-500 hover:text-slate-700'
                          } disabled:opacity-50`}
                        >
                          Female
                        </button>
                        <button
                          disabled={!isEditing}
                          onClick={() => setLocalConfig({ ...localConfig, voiceGender: 'male' })}
                          className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                            localConfig.voiceGender === 'male'
                              ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100'
                              : 'text-slate-500 hover:text-slate-700'
                          } disabled:opacity-50`}
                        >
                          Male
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Language</label>
                      <div className="relative group">
                        <Languages className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          disabled={!isEditing}
                          value={localConfig.language}
                          onChange={(e) => setLocalConfig({ ...localConfig, language: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100"
                        >
                          {TOP_100_LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Branding Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center space-x-3 pb-2 border-b border-slate-50">
                    <div className="p-2 bg-pink-50 rounded-lg">
                      <Palette className="w-5 h-5 text-pink-600" />
                    </div>
                    <h4 className="font-bold text-slate-900">Visual Branding</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Theme Color</label>
                      <div className="flex flex-wrap gap-2">
                        {['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'].map((color) => (
                          <button
                            key={color}
                            disabled={!isEditing}
                            onClick={() => setLocalConfig({ ...localConfig, themeColor: color })}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              localConfig.themeColor === color ? 'border-slate-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                            } disabled:opacity-50`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                        {isEditing && (
                          <div className="relative w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-slate-400 transition-colors">
                            <input
                              type="color"
                              value={localConfig.themeColor || '#4f46e5'}
                              onChange={(e) => setLocalConfig({ ...localConfig, themeColor: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                            />
                            <Plus className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Agent Icon</label>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {localConfig.botIcon ? (
                            <img src={localConfig.botIcon} alt="Agent Icon" className="w-full h-full object-cover" />
                          ) : (
                            <Bot className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="relative group">
                            <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                              type="url"
                              disabled={!isEditing}
                              value={localConfig.botIcon || ''}
                              onChange={(e) => setLocalConfig({ ...localConfig, botIcon: e.target.value })}
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-9 py-2 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:opacity-60"
                              placeholder="Icon Image URL"
                            />
                          </div>
                          {isEditing && (
                            <label className="block">
                              <span className="sr-only">Upload icon</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setLocalConfig({ ...localConfig, botIcon: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Knowledge Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Layout className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-slate-900">Knowledge Sources</h4>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => setLocalConfig({ ...localConfig, websiteLinks: [...localConfig.websiteLinks, ''] })}
                        disabled={localConfig.websiteLinks.length >= getMaxLinks(plan)}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        Add URL (Max {getMaxLinks(plan)})
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {localConfig.websiteLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="relative flex-1 group">
                          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="url"
                            disabled={!isEditing}
                            value={link}
                            onChange={(e) => {
                              const newLinks = [...localConfig.websiteLinks];
                              newLinks[idx] = e.target.value;
                              setLocalConfig({ ...localConfig, websiteLinks: newLinks });
                            }}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-9 py-2.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:opacity-60"
                            placeholder="https://example.com/page"
                          />
                        </div>
                        {isEditing && localConfig.websiteLinks.length > 1 && (
                          <button 
                            onClick={() => {
                              const newLinks = localConfig.websiteLinks.filter((_, i) => i !== idx);
                              setLocalConfig({ ...localConfig, websiteLinks: newLinks });
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Lead & Booking</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Enable appointment booking in chat.</p>
                      </div>
                    </div>
                    <button
                      disabled={!isEditing}
                      onClick={() => setLocalConfig({ ...localConfig, bookingEnabled: !localConfig.bookingEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 ${
                        localConfig.bookingEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                      } ${!isEditing ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-105'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localConfig.bookingEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {localConfig.bookingEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Booking System URL</label>
                      <div className="relative group">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                          type="url"
                          disabled={!isEditing}
                          value={localConfig.bookingUrl || ''}
                          onChange={(e) => setLocalConfig({ ...localConfig, bookingUrl: e.target.value })}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:opacity-60"
                          placeholder="https://calendly.com/your-link"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium italic ml-1">
                        * Booking widget appears after lead information collection.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Behavioral Core */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center space-x-3 pb-2 border-b border-slate-50">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <ScrollText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-slate-900">Behavioral Core & Instructions</h4>
                  </div>
                  <div className="relative group">
                    <textarea
                      disabled={!isEditing}
                      value={localConfig.customInstructions}
                      onChange={(e) => setLocalConfig({ ...localConfig, customInstructions: e.target.value })}
                      rows={5}
                      className="w-full bg-slate-50/30 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100 resize-none leading-relaxed"
                      placeholder="Describe how your agent should behave, its knowledge limits, and preferred interaction style..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'deployment':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
<motion.div
                  key="embed"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Deploy your agent</h3>
                      <p className="text-slate-500 text-sm">Copy the snippet below and paste it into your website's header.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                        <Zap className="w-3 h-3" />
                        <span>Ready for Production</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                        <span className="ml-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Embed Snippet</span>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                          copied 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
                        <code>{generateEmbedCode()}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-slate-100 rounded-lg w-fit mb-4">
                        <Globe className="w-4 h-4 text-slate-600" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Global Delivery</h5>
                      <p className="text-xs text-slate-500 font-medium">Your agent is served from 24 global edge locations for zero latency.</p>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-slate-100 rounded-lg w-fit mb-4">
                        <ShieldCheck className="w-4 h-4 text-slate-600" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Secure Execution</h5>
                      <p className="text-xs text-slate-500 font-medium">Domain-locked script execution prevents unauthorized usage.</p>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-slate-100 rounded-lg w-fit mb-4">
                        <Zap className="w-4 h-4 text-slate-600" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Auto-Scaling</h5>
                      <p className="text-xs text-slate-500 font-medium">Handles unlimited concurrent users with intelligent load balancing.</p>
                    </div>
                  </div>
                </motion.div>

          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h2>
              <p className="text-slate-500 mt-1 font-medium">Detailed message volume and usage stats.</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              
{/* Message Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Message Volume</h3>
              <p className="text-slate-500 text-xs">Total messages handled by all agents</p>
            </div>
            <select className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            {stats.totalMessages > 0 || (stats.dailyUsage && stats.dailyUsage.length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorMessages)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                 <Activity className="w-8 h-8 opacity-40 text-slate-400" />
                 <p className="text-sm font-medium text-slate-500">No messages yet this period</p>
              </div>
            )}
          </div>
        </motion.div>

            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Plan</h2>
              <p className="text-slate-500 mt-1 font-medium">Manage your subscription and limits.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {billingMetrics.map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden min-w-[280px] flex-1 max-w-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl bg-${metric.color}-50 border border-${metric.color}-100`}>
                        <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                        {metric.tooltip && <InfoTooltip text={metric.tooltip} />}
                      </div>
                    </div>
                    {metric.label === 'Current Plan' && plan !== 'free' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider">Active</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
                      {metric.subValue && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.subValue}</span>}
                    </div>
                  </div>

                  {metric.progress !== undefined && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-400">Consumption</span>
                        <span className={`text-${metric.color}-600`}>{Math.round(metric.progress)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div className="h-full w-full bg-slate-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {metric.label === 'Remaining Messages' && plan === 'free' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onUpgrade}
                      className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Upgrade to Pro</span>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <div className="flex w-full bg-slate-50 min-h-[calc(100vh-64px)] justify-center">
      <div className="flex w-full max-w-7xl">
        {/* Sidebar */}
        <div 
          className={`bg-white border-l border-r border-slate-200 transition-all duration-300 flex flex-col sticky top-[64px] h-[calc(100vh-64px)] z-20 shrink-0 ${
            isSidebarExpanded ? 'w-64' : 'w-20'
          }`}
        >
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
          {isSidebarExpanded && <span className="font-bold text-slate-700 text-sm tracking-wide">DASHBOARD</span>}
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ${!isSidebarExpanded ? 'mx-auto' : ''}`}
          >
            {isSidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {SIDEBAR_ITEMS.map(item => {
            const isActive = activeSidebarItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebarItem(item.id)}
                className={`w-full flex items-center ${isSidebarExpanded ? 'justify-start px-4' : 'justify-center'} py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {isSidebarExpanded && (
                  <span className={`ml-3 text-sm font-bold ${isActive ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    {item.label}
                  </span>
                )}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-slate-900" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 lg:p-12 w-full">
        <div className="max-w-6xl mx-auto space-y-8">
           {renderContent()}
        </div>
      </div>
      </div>
    </div>
  );
};
