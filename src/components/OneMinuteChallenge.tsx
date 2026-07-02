import React from 'react';
import { motion } from 'motion/react';
import { Timer, Zap, ChevronRight, Sparkles } from 'lucide-react';

interface OneMinuteChallengeProps {
  onStart: () => void;
}

export function OneMinuteChallenge({ onStart }: OneMinuteChallengeProps) {
  return (
    <section className="py-20 relative overflow-hidden bg-slate-50/30">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white border border-slate-100 rounded-[3rem] p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" /> Limited Time Challenge
              </motion.div>
              
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="block"
                  >
                    The <span className="text-blue-600">60-Second</span>
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="block"
                  >
                    AI Challenge
                  </motion.span>
                </h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-500 text-lg leading-relaxed max-w-sm"
                >
                  We challenge you to build your business AI agent in under 1 minute. Fast setup, no complexity.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <button 
                  onClick={onStart}
                  className="group relative bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-blue-700 transition-all shadow-[0_10px_25px_rgba(37,99,235,0.2)] flex items-center"
                >
                  <span>Start the Timer</span>
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            <div className="relative">
              <div className="space-y-6 relative pr-8">
                {[
                  { step: 1, text: "Describe your business niche" },
                  { step: 2, text: "Choose your AI voice personality" },
                  { step: 3, text: "Connect to your dashboard" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex items-center gap-5 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      {item.step}
                    </div>
                    <div className="text-slate-700 font-semibold text-lg group-hover:text-blue-600 transition-colors">
                      "{item.text}"
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Float Timer Badge */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-14 -right-10 md:-top-20 md:-right-14 w-24 h-24 bg-blue-600 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-2xl z-20 border-4 border-white"
              >
                <span className="text-2xl leading-none">60s</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
