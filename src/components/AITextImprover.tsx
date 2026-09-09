import React, { useState } from 'react';
import { improveTextAPI } from '../lib/api';
import { Sparkles, Check, Loader2, ChevronDown } from 'lucide-react';

interface AITextImproverProps {
  currentText: string;
  onImproved: (newText: string) => void;
  label?: string;
}

export const AITextImprover: React.FC<AITextImproverProps> = ({
  currentText,
  onImproved,
  label = 'Improve with AI',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeInstruction, setActiveInstruction] = useState<string | null>(null);

  const toneOptions = [
    { label: 'Professional tone', instruction: 'Rewrite this with a polished, executive, professional tone suitable for a high-value portfolio' },
    { label: 'More concise', instruction: 'Make this concise, punchy, and impactful while preserving core facts' },
    { label: 'More engaging', instruction: 'Make this more engaging, compelling, and client-focused' },
    { label: 'Fix grammar & clarity', instruction: 'Fix all grammar, improve syntactic flow, and enhance clarity' },
    { label: 'Technical focus', instruction: 'Emphasize architectural depth, tooling precision, and systems workflow' },
  ];

  const handleImprove = async (instruction: string) => {
    if (!currentText.trim()) {
      alert('Please enter some text in the field first before improving.');
      return;
    }

    try {
      setIsLoading(true);
      setActiveInstruction(instruction);
      const improved = await improveTextAPI(currentText, instruction);
      onImproved(improved);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'AI Improvement failed');
    } finally {
      setIsLoading(false);
      setActiveInstruction(null);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-[11px] font-semibold transition-colors disabled:opacity-50 shadow-xs"
        title="Improve text with Gemini AI"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
        ) : (
          <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        )}
        <span>{isLoading ? 'Improving...' : label}</span>
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white dark:bg-[#15171e] border border-zinc-200 dark:border-zinc-800 shadow-xl z-30 py-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-zinc-400">
              Select Tone / Style
            </div>
            <div className="py-1">
              {toneOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleImprove(opt.instruction)}
                  className="w-full px-3 py-1.5 text-left text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 flex items-center justify-between transition-colors"
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
