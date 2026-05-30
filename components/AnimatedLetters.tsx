"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export default function AnimatedLetters({ text, className = "", delay = 0, stagger = 0.03 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  const chars = useMemo(() => text.split(""), [text]);

  return (
    <span className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: delay + i * stagger }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
