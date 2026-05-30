import { createClient } from '@/lib/supabase/server';
import SkillCardClient from './SkillCardClient';

interface Skill {
  name: string;
  level: string;
  percentage: number;
  icon?: string | null;
  sort_order: number;
}

interface SkillCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  skills: Skill[];
}

const delays = ['d1', 'd2', 'd3', 'd1', 'd2', 'd3'];

const defaultCategories: SkillCategory[] = [
  {
    id: 1,
    name: 'UI Design',
    slug: 'ui-design',
    icon: 'palette',
    description:
      'Crafting visually stunning, pixel-perfect interfaces that delight users.',
    skills: [
      {
        name: 'Visual Design',
        level: 'Expert',
        percentage: 95,
        sort_order: 1,
      },
      {
        name: 'Design Systems',
        level: 'Expert',
        percentage: 90,
        sort_order: 2,
      },
    ],
  },
  {
    id: 2,
    name: 'UX Research',
    slug: 'ux-research',
    icon: 'person_search',
    description:
      'Deep user empathy through interviews, testing, and data-driven insights.',
    skills: [
      {
        name: 'User Research',
        level: 'Advanced',
        percentage: 88,
        sort_order: 1,
      },
      {
        name: 'Usability Testing',
        level: 'Advanced',
        percentage: 85,
        sort_order: 2,
      },
    ],
  },
];

export default async function Skills() {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('skill_categories')
    .select(
      'id, name, slug, icon, description, skills(name, level, percentage, icon)',
    )
    .order('sort_order');

  const skillCards: SkillCategory[] = (
    categories?.length ? categories : defaultCategories
  ) as SkillCategory[];

  return (
    <section id='skills' className='bg-surface py-[100px]'>
      <div className='max-w-[1160px] mx-auto px-8'>
        <div className='reveal flex flex-col items-center text-center mb-12'>
          <div className='inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-primary mb-4'>
            <span className='block w-6 h-0.5 bg-primary rounded-sm' />
            Expertise
          </div>
          <h2
            className='font-display font-extrabold text-on-surface tracking-tight mb-4'
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
          >
            Skills &amp; Capabilities
          </h2>
          <p className='text-on-surface-muted max-w-[520px] leading-[1.7]'>
            A well-rounded set of skills built over years of working with
            diverse clients and industries.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {skillCards.map((card, i) => (
            <SkillCardClient
              key={card.id ?? card.slug}
              card={card}
              delay={delays[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
