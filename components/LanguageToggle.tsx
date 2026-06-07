'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Icon from './Icon';

type AnimState = 'idle' | 'fadeOut' | 'fadeIn';

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  const [animState, setAnimState] = useState<AnimState>('idle');
  const busyRef = useRef<boolean>(false);

  const handleToggle = (): void => {
    if (busyRef.current) return;
    busyRef.current = true;

    setAnimState('fadeOut');

    setTimeout(() => {
      toggleLocale();
      setAnimState('fadeIn');

      setTimeout(() => {
        setAnimState('idle');
        busyRef.current = false;
      }, 300);
    }, 200);
  };

  const getIconStyle = (): React.CSSProperties => {
    if (animState === 'fadeOut') {
      return {
        opacity: 0,
        transform: 'scale(0.85)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      };
    }
    if (animState === 'fadeIn') {
      return {
        opacity: 1,
        transform: 'scale(1)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      };
    }
    return {
      opacity: 1,
      transform: 'scale(1)',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    };
  };

  return (
    <button
      onClick={handleToggle}
      aria-label='Toggle language'
      className='flex items-center justify-center w-12 h-12 rounded-full'
    >
      <span style={{ display: 'flex', ...getIconStyle() }}>
        <Icon
          name={locale === 'en' ? 'flag:gb-4x3' : 'flag:id-4x3'}
          size={32}
        />
      </span>
    </button>
  );
}
