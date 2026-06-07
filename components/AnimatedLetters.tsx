'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  className?: string;
  delay?: number;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export default function AnimatedLetters({
  text,
  className = '',
  delay = 800,
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseDuration = 2500,
}: Props) {
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const indexRef = useRef(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const start = () => {
      timer = setTimeout(function tick() {
        if (!isDeleting) {
          indexRef.current++;

          setDisplayed(text.slice(0, indexRef.current));

          if (indexRef.current === text.length) {
            timer = setTimeout(() => {
              setIsDeleting(true);
            }, pauseDuration);
            return;
          }

          timer = setTimeout(tick, typingSpeed);
        } else {
          indexRef.current--;

          setDisplayed(text.slice(0, indexRef.current));

          if (indexRef.current === 0) {
            timer = setTimeout(() => {
              setIsDeleting(false);
            }, 600);
            return;
          }

          timer = setTimeout(tick, deletingSpeed);
        }
      }, delay);
    };

    start();

    return () => clearTimeout(timer);
  }, [text, isDeleting, typingSpeed, deletingSpeed, pauseDuration, delay]);

  return (
    <span className={className}>
      {displayed}
      <span className='typing-cursor'>|</span>
    </span>
  );
}
