import ScrollRevealProvider from './scroll-reveal-provider';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <ScrollRevealProvider>
      <Navbar />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </ScrollRevealProvider>
  );
}
