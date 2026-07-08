import React from 'react';
import { motion } from 'motion/react';
import { 
  Brain, 
  Heart, 
  UserCheck,
  Zap, 
  Shield, 
  MessageSquare, 
  Globe, 
  BarChart3, 
  Cpu, 
  Smartphone, 
  Clock,
  CheckCircle2,
  Lock,
  Headset,
  Workflow,
  Play,
  Search,
  Link2,
  Terminal,
  MousePointer2,
  ArrowRight,
  Fingerprint,
  Server,
  Activity,
  Users,
  ShieldCheck,
  FileLock2
} from 'lucide-react';

const features = [
  {
    title: "One-Click URL Training",
    description: "Simply paste your website link and watch our AI learn your entire business in seconds. No manual data entry or complex training required.",
    icon: <Zap className="w-6 h-6 text-amber-600" />,
    color: "bg-amber-50"
  },
  {
    title: "Web-First Voice AI",
    description: "Transform your static website into an interactive voice experience. Your agent answers queries with pinpoint accuracy based on your site data.",
    icon: <Cpu className="w-6 h-6 text-blue-600" />,
    color: "bg-blue-50"
  },
  {
    title: "Intelligent Human Handoff",
    description: "Ensure no customer is left hanging. The agent intelligently detects when a human touch is needed and transfers the session to your live team.",
    icon: <UserCheck className="w-6 h-6 text-teal-600" />,
    color: "bg-teal-50"
  },
  {
    title: "Real-time Content Sync",
    description: "Our bot automatically detects updates to your web pages, ensuring your voice agent always has the most current information.",
    icon: <Brain className="w-6 h-6 text-rose-600" />,
    color: "bg-rose-50"
  },
  {
    title: "Global Accessibility",
    description: "Reach a worldwide audience with instant voice support in over 100 languages, all trained directly from your URL.",
    icon: <Globe className="w-6 h-6 text-indigo-600" />,
    color: "bg-indigo-50"
  },
  {
    title: "Enterprise-grade Security",
    description: "Bank-level encryption and SOC2 compliance ensure your website content and customer interactions are always protected.",
    icon: <Shield className="w-6 h-6 text-emerald-600" />,
    color: "bg-emerald-50"
  },
  {
    title: "Insightful Analytics",
    description: "Gain deep insights into visitor interactions with detailed transcripts, sentiment analysis, and conversion tracking.",
    icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
    color: "bg-purple-50"
  },
  {
    title: "Emotional Intelligence",
    description: "Analyzes visitor sentiment and tone in real-time, adapting its responses to ensure every customer feels heard and understood.",
    icon: <Heart className="w-6 h-6 text-pink-600" />,
    color: "bg-pink-50"
  }
];

const steps = [
  {
    title: "Paste URL",
    desc: "Enter any page link from your website.",
    icon: <Link2 className="w-5 h-5" />,
  },
  {
    title: "AI Analysis",
    desc: "Our engine crawls and learns every detail.",
    icon: <Search className="w-5 h-5" />,
  },
  {
    title: "Go Live",
    desc: "Deploy your agent with a single line of code.",
    icon: <Zap className="w-5 h-5" />,
  }
];

const voices = [
  { name: "Sarah", personality: "Professional & Calm", color: "bg-blue-600" },
  { name: "James", personality: "Friendly & Energetic", color: "bg-purple-600" },
  { name: "Elena", personality: "Warm & Empathetic", color: "bg-pink-600" },
];

export function FeaturesPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16 md:py-24 w-full">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-6 ring-1 ring-blue-500/20"
          >
            <Lock className="w-4 h-4" />
            <span>Train from URL • Zero Config • Human Handoff</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-8"
          >
            Capabilities that scale with your <span className="text-blue-600">website</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 font-medium mb-16"
          >
            The easiest way to automate your website's customer interactions. Just paste a link and let our AI do the rest.
          </motion.p>

          {/* Interactive URL Demo Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-3xl shadow-2xl ring-1 ring-slate-200 max-w-2xl mx-auto overflow-hidden relative group"
          >
            <div className="flex items-center space-x-2 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left px-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paste your link</div>
                <div className="text-slate-900 font-bold text-sm">https://yourwebsite.com/pricing</div>
              </div>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                Train AI
              </button>
            </div>
            
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-50">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse" />)}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Content...</span>
              </div>
              <div className="text-[10px] font-bold text-blue-600">84% Complete</div>
            </div>
          </motion.div>
        </div>

        {/* How it Works Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-16">How it works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 bg-white p-8 rounded-3xl ring-1 ring-slate-200 shadow-sm text-center group hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Core Capabilities</h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium mb-16">Powering your website with high-performance voice intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: i * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98] 
              }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white p-8 rounded-[32px] ring-1 ring-slate-200 shadow-sm hover:shadow-2xl hover:ring-blue-100 transition-all duration-300 group cursor-default"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-slate-500 text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trusted Security Grid Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Trusted Security</h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium mb-16">Enterprise-grade protection for your data and customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {[
            { title: "Bank-Level Encryption", desc: "All data is encrypted in transit and at rest using AES-256 standards.", icon: <ShieldCheck className="text-emerald-600" /> },
            { title: "SOC2 Type II Compliant", desc: "Independent audits ensure we meet the highest security standards.", icon: <Fingerprint className="text-blue-600" /> },
            { title: "GDPR & CCPA Ready", desc: "Fully compliant with global privacy regulations and data rights.", icon: <Lock className="text-indigo-600" /> },
            { title: "Private Cloud Infrastructure", desc: "Dedicated instances available for high-security enterprise needs.", icon: <Server className="text-purple-600" /> },
            { title: "Real-time Monitoring", desc: "24/7 threat detection and automated incident response systems.", icon: <Activity className="text-rose-600" /> },
            { title: "Zero Trust Architecture", desc: "Rigorous identity verification for every access request.", icon: <Lock className="text-slate-600" /> }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start space-x-4 hover:border-blue-100 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </div>
  );
}

