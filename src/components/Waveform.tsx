import React from 'react';
import { motion } from 'motion/react';

export function InteractiveWaveform() {
  const bars = Array.from({ length: 40 });

  return (
    <div className="flex items-center justify-center space-x-1 h-12 w-full max-w-md mx-auto overflow-hidden">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-blue-600 rounded-full"
          initial={{ height: 4 }}
          animate={{
            height: [4, Math.random() * 40 + 8, 4],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}
