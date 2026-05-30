'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

interface Skill {
  name: string;
  level: string;
  percentage: number;
  icon?: string | null;
  sort_order?: number;
}

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  skills: Skill[];
  skill_icon?: string | null;
}

const levelColors: Record<string, string> = {
  Beginner: 'bg-blue-100 text-blue-600',
  Intermediate: 'bg-yellow-100 text-yellow-600',
  Advanced: 'bg-orange-100 text-orange-600',
  Expert: 'bg-green-100 text-green-600',
};

export default function SkillCardClient({
  card,
  delay,
}: {
  card: SkillCategory;
  delay: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`reveal ${delay} skill-card group bg-surface-card border border-outline-variant rounded-[20px] p-7 relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card hover:border-primary-light cursor-pointer`}
        onClick={() => setOpen(true)}
      >
        <span className='absolute top-0 left-0 right-0 h-[3px] bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100' />

        <div className='w-12 h-12 bg-primary-muted rounded-[14px] flex items-center justify-center mb-5'>
          <Icon name={card.icon} size={26} className='text-primary' />
        </div>

        <h3 className='font-display text-[1rem] font-bold mb-2'>{card.name}</h3>
        <p className='text-[0.875rem] text-on-surface-muted leading-[1.6] mb-5'>
          {card.description}
        </p>

        <div className='flex flex-col gap-[0.6rem]'>
          {card.skills.map((bar) => (
            <div key={bar.name} className='flex flex-col gap-1'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-1.5'>
                  <Icon
                    name={bar.icon ?? card.icon}
                    size={14}
                    className='text-primary flex-shrink-0'
                  />
                  <span className='text-[0.78rem] text-on-surface-muted font-medium'>
                    {bar.name}
                  </span>
                </div>
                <span className='text-[0.78rem] text-primary font-bold'>
                  {bar.percentage}%
                </span>
              </div>
              <div className='bg-surface-low rounded-full h-[5px] overflow-hidden'>
                <div className='skill-bar-fill' data-width={bar.percentage} />
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 text-[0.78rem] text-primary font-semibold text-center opacity-0 group-hover:opacity-100 transition-opacity'>
          Click to view details
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto'
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className='bg-surface-card rounded-[24px] max-w-[520px] w-full mx-4 border border-outline-variant shadow-card overflow-hidden'>
            {/* Header */}
            <div className='bg-primary-muted px-8 py-6 flex items-center gap-4'>
              <div className='w-14 h-14 bg-primary rounded-[16px] flex items-center justify-center'>
                <Icon name={card.icon} size={30} className='text-white' />
              </div>
              <div className='flex-1'>
                <h3 className='font-display text-[1.3rem] font-extrabold text-on-surface'>
                  {card.name}
                </h3>
                <p className='text-[0.85rem] text-on-surface-muted'>
                  {card.description}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className='w-8 h-8 rounded-full bg-white/60 text-on-surface flex items-center justify-center border-none cursor-pointer hover:bg-white transition-colors flex-shrink-0'
              >
                <Icon name='close' size={18} />
              </button>
            </div>

            {/* Skills list */}
            <div className='p-8 flex flex-col gap-5'>
              {card.skills
                .slice()
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((skill) => (
                  <div key={skill.name}>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <Icon
                          name={skill.icon ?? card.icon}
                          size={18}
                          className='text-primary'
                        />
                        <span className='text-[0.95rem] font-semibold text-on-surface'>
                          {skill.name}
                        </span>
                      </div>
                      <span className='text-[0.85rem] font-bold text-primary'>
                        {skill.percentage}%
                      </span>
                    </div>
                    <div className='bg-surface-low rounded-full h-[8px] overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all duration-1000'
                        style={{
                          width: `${skill.percentage}%`,
                          background:
                            'linear-gradient(90deg, #006a63, #9cf2e8)',
                        }}
                      />
                    </div>
                    <div className='mt-1 flex justify-between text-[0.7rem] text-on-surface-muted'>
                      <span>{skill.level}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
