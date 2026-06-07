import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { f } from '@/lib/locale';
import en from '@/locales/en';
import id from '@/locales/id';
import Icon from '@/components/Icon';

interface ExperienceItem {
  id: number;
  position: string;
  company: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

interface EducationItem {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_year: number;
  end_year: number | null;
  description: string | null;
}

function formatPeriod(
  start: string,
  end: string | null,
  isCurrent: boolean,
  presentLabel: string,
): string {
  const startYear = new Date(start).getFullYear();
  if (isCurrent) return `${startYear} — ${presentLabel}`;
  if (end) return `${startYear} — ${new Date(end).getFullYear()}`;
  return `${startYear}`;
}

function TimelineExperience({
  items,
  presentLabel,
}: {
  items: ExperienceItem[];
  presentLabel: string;
}) {
  return (
    <div className='flex flex-col'>
      {items.map((item, i) => (
        <div
          key={item.id}
          className='grid grid-cols-[40px_1fr] gap-4 pb-8 last:pb-0'
        >
          <div className='flex flex-col items-center'>
            <div className='w-3 h-3 rounded-full bg-primary border-[3px] border-surface-card shadow-[0_0_0_2px_#006a63] flex-shrink-0 mt-1 animate-breathe' />
            {i < items.length - 1 && (
              <div className='w-0.5 flex-1 bg-outline-variant mt-1.5' />
            )}
          </div>
          <div>
            <div className='text-[0.75rem] font-semibold text-primary uppercase tracking-wider mb-1'>
              {formatPeriod(
                item.start_date,
                item.end_date,
                item.is_current,
                presentLabel,
              )}
            </div>
            <div className='text-[1rem] font-bold text-on-surface mb-0.5'>
              {item.position}
            </div>
            <div className='text-[0.875rem] text-on-surface-muted mb-2'>
              {item.company}
            </div>
            {item.description && (
              <div className='text-[0.85rem] text-on-surface-muted leading-[1.65]'>
                {item.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineEducation({ items }: { items: EducationItem[] }) {
  return (
    <div className='flex flex-col'>
      {items.map((item, i) => (
        <div
          key={item.id}
          className='grid grid-cols-[40px_1fr] gap-4 pb-8 last:pb-0'
        >
          <div className='flex flex-col items-center'>
            <div className='w-3 h-3 rounded-full bg-primary border-[3px] border-surface-card shadow-[0_0_0_2px_#006a63] flex-shrink-0 mt-1 animate-breathe' />
            {i < items.length - 1 && (
              <div className='w-0.5 flex-1 bg-outline-variant mt-1.5' />
            )}
          </div>
          <div>
            <div className='text-[0.75rem] font-semibold text-primary uppercase tracking-wider mb-1'>
              {item.start_year}
              {item.end_year && item.end_year !== item.start_year
                ? ` — ${item.end_year}`
                : ''}
            </div>
            <div className='text-[1rem] font-bold text-on-surface mb-0.5'>
              {item.degree}
            </div>
            <div className='text-[0.875rem] text-on-surface-muted mb-2'>
              {item.institution}
              {item.field_of_study ? ` · ${item.field_of_study}` : ''}
            </div>
            {item.description && (
              <div className='text-[0.85rem] text-on-surface-muted leading-[1.65]'>
                {item.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Experience() {
  const supabase = createClient();
  const locale = (await cookies()).get('portfolio_locale')?.value ?? 'en';
  const t = locale === 'id' ? id : en;
  const posKey = f(locale, 'position');
  const companyKey = f(locale, 'company');
  const expDescKey = f(locale, 'description');
  const degreeKey = f(locale, 'degree');
  const institutionKey = f(locale, 'institution');
  const fieldKey = f(locale, 'field_of_study');
  const eduDescKey = f(locale, 'description');

  const [experiencesRes, educationsRes] = await Promise.all([
    supabase
      .from('experiences')
      .select(`*, ${posKey}, ${companyKey}, ${expDescKey}`)
      .order('sort_order'),
    supabase
      .from('educations')
      .select(`*, ${degreeKey}, ${institutionKey}, ${fieldKey}, ${eduDescKey}`)
      .order('sort_order'),
  ]);

  console.log(
    '🔍 [Experience] locale:',
    locale,
    '| posKey:',
    posKey,
    '| companyKey:',
    companyKey,
  );
  console.log(
    '🔍 [Experience] raw experiences:',
    experiencesRes.data?.map((e: any) => ({
      id: e.id,
      position: e.position,
      [`${posKey}`]: e[posKey],
      position_final: e[posKey] ?? e.position,
      company_final: e[companyKey] ?? e.company,
    })),
  );
  console.log(
    '🔍 [Experience] raw educations:',
    educationsRes.data?.map((e: any) => ({
      id: e.id,
      degree: e.degree,
      [`${degreeKey}`]: e[degreeKey],
      degree_final: e[degreeKey] ?? e.degree,
    })),
  );

  const workExperience: ExperienceItem[] = (experiencesRes.data ?? []).map(
    (e: any) => ({
      ...e,
      position: e[posKey] ?? e.position,
      company: e[companyKey] ?? e.company,
      description: e[expDescKey] ?? e.description,
    }),
  );

  const education: EducationItem[] = (educationsRes.data ?? []).map(
    (e: any) => ({
      ...e,
      degree: e[degreeKey] ?? e.degree,
      institution: e[institutionKey] ?? e.institution,
      field_of_study: e[fieldKey] ?? e.field_of_study,
      description: e[eduDescKey] ?? e.description,
    }),
  );

  return (
    <section id='experience' className='bg-surface-card py-[100px]'>
      <div className='max-w-[1160px] mx-auto px-8'>
        <div className='reveal flex flex-col items-start mb-12'>
          <div className='inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-primary mb-4'>
            <span className='block w-6 h-0.5 bg-primary rounded-sm' />
            {t.experience.badge}
          </div>
          <h2
            className='font-display font-extrabold text-on-surface tracking-tight'
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
          >
            {t.experience.title}
          </h2>
        </div>

        {workExperience.length > 0 || education.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>
            {workExperience.length > 0 && (
              <div className='reveal d1'>
                <h3 className='text-[1rem] font-bold text-on-surface-muted uppercase tracking-[0.08em] mb-8 flex items-center gap-2'>
                  <Icon name='work' size={18} className='text-primary' />
                  {t.experience.work}
                </h3>
                <TimelineExperience
                  items={workExperience}
                  presentLabel={t.experience.present}
                />
              </div>
            )}
            {education.length > 0 && (
              <div className='reveal d2'>
                <h3 className='text-[1rem] font-bold text-on-surface-muted uppercase tracking-[0.08em] mb-8 flex items-center gap-2'>
                  <Icon name='school' size={18} className='text-primary' />
                  {t.experience.education}
                </h3>
                <TimelineEducation items={education} />
              </div>
            )}
          </div>
        ) : (
          <div className='flex justify-center py-20 text-on-surface-muted'>
            {t.experience.empty}
          </div>
        )}

        <div className='reveal bg-on-surface rounded-[28px] px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mt-24'>
          <span className='absolute w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] -top-[100px] -right-[50px] pointer-events-none' />

          <div className='relative z-10'>
            <h2
              className='font-display font-extrabold text-white mb-2'
              style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
            >
              {t.experience.cta}
            </h2>
            <p className='text-white/60 text-[0.95rem] max-w-[400px]'>
              {t.experience.availability}
            </p>
          </div>

          <div className='relative z-10 flex-shrink-0'>
            <a
              href='#contact'
              className='inline-flex items-center gap-2 bg-primary-light text-on-surface px-8 py-[0.9rem] rounded-full text-[0.95rem] font-bold no-underline transition-all duration-200 hover:scale-[0.97]'
            >
              <Icon name='send' size={20} />
              {t.experience.startProject}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
