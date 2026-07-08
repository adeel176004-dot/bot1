import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export function MouseFollowGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(37, 99, 235, 0.06), transparent 80%)`,
      }}
    />
  );
}
