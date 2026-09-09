import React, { useState } from 'react';
import { generateProjectWithAI } from '../lib/api';
import { Sparkles, X, Check, Loader2, RefreshCw, Wand2, Lightbulb } from 'lucide-react';

interface AIProjectGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialCategory?: string;
  onApply: (data: {
    shortDescription: string;
    description: string;
    challenge: string;
    solution: string;
    keyFeatures?: string[];
    suggestedTools?: string[];
    seoMetaDescription?: string;
  }) => void;
}

export const AIProjectGeneratorModal: React.FC<AIProjectGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialTitle = '',
  initialCategory = 'AI',
  onApply,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [toolsInput, setToolsInput] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    shortDescription: string;
    description: string;
    challenge: string;
    solution: string;
    keyFeatures?: string[];
    suggestedTools?: string[];
    seoMetaDescription?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert('Please provide a project name or concept first.');
      return;
    }

    try {
      setLoading(true);
      const toolsList = toolsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await generateProjectWithAI({
        title: title.trim(),
        category,
        tools: toolsList,
        notes: notes.trim(),
      });

      setGeneratedData(result);
    } catch (err: any) {
      alert(err.message || 'AI Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedData) {
      onApply(generatedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Generate Project Content with AI
              </h2>
              <p className="text-xs text-zinc-400">
                Powered by Gemini. Structured specifically for your portfolio case studies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {!generatedData ? (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  Project Title / Concept
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI-Powered Executive Assistant Workflow System"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="AI">AI &amp; Automation</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Virtual Assistance">Virtual Assistance</option>
                    <option value="Financial Education">Financial Education</option>
                    <option value="Content">Content &amp; Writing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Key Tools (Optional, comma separated)
                  </label>
                  <input
                    type="text"
                    value={toolsInput}
                    onChange={(e) => setToolsInput(e.target.value)}
                    placeholder="e.g. Notion, Gemini, Zapier, Google Sheets"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  Rough Notes or Highlights (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Built for an executive client to automate daily email triaging and calendar conflict resolution. Reduced manual scheduling by 60%."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  Gemini will generate a concise summary, case study challenge &amp; solution, bulleted features, and SEO meta tags based on your inputs.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-white text-sm">
                  Generated Draft for &ldquo;{title}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setGeneratedData(null)}
                  className="text-purple-600 dark:text-purple-400 hover:underline text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate with different notes</span>
                </button>
              </div>

              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Short Description
                </span>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {generatedData.shortDescription}
                </div>
              </div>

              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Full Description
                </span>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {generatedData.description}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    The Challenge
                  </span>
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {generatedData.challenge}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    The Engineered Solution
                  </span>
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {generatedData.solution}
                  </div>
                </div>
              </div>

              {generatedData.suggestedTools && generatedData.suggestedTools.length > 0 && (
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Suggested Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedData.suggestedTools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          {!generatedData ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !title.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting Project with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Project Editor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
