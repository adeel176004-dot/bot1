import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Sparkles, Info } from 'lucide-react';
import { PLANS } from '../data/plans';
import { PlanFeature } from '../types';

const FeatureItem: React.FC<{ feature: PlanFeature }> = ({ feature }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex items-start justify-between space-x-3 group relative">
      <div className="flex items-start space-x-3">
        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
          <Check className="w-3 h-3 text-blue-600" />
        </div>
        <span className="text-slate-600 text-sm">{feature.text}</span>
      </div>
      
      <div className="relative flex-shrink-0">
        <button 
          onClick={() => setShowInfo(!showInfo)}
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          className="mt-1 text-slate-300 hover:text-blue-500 transition-colors focus:outline-none p-0.5"
          aria-label={`Info about ${feature.text}`}
        >
          <Info className="w-3.5 h-3.5" />
        </button>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-slate-900 text-white text-[11px] leading-relaxed rounded-xl shadow-xl z-50 pointer-events-none font-medium"
            >
              <div className="relative">
                {feature.info}
                <div className="absolute top-full right-1.5 w-2 h-2 bg-slate-900 rotate-45 -translate-y-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface PricingProps {
  onSelectPlan?: (planId: string) => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pricing Plans</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Choose the perfect plan for your business
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Whether you're just starting or scaling to thousands of users, we have a plan that fits your needs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[32px] border ${
                plan.isPopular 
                  ? 'border-blue-200 bg-blue-50/30 shadow-xl shadow-blue-500/5' 
                  : 'border-slate-100 bg-white shadow-lg shadow-slate-200/50'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm font-medium">/{plan.period}</span>
                </div>
              </div>

              <div className="flex-grow space-y-4 mb-10">
                {plan.features.map((feature, fIndex) => (
                  <FeatureItem key={fIndex} feature={feature} />
                ))}
              </div>

              <button
                disabled={!plan.active}
                onClick={() => onSelectPlan?.(plan.id)}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  plan.active
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {plan.active ? 'Get Started' : 'Coming Soon'}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500 text-sm">
            All plans include access to our basic Voice AI features. <br className="hidden md:block" />
            Have questions? <button className="text-blue-600 font-bold hover:underline">Contact our sales team</button>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
