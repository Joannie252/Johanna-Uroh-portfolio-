import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { getServices } from '../lib/api';
import { Link } from '../lib/router';
import {
  Brain,
  Code2,
  FileText,
  GraduationCap,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const getServiceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkles':
        return <Brain className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case 'code':
        return <Code2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case 'file-text':
        return <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case 'graduation-cap':
        return <GraduationCap className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      case 'trending-up':
        return <TrendingUp className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
      default:
        return <Briefcase className="w-7 h-7 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Offerings &amp; Core Competencies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
            Services &amp; Solutions
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
            From executive virtual assistance to advanced AI prompting pipelines and full-stack vibe coding, explore how I partner with leaders to accelerate their outcomes.
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 animate-pulse space-y-4"
              >
                <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800/80 p-8 flex flex-col justify-between hover:border-purple-500/40 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/50 dark:border-purple-800/50 flex items-center justify-center mb-6">
                    {getServiceIcon(service.icon)}
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                    {service.description}
                  </p>

                  {service.features && service.features.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-3">
                        What&apos;s Included
                      </h4>
                      <ul className="space-y-2.5">
                        {service.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Request this service</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-zinc-50 dark:bg-[#0e1017] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              Need a custom blended solution?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-lg">
              Many engagements combine virtual assistance, AI workflows, and web development. Let&apos;s design a scope tailored to your operational goals.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold whitespace-nowrap shadow-md shadow-purple-600/20"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
};
