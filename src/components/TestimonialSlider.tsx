import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "The human-like quality of the voice agent is remarkable. It handled our entire Black Friday support surge without a single missed call or escalation error.",
    author: "Jonathan Chen",
    role: "Director of Operations at Nexus Retail",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 2,
    text: "Setting up our AI receptionist took less than a minute. It's now handling 80% of our routine booking inquiries, freeing up our staff for high-value tasks.",
    author: "Sarah Jenkins",
    role: "Founder of Bloom Wellness",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: 3,
    text: "The multi-language support is a game changer. We've expanded our customer service to 12 new regions without hiring a single additional agent.",
    author: "Marcus Rodriguez",
    role: "VP of Support at GlobalLink Tech",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

export function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="relative max-w-4xl mx-auto px-4 h-[300px] md:h-[250px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10"
        >
          <div className="flex-shrink-0 relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-10">
              <Quote className="w-4 h-4" />
            </div>
            <img 
              src={current.image} 
              alt={current.author}
              className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover shadow-xl border-4 border-white ring-1 ring-blue-100"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed font-medium mb-6 italic tracking-tight">
              “{current.text}”
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-xl font-bold text-slate-900">{current.author}</h4>
              <p className="text-blue-600 text-base font-semibold">{current.role}</p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-3 pb-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-8 bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
