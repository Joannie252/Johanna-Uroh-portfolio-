import React, { useState, useRef } from 'react';
import { ProjectImage } from '../types';
import { uploadImageFile, generateAltTextAPI } from '../lib/api';
import {
  Upload,
  X,
  Star,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  FileImage,
  Check,
  Edit3
} from 'lucide-react';

interface ProjectImageGalleryProps {
  coverImage: string;
  onCoverImageChange: (url: string) => void;
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
  projectTitle?: string;
}

export const ProjectImageGallery: React.FC<ProjectImageGalleryProps> = ({
  coverImage,
  onCoverImageChange,
  images,
  onImagesChange,
  projectTitle = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatingAltForId, setGeneratingAltForId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

  const handleFiles = async (fileList: FileList | File[]) => {
    setErrorMsg(null);
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      if (!allowedFormats.includes(file.type)) {
        setErrorMsg('Invalid format. Allowed: JPG, PNG, WEBP, GIF, SVG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 5MB file size limit.`);
        return;
      }
    }

    try {
      setUploadProgress(10);
      const uploadedImages: ProjectImage[] = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        setUploadProgress(Math.round(((i + 0.5) / filesArray.length) * 90));
        const res = await uploadImageFile(file);

        uploadedImages.push({
          id: Math.random().toString(36).substring(2, 9),
          url: res.url,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          alt: projectTitle ? `${projectTitle} screenshot` : file.name,
          orderIndex: images.length + i,
        });
      }

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 500);

      const updated = [...images, ...uploadedImages];
      onImagesChange(updated);

      // If no cover image yet, set the first uploaded as cover
      if (!coverImage && uploadedImages.length > 0) {
        onCoverImageChange(uploadedImages[0].url);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg('Failed to upload image(s). Please try again.');
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    onImagesChange(filtered);

    // If removed was cover image, update cover
    if (coverImage === target.url) {
      onCoverImageChange(filtered[0]?.url || '');
    }
  };

  const handleSetCover = (url: string) => {
    onCoverImageChange(url);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // re-index
    const reindexed = copy.map((img, i) => ({ ...img, orderIndex: i }));
    onImagesChange(reindexed);
  };

  const handleUpdateField = (index: number, field: 'caption' | 'alt', value: string) => {
    const copy = [...images];
    copy[index] = { ...copy[index], [field]: value };
    onImagesChange(copy);
  };

  const handleGenerateAltWithAI = async (index: number) => {
    const img = images[index];
    try {
      setGeneratingAltForId(img.id || String(index));
      const context = `Project: ${projectTitle}. Caption: ${img.caption || 'UI visual'}`;
      const generatedAlt = await generateAltTextAPI(context, projectTitle);
      handleUpdateField(index, 'alt', generatedAlt);
    } catch (err) {
      console.error('AI Alt generation failed:', err);
    } finally {
      setGeneratingAltForId(null);
    }
  };

  const triggerReplace = (index: number) => {
    setReplaceTargetIndex(index);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    if (!allowedFormats.includes(file.type)) {
      setErrorMsg('Invalid format. Allowed: JPG, PNG, WEBP, GIF, SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds 5MB limit.');
      return;
    }

    try {
      const res = await uploadImageFile(file);
      const copy = [...images];
      const oldUrl = copy[replaceTargetIndex].url;
      copy[replaceTargetIndex] = {
        ...copy[replaceTargetIndex],
        url: res.url,
      };
      onImagesChange(copy);

      if (coverImage === oldUrl) {
        onCoverImageChange(res.url);
      }
    } catch (err) {
      alert('Failed to replace image');
    } finally {
      setReplaceTargetIndex(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden replace input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          dragActive
            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
            : 'border-zinc-300 dark:border-zinc-700/80 hover:border-purple-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">
              Click to upload or drag &amp; drop project screenshots
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              JPG, PNG, WebP, GIF, SVG up to 5MB each. Multi-image selection supported.
            </p>
          </div>
        </div>

        {uploadProgress !== null && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-[10px] font-semibold text-purple-600 mb-1">
              <span>Uploading images...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploaded Images List & Management */}
      {images.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Project Media ({images.length} item{images.length > 1 ? 's' : ''})
            </span>
            <span>Cover image will display on portfolio cards</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {images.map((img, index) => {
              const isCover = coverImage === img.url;
              const isAiGenerating = generatingAltForId === (img.id || String(index));

              return (
                <div
                  key={img.id || index}
                  className={`p-3.5 rounded-2xl border bg-white dark:bg-[#12141a] transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                    isCover
                      ? 'border-purple-500/80 ring-1 ring-purple-500/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {/* Thumbnail + Cover Indicator */}
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={img.url}
                      alt={img.alt || 'Thumbnail'}
                      className="w-full h-full object-cover"
                    />
                    {isCover && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold text-[9px] flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>COVER</span>
                      </div>
                    )}
                  </div>

                  {/* Fields: Caption & Alt */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 block mb-1">
                        Caption / Label
                      </span>
                      <input
                        type="text"
                        value={img.caption || ''}
                        onChange={(e) => handleUpdateField(index, 'caption', e.target.value)}
                        placeholder="e.g., Workflow dashboard view"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-zinc-400">
                          Accessible Alt Text
                        </span>
                        <button
                          type="button"
                          onClick={() => handleGenerateAltWithAI(index)}
                          disabled={isAiGenerating}
                          className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-medium"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{isAiGenerating ? 'AI Generating...' : 'AI Generate'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={img.alt || ''}
                        onChange={(e) => handleUpdateField(index, 'alt', e.target.value)}
                        placeholder="Screen reader description"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Actions: Set Cover, Reorder, Replace, Delete */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.url)}
                        className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                        title="Set as Primary Cover Image"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set Cover</span>
                      </button>
                    )}

                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Replace */}
                    <button
                      type="button"
                      onClick={() => triggerReplace(index)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      title="Replace Image"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Delete Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
