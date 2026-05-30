"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Icon from "@/components/Icon";
import AnimatedLetters from "./AnimatedLetters";

interface Props {
  name: string;
  expertise: string;
  tagline: string;
  description: string;
  photo: string | null;
  cvUrl: string | null;
  experience: number;
}

export default function HeroContent({ name, expertise, tagline, description, photo, cvUrl, experience }: Props) {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center pt-[72px] relative overflow-hidden"
    >
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 blur-[80px] -top-[100px] -right-[100px] pointer-events-none z-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-primary-light/20 blur-[80px] bottom-[50px] -left-[80px] pointer-events-none z-0" />

      <div className="max-w-[1160px] mx-auto px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10 py-16">
          <div className="order-2 md:order-1">
            <div className="reveal d1 inline-flex items-center gap-2 bg-primary-muted text-primary text-[0.8rem] font-semibold tracking-widest px-4 py-[0.45rem] rounded-full mb-6 uppercase">
              <Icon name="verified" size={16} />
              {expertise}
            </div>

            <h1 className="reveal d2 font-display font-extrabold text-on-surface tracking-tight mb-5"
              style={{ fontSize: "clamp(2.8rem, 5vw, 4.2rem)", lineHeight: 1.1 }}
            >
              Hey, I&apos;m<br />
              <span className="text-primary">
                <AnimatedLetters text={name} />
              </span>
              <span
                className="block text-outline font-normal font-body italic mt-2"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", letterSpacing: 0 }}
              >
                <AnimatedLetters text={tagline} delay={0.5} stagger={0.02} />
              </span>
            </h1>

            <p className="reveal d3 text-[1.1rem] text-on-surface-muted max-w-[460px] mb-10 leading-[1.7]">
              {description}
            </p>

            <div className="reveal d4 flex flex-wrap gap-4 mb-12">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-[0.85rem] rounded-full text-[0.95rem] font-semibold no-underline transition-all duration-200 hover:bg-primary-accent hover:-translate-y-0.5 hover:shadow-primary-glow"
              >
                View My Work
                <Icon name="arrow_forward" size={18} />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center bg-transparent text-on-surface px-8 py-[0.85rem] rounded-full text-[0.95rem] font-semibold no-underline border-[1.5px] border-outline-variant transition-all duration-200 hover:border-primary hover:text-primary"
              >
                Get In Touch
              </a>
            </div>
          </div>

          <div className="reveal d3 flex justify-center">
            <div className="relative w-[420px] h-[500px] max-w-full">
              <motion.div
                className="absolute inset-0 rounded-[40px] bg-primary-muted"
                animate={{ rotate: [3, 2, 3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative w-full h-full rounded-[36px] overflow-hidden shadow-hero group"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {photo ? (
                  <Image
                    src={photo}
                    alt={`${name} — UI/UX Designer`}
                    fill
                    className="object-cover grayscale-[15%] transition-all duration-500 group-hover:grayscale-0"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-primary-muted flex items-center justify-center">
                    <Icon name="person" size={80} className="text-primary/40" />
                  </div>
                )}
              </motion.div>

              <div className="absolute top-3 left-3 bg-primary text-white rounded-[12px] px-4 py-2.5 shadow-badge z-10 flex items-center gap-2">
                <span className="text-[1.2rem] font-extrabold leading-none">{experience}+</span>
                <span className="text-[0.7rem] font-semibold leading-tight">Years of<br />Experience</span>
              </div>

              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-surface-card rounded-[12px] px-4 py-2.5 shadow-badge flex items-center gap-2 z-10 border border-outline-variant no-underline transition-all duration-200 hover:bg-primary hover:border-primary hover:text-white group"
                >
                  <Icon name="download" size={16} className="text-primary group-hover:text-white transition-colors" />
                  <span className="text-[0.8rem] font-semibold text-on-surface group-hover:text-white transition-colors">Get CV</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
