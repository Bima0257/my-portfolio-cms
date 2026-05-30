import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import Icon from '@/components/Icon';

interface AboutData {
  name: string;
  description: string;
  photo: string | null;
  experience: number;
  tools: string[];
  highlights: string[];
}

export default async function About() {
  const supabase = createClient();

  const { data: about } = await supabase
    .from('abouts')
    .select('name, description, photo, experience, tools, highlights')
    .limit(1)
    .single<AboutData>();

  const tools = about?.tools?.length
    ? about.tools
    : [
        'Figma',
        'Adobe XD',
        'Sketch',
        'Protopie',
        'Framer',
        'Zeplin',
        'Notion',
        'Miro',
      ];
  const highlights = about?.highlights?.length
    ? about.highlights
    : [
        'Fullstack Developer',
        'Fluent in Figma, Adobe XD, and Sketch',
        'Available for freelance & full-time opportunities',
        'Experienced with cross-functional agile teams',
      ];
  const description = about?.description ?? '';
  const experience = about?.experience ?? 4;
  const photo = about?.photo ?? null;

  return (
    <section id='about' className='bg-surface-card py-[100px]'>
      <div className='max-w-[1160px] mx-auto px-8'>
        <div className='grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-20 items-center'>
          <div className='reveal relative'>
            <div className='rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group'>
              {photo ? (
                <Image
                  src={photo}
                  alt={about?.name ?? 'About'}
                  width={480}
                  height={560}
                  className='w-full block grayscale-[10%] transition-all duration-500 group-hover:grayscale-0'
                />
              ) : (
                <div className='w-[480px] h-[560px] bg-primary-muted flex items-center justify-center'>
                  <Icon name='person' size={80} className='text-primary/40' />
                </div>
              )}
            </div>
            <div className='absolute -bottom-4 -right-5 bg-primary text-white rounded-[14px] px-5 py-3 font-display text-[0.95rem] font-bold text-center shadow-chip leading-snug'>
              <span className='block text-[1.5rem] font-extrabold'>
                {experience}+
              </span>
              Years of Experience
            </div>
          </div>

          <div className='reveal d2 py-2'>
            <div className='inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-primary mb-4'>
              <span className='block w-6 h-0.5 bg-primary rounded-sm' />
              About Me
            </div>

            <h2
              className='font-display font-extrabold text-on-surface tracking-tight mb-4'
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
            >
              Fullstack, <span className='block'>Developer</span>
            </h2>

            {description ? (
              <p className='text-on-surface-muted leading-[1.8] mb-8'>
                {description}
              </p>
            ) : (
              <>
                <p className='text-on-surface-muted leading-[1.8] mb-5'>
                  I&apos;m a UI/UX Designer based in Indonesia, certified by the
                  Interaction Design Foundation. My work spans across web,
                  mobile, and brand identity — helping startups and established
                  businesses create products that are both beautiful and
                  functional.
                </p>
                <p className='text-on-surface-muted leading-[1.8] mb-8'>
                  My process is collaborative and research-first. I believe
                  great design is invisible — it simply feels right. Whether
                  it&apos;s a complex SaaS dashboard or a consumer mobile app, I
                  bring the same level of care and craft to every pixel.
                </p>
              </>
            )}

            <ul className='flex flex-col gap-3 mb-8'>
              {highlights.map((item) => (
                <li
                  key={item}
                  className='flex items-center gap-3 text-[0.95rem] text-on-surface'
                >
                  <Icon
                    name='check_circle'
                    size={20}
                    className='text-primary flex-shrink-0'
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className='flex flex-wrap gap-2 mt-6'>
              {tools.map((tool) => (
                <span
                  key={tool}
                  className='bg-surface-low text-on-surface-muted text-[0.8rem] font-medium px-[0.9rem] py-[0.4rem] rounded-full border border-outline-variant'
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
