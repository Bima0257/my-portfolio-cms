'use client';

import { useState, useEffect } from 'react';
import { createPublicClient } from '@/lib/supabase/public';
import Icon from '@/components/Icon';
import { useLanguage } from '@/context/LanguageContext';
import { f } from '@/lib/locale';

interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  demo_url: string | null;
  github_url: string | null;
  gradient: string;
  icon: string;
  tags: string[];
  cat: string;
  project_category_id: number | null;
}

const delays = ['d1', 'd2', 'd3', 'd1', 'd2', 'd3'];

export default function Projects() {
  const { t, locale } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createPublicClient();
    const titleKey = f(locale, 'title');
    const descKey = f(locale, 'description');
    const nameKey = f(locale, 'name');

    (async () => {
      const [projRes, catRes] = await Promise.all([
        supabase
          .from('projects')
          .select(`*, ${titleKey}, ${descKey}`)
          .order('sort_order'),
        supabase
          .from('project_categories')
          .select(`id, ${nameKey}, slug`)
          .order('sort_order'),
      ]);

      if (cancelled) return;
      if (projRes.data) {
        console.log(
          '🔍 [Projects] locale:',
          locale,
          '| titleKey:',
          titleKey,
          '| descKey:',
          descKey,
        );
        console.log(
          '🔍 [Projects] raw sample:',
          projRes.data.slice(0, 2).map((p: any) => ({
            title_en: p.title,
            [`${titleKey}`]: p[titleKey],
            title_final: p[titleKey] ?? p.title,
          })),
        );
        const mapped = projRes.data.map((p: any) => ({
          ...p,
          title: p[titleKey] ?? p.title,
          description: p[descKey] ?? p.description,
        }));
        setProjects(mapped as unknown as Project[]);
      }
      if (catRes.data) {
        console.log(
          '🔍 [Projects] categories:',
          catRes.data.map((c: any) => ({
            name_en: c.name,
            [`${nameKey}`]: c[nameKey],
            name_final: c[nameKey] ?? c.name,
          })),
        );
        const mapped = catRes.data.map((c: any) => ({
          ...c,
          name: c[nameKey] ?? c.name,
        }));
        setCategories(mapped);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const filtered = projects.filter(
    (p) =>
      activeFilter === 'all' || p.project_category_id === Number(activeFilter),
  );

  const categoriesWithProjects = categories.filter((category) =>
    projects.some((project) => project.project_category_id === category.id),
  );

  return (
    <section id='projects' className='bg-surface-low py-[100px]'>
      <div className='max-w-[1160px] mx-auto px-8'>
        <div className='reveal flex flex-col items-start mb-4'>
          <div className='inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-primary mb-4'>
            <span className='block w-6 h-0.5 bg-primary rounded-sm' />
            {t.projects.badge}
          </div>
          <h2
            className='font-display font-extrabold text-on-surface tracking-tight'
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
          >
            {t.projects.title}
          </h2>
        </div>

        <div className='reveal d1 flex flex-wrap gap-2 mb-10 mt-4'>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-[1.1rem] py-[0.45rem] rounded-full text-[0.85rem] font-medium cursor-pointer border-[1.5px] transition-all duration-200 font-body ${
              activeFilter === 'all'
                ? 'bg-primary border-primary text-white'
                : 'bg-surface-card border-outline-variant text-on-surface-muted hover:bg-primary hover:border-primary hover:text-white'
            }`}
          >
            {t.projects.allWork}
          </button>
          {categoriesWithProjects.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(String(cat.id))}
              className={`px-[1.1rem] py-[0.45rem] rounded-full text-[0.85rem] font-medium cursor-pointer border-[1.5px] transition-all duration-200 font-body ${
                activeFilter === String(cat.id)
                  ? 'bg-primary border-primary text-white'
                  : 'bg-surface-card border-outline-variant text-on-surface-muted hover:bg-primary hover:border-primary hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filtered.length === 0 && (
              <div className='col-span-full text-center py-12 text-on-surface-muted'>
                {t.projects.empty}
              </div>
            )}
            {filtered.map((project, i) => (
              <div
                key={project.id ?? i}
                className={`group bg-surface-card rounded-[20px] overflow-hidden border border-outline-variant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover`}
              >
                <div className='h-[200px] relative overflow-hidden'>
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className='w-full h-full'
                    />
                  ) : (
                    <div
                      className='w-full h-full flex items-center justify-center'
                      style={{
                        background:
                          project.gradient ||
                          'linear-gradient(135deg, #005c55 0%, #0d9488 100%)',
                      }}
                    >
                      <Icon
                        name={project.icon || 'folder'}
                        size={48}
                        className='text-white/50'
                      />
                    </div>
                  )}
                  <button
                    onClick={() => setSelected(project)}
                    className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 border-none cursor-pointer w-full'
                  >
                    <div
                      className='absolute inset-0'
                      style={{
                        background:
                          project.gradient ||
                          'linear-gradient(135deg, #005c55 0%, #0d9488 100%)',
                        opacity: 0.85,
                      }}
                    />
                    <span className='relative z-10 text-white text-[0.875rem] font-semibold flex items-center gap-1.5'>
                      <Icon name={project.icon || 'open_in_new'} size={18} />
                      {t.projects.viewDetail}
                    </span>
                  </button>
                </div>

                <div className='p-6'>
                  <div className='flex flex-wrap gap-1.5 mb-3'>
                    {(project.tags ?? []).map((tag: string) => (
                      <span
                        key={tag}
                        className='text-[0.72rem] font-semibold tracking-wide uppercase px-[0.65rem] py-1 rounded-full bg-primary-muted text-primary'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className='font-display text-[1rem] font-bold mb-1'>
                    {project.title}
                  </div>
                  <p className='text-[0.875rem] text-on-surface-muted leading-[1.6] line-clamp-3 mb-4'>
                    {project.description}
                  </p>

                  <div className='flex flex-wrap gap-2'>
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-[0.78rem] font-semibold no-underline transition-all duration-200 hover:bg-primary-accent'
                      >
                        <Icon name='open_in_new' size={14} />
                        {t.projects.liveSite}
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 bg-surface-card text-on-surface px-4 py-2 rounded-full text-[0.78rem] font-semibold no-underline border border-outline-variant transition-all duration-200 hover:bg-surface-low'
                      >
                        <Icon name='github' size={14} />
                        {t.projects.github}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className='fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8 px-4 bg-black/40 backdrop-blur-sm overflow-y-auto'>
          <div className='bg-surface-card rounded-[24px] max-w-[640px] w-full mx-4 border border-outline-variant shadow-card flex flex-col max-h-[calc(100vh-8rem)] overflow-y-auto'>
            <div className='relative w-full overflow-hidden rounded-t-[24px] bg-black shrink-0'>
              {selected.thumbnail ? (
                <img
                  src={selected.thumbnail}
                  alt={selected.title}
                  className='w-full max-h-[200px] object-contain'
                />
              ) : (
                <div
                  className='w-full h-[160px] flex items-center justify-center shrink-0'
                  style={{
                    background:
                      selected.gradient ||
                      'linear-gradient(135deg, #005c55 0%, #0d9488 100%)',
                  }}
                >
                  <Icon
                    name={selected.icon || 'folder'}
                    size={64}
                    className='text-white/30'
                  />
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                className='absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center border-none cursor-pointer hover:bg-black/50 transition-colors backdrop-blur-sm'
              >
                <Icon name='close' size={20} />
              </button>
            </div>

            <div className='p-8'>
              <div className='flex flex-wrap gap-2 mb-4'>
                {(selected.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className='text-[0.72rem] font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-primary-muted text-primary'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className='font-display text-[1.5rem] font-extrabold text-on-surface mb-3'>
                {selected.title}
              </h3>
              <p className='text-[0.95rem] text-on-surface-muted leading-[1.8] mb-6'>
                {selected.description}
              </p>

              <div className='flex flex-wrap gap-3'>
                {selected.demo_url && (
                  <a
                    href={selected.demo_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-[0.9rem] font-semibold no-underline transition-all duration-200 hover:bg-primary-accent hover:-translate-y-0.5'
                  >
                    <Icon name='open_in_new' size={18} />
                    {t.projects.visitSite}
                  </a>
                )}
                {selected.github_url && (
                  <a
                    href={selected.github_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 bg-surface-card text-on-surface px-6 py-3 rounded-full text-[0.9rem] font-semibold no-underline border border-outline-variant transition-all duration-200 hover:bg-surface-low hover:-translate-y-0.5'
                  >
                    <Icon name='github' size={18} />
                    {t.projects.viewOnGithub}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
