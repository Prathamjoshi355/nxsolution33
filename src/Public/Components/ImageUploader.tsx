import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../Services/api';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  aspectRatio?: string; // Optional aspect ratio display
  placeholder?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label,
  className = "",
  aspectRatio
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image helper using canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Do not compress SVGs
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Resize if too large
            const maxDimension = 1920;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(event.target?.result as string);
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress with 80% quality JPEG
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedBase64);
          } catch (e) {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    
    if (!validTypes.includes(file.type)) {
      setError('Unsupported format. Please select JPG, JPEG, PNG, WebP, or SVG.');
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum allowed size is 10 MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);
    setFileName(file.name);

    try {
      // Simulate progress up to 40% during reading and local compression
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 40) {
            clearInterval(progressInterval);
            return 40;
          }
          return prev + 5;
        });
      }, 50);

      // Perform local compression for JPG/PNG/WEBP if supported
      const base64data = await compressImage(file);
      clearInterval(progressInterval);
      setUploadProgress(50);

      // Simulate network progress from 50% to 90%
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 8;
        });
      }, 100);

      // Real network call
      const res = await apiService.uploadImage(base64data);
      clearInterval(uploadInterval);
      
      setUploadProgress(100);
      setTimeout(() => {
        onChange(res.url);
        setIsUploading(false);
        setUploadProgress(0);
      }, 150);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to upload image to Server.');
      setIsUploading(false);
      setUploadProgress(0);
      setFileName(null);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    setFileName(null);
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold tracking-wider text-slate-300 uppercase block">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
          onChange={onFileChange}
          disabled={isUploading}
        />

        {/* LOADING / UPLOADING STATE */}
        {isUploading && (
          <div className="border-2 border-dashed border-indigo-500/40 bg-slate-900/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] space-y-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <span className="absolute text-[10px] font-bold text-indigo-400">{uploadProgress}%</span>
            </div>
            <div className="text-center w-full max-w-[240px] space-y-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Uploading Image</p>
              {fileName && <p className="text-[10px] text-slate-400 truncate font-mono">{fileName}</p>}
              
              {/* Progress Bar Container */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW / COMPLETED STATE */}
        {!isUploading && value && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-xl">
            {/* Header with image name */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Existing Image Preview</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[220px] font-mono mt-0.5">{fileName || value.split('/').pop() || 'Loaded Image'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all"
                title="Remove image"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Main Preview Block */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group/preview max-h-[220px]">
              <img
                src={value}
                alt="Selected content preview"
                className="max-h-[220px] w-full object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1594818821922-80fedb32598c?w=400&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={onButtonClick}
                className="px-3.5 py-1.5 border border-slate-800 hover:border-indigo-500/40 bg-slate-950 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Replace Image
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3.5 py-1.5 border border-slate-800 hover:border-rose-500/40 bg-slate-950 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all"
              >
                <X className="w-3 h-3" />
                Remove Image
              </button>
            </div>
          </div>
        )}

        {/* DRAG AND DROP ZONE (EMPTY STATE) */}
        {!isUploading && !value && (
          <div
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
            onClick={onButtonClick}
            className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5' 
                : 'border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40'
            }`}
          >
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 shadow-inner mb-3">
              <Upload className="w-5 h-5 text-indigo-400" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">
                Drag & drop image here, or <span className="text-indigo-400 underline">browse files</span>
              </p>
              <p className="text-[10px] text-slate-500">
                Supports JPG, JPEG, PNG, WebP, SVG (Max 10 MB)
              </p>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                No image uploaded
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-semibold animate-shake">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
