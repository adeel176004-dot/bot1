import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout
      className={`mb-4 overflow-hidden rounded-2xl border transition-colors duration-300 ${
        isOpen ? 'border-blue-200 bg-blue-50/30 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left group transition-all outline-none"
      >
        <span className={`text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'}`}>
          {question}
        </span>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-100' : 'bg-slate-50 group-hover:bg-blue-50'}`}
        >
          <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-slate-600 leading-relaxed text-[17px] border-t border-blue-100/50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const COMMON_FAQS = [
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
    a: "Absolutely. Our voice agents are polyglots, supporting over 100+ languages including Spanish, French, German, Mandarin, and many more, with localized accents for each."
  },
  {
    q: "How does human hand-off work?",
    a: "If the agent encounters a complex query it can't resolve, it can instantly transfer the call to your live support team via SIP or ring your office number directly."
  },
  {
    q: "Is our data secure and private?",
    a: "Security is our top priority. We use industry-standard encryption for all data at rest and in transit, and we are fully SOC2 and GDPR compliant."
  }
];
