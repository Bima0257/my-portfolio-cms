'use client';

import { useState, useEffect } from 'react';
import { createPublicClient } from '@/lib/supabase/public';
import Icon from '@/components/Icon';

interface SocialLink {
  id: number;
  name: string;
  url: string;
  icon: string | null;
  label: string | null;
}

export default function Contact() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createPublicClient();
    supabase
      .from('social_links')
      .select('id, name, url, icon, label')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setSocialLinks(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name =
      `${formData.get('fname') || ''} ${formData.get('lname') || ''}`.trim();
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    const supabase = createPublicClient();
    const { error: submitError } = await supabase
      .from('messages')
      .insert({ name, email, message });

    if (submitError) {
      setError('Failed to send message. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id='contact' className='bg-surface py-[100px]'>
      <div className='max-w-[1160px] mx-auto px-8'>
        <div className='reveal flex flex-col items-start'>
          <div className='inline-flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.1em] uppercase text-primary mb-4'>
            <span className='block w-6 h-0.5 bg-primary rounded-sm' />
            Get In Touch
          </div>
          <h2
            className='font-display font-extrabold text-on-surface tracking-tight'
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}
          >
            Let&apos;s Talk
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-20 items-start mt-12'>
          <div className='reveal d1 flex flex-col gap-8'>
            <p className='text-on-surface-muted leading-[1.7] max-w-[360px]'>
              Have a project in mind or just want to chat about design? I&apos;d
              love to hear from you. Fill in the form and I&apos;ll get back to
              you within a day.
            </p>

            {[
              {
                icon: 'mail',
                label: 'Email',
                content: (
                  <a
                    href='mailto:bimatri377@gmail.com'
                    className='text-[0.9rem] text-on-surface-muted no-underline hover:text-primary transition-colors duration-200'
                  >
                    bimatri377@gmail.com
                  </a>
                ),
              },
              {
                icon: 'location_on',
                label: 'Location',
                content: (
                  <span className='text-[0.9rem] text-on-surface-muted'>
                    Yogyakarta, Indonesia
                  </span>
                ),
              },
              {
                icon: 'schedule',
                label: 'Availability',
                content: (
                  <span className='text-[0.9rem] text-on-surface-muted'>
                    Open for Projects · WIB (UTC+7)
                  </span>
                ),
              },
            ].map(({ icon, label, content }) => (
              <div key={label} className='flex items-start gap-4'>
                <div className='w-12 h-12 bg-primary-muted rounded-[14px] flex items-center justify-center flex-shrink-0'>
                  <Icon name={icon} size={22} className='text-primary' />
                </div>
                <div className='flex flex-col'>
                  <strong className='text-[0.875rem] font-semibold text-on-surface mb-0.5'>
                    {label}
                  </strong>
                  {content}
                </div>
              </div>
            ))}

            {socialLinks.length > 0 && (
              <div>
                <p className='text-[0.875rem] font-semibold text-on-surface mb-3'>
                  Follow Me
                </p>
                <div className='flex gap-3'>
                  {socialLinks.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      title={s.name}
                      aria-label={s.name}
                      className='w-11 h-11 rounded-[12px] bg-surface-card border-[1.5px] border-outline-variant flex items-center justify-center no-underline text-on-surface-muted text-[0.8rem] font-bold transition-all duration-200 hover:bg-primary hover:border-primary hover:text-white hover:-translate-y-0.5'
                    >
                      <Icon name={s.icon} size={20} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='reveal d2'>
            {submitted ? (
              <div className='flex items-center gap-3 bg-primary-muted text-primary px-5 py-4 rounded-[12px] font-semibold text-[0.95rem]'>
                <Icon name='check_circle' size={22} />
                Message sent! I&apos;ll get back to you within 24 hours.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className='flex flex-col gap-5'
                noValidate
              >
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <div className='flex flex-col gap-1.5'>
                    <label
                      className='text-[0.85rem] font-semibold text-on-surface'
                      htmlFor='fname'
                    >
                      First Name
                    </label>
                    <input
                      id='fname'
                      name='fname'
                      type='text'
                      placeholder='Bima'
                      required
                      className='bg-surface-card border-[1.5px] border-outline-variant rounded-[12px] px-4 py-3 text-[0.95rem] font-body text-on-surface outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,106,99,0.08)] placeholder:text-outline w-full'
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <label
                      className='text-[0.85rem] font-semibold text-on-surface'
                      htmlFor='lname'
                    >
                      Last Name
                    </label>
                    <input
                      id='lname'
                      name='lname'
                      type='text'
                      placeholder='Tri Wiyono'
                      required
                      className='bg-surface-card border-[1.5px] border-outline-variant rounded-[12px] px-4 py-3 text-[0.95rem] font-body text-on-surface outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,106,99,0.08)] placeholder:text-outline w-full'
                    />
                  </div>
                </div>

                {[
                  {
                    id: 'email',
                    label: 'Email Address',
                    type: 'email',
                    placeholder: 'bimatri377@gmail.com',
                  },
                  {
                    id: 'subject',
                    label: 'Subject',
                    type: 'text',
                    placeholder: 'Project Inquiry',
                  },
                ].map((field) => (
                  <div key={field.id} className='flex flex-col gap-1.5'>
                    <label
                      className='text-[0.85rem] font-semibold text-on-surface'
                      htmlFor={field.id}
                    >
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.id === 'email'}
                      className='bg-surface-card border-[1.5px] border-outline-variant rounded-[12px] px-4 py-3 text-[0.95rem] font-body text-on-surface outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,106,99,0.08)] placeholder:text-outline w-full'
                    />
                  </div>
                ))}

                <div className='flex flex-col gap-1.5'>
                  <label
                    className='text-[0.85rem] font-semibold text-on-surface'
                    htmlFor='message'
                  >
                    Message
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    placeholder='Tell me about your project, timeline, and budget...'
                    required
                    className='bg-surface-card border-[1.5px] border-outline-variant rounded-[12px] px-4 py-3 text-[0.95rem] font-body text-on-surface outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,106,99,0.08)] placeholder:text-outline w-full min-h-[130px] resize-none'
                  />
                </div>

                {error && (
                  <div className='text-red-500 text-[0.85rem] font-medium'>
                    {error}
                  </div>
                )}

                <button
                  type='submit'
                  disabled={loading}
                  className='self-start inline-flex items-center gap-2 bg-primary text-white px-8 py-[0.85rem] rounded-full text-[0.95rem] font-semibold font-body border-none cursor-pointer transition-all duration-200 hover:bg-primary-accent hover:-translate-y-0.5 hover:shadow-primary-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none'
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  {!loading && <Icon name='send' size={18} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
