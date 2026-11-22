import React, { useState, useEffect } from 'react';
import { ExperienceItem } from '../types';
import { getExperience } from '../lib/api';
import { Link } from '../lib/router';
import { useSiteSettings } from '../context/SettingsContext';
import {
  Sparkles,
  Calendar,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Brain,
  Code2,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<ExperienceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const profileName = settings.profile?.name || 'Johanna Uroh';
  const profileBio = settings.profile?.bio || 'I turn ideas into useful digital solutions. Exploring the intersection of AI, technology, content, virtual assistance, and practical digital skills.';
  const profileHeadline = settings.profile?.headline || 'Digital Specialist & AI';
  const profilePicture = settings.profile?.profilePicture || '/uploads/johanna_uroh_avatar.jpg';
  const profileEmail = settings.profile?.email || 'urohjohanna25@gmail.com';

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [exp, edu] = await Promise.all([
          getExperience('experience'),
          getExperience('education'),
        ]);
        setExperience(exp);
        setEducation(edu);
      } catch (err) {
        console.error('Failed to load experience data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const skillCategories = [
    {
      title: 'AI & Workflow Automation',
      skills: ['ChatGPT & System Prompts', 'Google AI Studio & Gemini', 'Multi-Stage Prompt Chaining', 'Workflow Automation', 'Research Synthesis'],
    },
    {
      title: 'Virtual Assistance & Ops',
      skills: ['Inbox Zero & Email Triage', 'Executive Calendar Management', 'Google Workspace Suite', 'Notion Database Systems', 'Confidential Scheduling'],
    },
    {
      title: 'Vibe Coding & Web Dev',
      skills: ['React & TypeScript', 'Tailwind CSS', 'Vite & Node.js', 'Express REST APIs', 'SQLite & Data Modeling'],
    },
    {
      title: 'Content & Education',
      skills: ['Digital Skills Curriculum', 'Copywriting & Case Studies', 'Financial Literacy Concepts', 'Visual Presentation (Canva)', 'Documentation Playbooks'],
    },
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bio Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 mb-4">
            <span>Digital Specialist • AI • Virtual Assistance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
            Hi, I’m {profileName}.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
            {profileBio}
          </p>
        </div>

        {/* Story & Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          <div className="md:col-span-2 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg">
            <p>
              I work with founders, executives, and organizations looking to amplify their output through a hybrid of meticulous administrative discipline and cutting-edge technology.
            </p>
            <p>
              Rather than viewing artificial intelligence as an abstract curiosity, I treat it as an everyday operational lever: designing targeted prompts in Google AI Studio, structuring workflow pipelines, and synthesizing dense information so decision-makers can focus on strategic momentum.
            </p>
            <p>
              My background also embraces full-stack vibe coding: turning real problems into responsive, database-driven web applications with React, TypeScript, and Express.
            </p>
          </div>

          {/* Quick Info Box */}
          <div className="rounded-3xl bg-zinc-50 dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
              <img
                key={profilePicture}
                src={profilePicture}
                alt={profileName}
                className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {profileName}
                </h3>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium block">
                  {profileHeadline}
                </span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-zinc-400 block">Name</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{profileName}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Primary Roles</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {profileHeadline}
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Location &amp; Availability</span>
                <span className="font-medium text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Available for Remote Engagements
                </span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Direct Inquiries</span>
                <a
                  href={`mailto:${profileEmail}`}
                  className="link-neon font-medium text-xs break-all"
                >
                  {profileEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Matrix */}
        <div className="mb-20">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Technical Toolkit
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mt-1">
              Skills &amp; Capabilities Matrix
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {skillCategories.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800/80 p-6 shadow-sm"
              >
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
                  {cat.title}
                </h3>
                <ul className="space-y-2">
                  {cat.skills.map((skill, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Experience & Education Timelines (from DB) */}
        <div className="space-y-16">
          {/* Experience */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Experience &amp; Track Record
              </h2>
            </div>

            <div className="space-y-6 border-l-2 border-purple-500/30 pl-6 ml-4">
              {experience.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-4 border-white dark:border-[#0b0c10]" />
                  <div>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {item.period}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {item.role}
                    </h3>
                    <p className="text-sm font-medium text-zinc-500 mb-2">
                      {item.organization}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Education &amp; Professional Training
              </h2>
            </div>

            <div className="space-y-6 border-l-2 border-purple-500/30 pl-6 ml-4">
              {education.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-4 border-white dark:border-[#0b0c10]" />
                  <div>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {item.period}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {item.role}
                    </h3>
                    <p className="text-sm font-medium text-zinc-500 mb-2">
                      {item.organization}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Interested in collaborating?
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Let&apos;s discuss how I can assist with your digital workflows or projects.
            </p>
          </div>
          <Link
            to="/contact"
            className="btn-neon-primary px-6 py-3 text-sm font-semibold shadow-md inline-flex items-center gap-2"
          >
            <span>Get in touch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
