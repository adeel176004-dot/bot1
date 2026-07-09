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
  Activity,
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
  ChevronDown
} from 'lucide-react';

import { UserStats, VoiceGPTConfig } from '../types';
import { TOP_100_LANGUAGES } from '../data/languages';

interface AgentAnalyticsProps {
  stats: UserStats;
  config?: VoiceGPTConfig;
  plan?: 'free' | 'pro' | 'enterprise';
  onUpdateConfig?: (config: VoiceGPTConfig) => void;
  onTest?: () => void;
}

export const AgentAnalytics: React.FC<AgentAnalyticsProps> = ({ stats, config, plan = 'free', onUpdateConfig, onTest }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState<VoiceGPTConfig>(config || {
    websiteName: '',
    agentName: '',
    websiteLinks: [''],
    customInstructions: '',
    voiceGender: 'female',
    language: 'English',
    personality: 'Friendly'
  });
  const [activeTab, setActiveTab] = useState<'config' | 'embed'>('config');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sync local config if prop changes (e.g. from creation flow)
  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate API delay
    setTimeout(() => {
      onUpdateConfig?.(localConfig);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditing(false);
        onTest?.();
      }, 1000);
    }, 800);
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
    { label: 'Total Messages', value: stats.totalMessages.toLocaleString(), icon: MessageSquare, color: 'blue' },
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
      color: 'emerald' 
    },
    ...(plan !== 'free' ? [{ 
      label: 'Billing Cycle', 
      value: 'Monthly', 
      subValue: 'Renews on Aug 01',
      icon: Clock, 
      color: 'purple' 
    }] : [])
  ];

  return (
    <div className="space-y-8 p-1">
      {/* Bot Configuration & Deployment Section */}
      {config && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-50/80 border-b border-slate-200 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Agent Workspace</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Production</span>
                    </span>
                    <span className="text-slate-400 text-xs font-medium">•</span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">v2.4.0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setActiveTab('config')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'config' 
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Configuration</span>
                </button>
                <button
                  onClick={() => setActiveTab('embed')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'embed' 
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>Deployment</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'config' ? (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Agent Identity</h4>
                      <p className="text-slate-500 text-sm">Update your agent's name, voice, and behavioral core.</p>
                    </div>
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-colors"
                      >
                        <Settings2 className="w-4 h-4" />
                        <span>Edit Settings</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => { setIsEditing(false); setLocalConfig(config); }}
                          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                          <Undo2 className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={saveStatus === 'saving'}
                          className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Left */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Website Name</label>
                          <div className="relative group">
                            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                              type="text"
                              disabled={!isEditing}
                              value={localConfig.websiteName}
                              onChange={(e) => setLocalConfig({ ...localConfig, websiteName: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                              placeholder="e.g. Acme Corp"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Agent Name</label>
                          <div className="relative group">
                            <Bot className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                              type="text"
                              disabled={!isEditing}
                              value={localConfig.agentName}
                              onChange={(e) => setLocalConfig({ ...localConfig, agentName: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                              placeholder="e.g. Sarah"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Voice Profile</label>
                          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              disabled={!isEditing}
                              onClick={() => setLocalConfig({ ...localConfig, voiceGender: 'female' })}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
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
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
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
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Language</label>
                          <div className="relative group">
                            <Languages className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select
                              disabled={!isEditing}
                              value={localConfig.language}
                              onChange={(e) => setLocalConfig({ ...localConfig, language: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all appearance-none disabled:opacity-60"
                            >
                              {TOP_100_LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Personality Tone</label>
                        <div className="relative group">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={localConfig.personality}
                            onChange={(e) => setLocalConfig({ ...localConfig, personality: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="e.g. Professional, Friendly, Witty"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Right - Context & Instructions */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Knowledge Sources (URLs)</label>
                          {isEditing && (
                            <button
                              onClick={() => setLocalConfig({ ...localConfig, websiteLinks: [...localConfig.websiteLinks, ''] })}
                              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg hover:bg-indigo-100"
                            >
                              Add URL
                            </button>
                          )}
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
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
                                  className="w-full bg-white border border-slate-200 rounded-lg px-9 py-2 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all disabled:opacity-60"
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
                    </div>

                    {/* System Instructions - Full Width Below */}
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">System Instructions & Behavior</label>
                      <div className="relative group">
                        <ScrollText className="w-4 h-4 text-slate-400 absolute left-4 top-4 group-focus-within:text-indigo-500 transition-colors" />
                        <textarea
                          disabled={!isEditing}
                          value={localConfig.customInstructions}
                          onChange={(e) => setLocalConfig({ ...localConfig, customInstructions: e.target.value })}
                          rows={4}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                          placeholder="Describe how your agent should behave, its knowledge limits, and preferred interaction style..."
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="embed"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Deploy your agent</h4>
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
                    <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                      <div className="p-2 bg-indigo-100 rounded-lg w-fit mb-4">
                        <Globe className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Global Delivery</h5>
                      <p className="text-xs text-slate-500 font-medium">Your agent is served from 24 global edge locations for zero latency.</p>
                    </div>
                    <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                      <div className="p-2 bg-purple-100 rounded-lg w-fit mb-4">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Secure Execution</h5>
                      <p className="text-xs text-slate-500 font-medium">Domain-locked script execution prevents unauthorized usage.</p>
                    </div>
                    <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <div className="p-2 bg-emerald-100 rounded-lg w-fit mb-4">
                        <Zap className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mb-1">Auto-Scaling</h5>
                      <p className="text-xs text-slate-500 font-medium">Handles unlimited concurrent users with intelligent load balancing.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Analytics Title Separator */}
      <div className="flex items-center space-x-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance Analytics</h2>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Stats Grid */}
      <div className="flex flex-wrap justify-center gap-6">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow min-w-[280px] flex-1 max-w-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-${metric.color}-50 border border-${metric.color}-100`}>
                <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium mb-1">{metric.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
            </div>
          </motion.div>
        ))}

        {billingMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (metrics.length + idx) * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden min-w-[280px] flex-1 max-w-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-${metric.color}-50 border border-${metric.color}-100`}>
                <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
              </div>
              {metric.label === 'Current Plan' && plan !== 'free' && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">Active</span>
              )}
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium mb-1">{metric.label}</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{metric.value}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{metric.subValue}</span>
              </div>
            </div>

            {metric.progress !== undefined && (
              <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.progress}%` }}
                  className={`h-full bg-${metric.color}-500`}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Message Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Message Volume</h3>
              <p className="text-slate-500 text-xs">Total messages handled by all agents</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyUsage}>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};
