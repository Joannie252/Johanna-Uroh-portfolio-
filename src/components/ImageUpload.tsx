import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImageFile } from '../lib/api';

interface ImageUploadProps {
  label: string;
  currentUrl?: string;
  onImageUploaded: (url: string, alt?: string) => void;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentUrl,
  onImageUploaded,
  helperText = 'Upload JPEG, PNG, WebP or SVG up to 10MB',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string>(currentUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file exceeds the 10MB limit.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadImageFile(file, altText);
      setPreview(res.url);
      onImageUploaded(res.url, altText);
    } catch (err: any) {
      console.error('Upload failed:', err);
      // Fallback to local base64 preview if needed
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onImageUploaded(dataUrl, altText);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    onImageUploaded('', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200">
        {label}
      </label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 aspect-[16/9] max-h-64 group">
          <img
            src={preview}
            alt={altText || 'Uploaded preview'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-zinc-900 text-xs font-semibold hover:bg-white transition-colors"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Upload className="w-6 h-6" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {isUploading ? 'Uploading Image...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {helperText}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
