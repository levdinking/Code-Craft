import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, X, Image, Film } from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';

interface MediaUploaderProps {
  onUpload: (url: string, type: 'image' | 'video') => void;
  accept?: string;
  maxSizeMB?: number;
}

export function MediaUploader({ onUpload, accept = 'image/*,video/*', maxSizeMB = 50 }: MediaUploaderProps) {
  const { upload } = useAdminApi();
  const [preview, setPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Освобождаем blob-URL при размонтировании
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Файл слишком большой (максимум ${maxSizeMB}MB)`);
      return;
    }

    const type = file.type.startsWith('video/') ? 'video' : 'image';

    // Локальное превью
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    blobUrlRef.current = localUrl;
    setPreview({ url: localUrl, type });

    // Загрузка на сервер
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await upload<{ url: string; type: string }>('/api/media/upload', formData);
      URL.revokeObjectURL(localUrl);
      blobUrlRef.current = null;
      setPreview({ url: result.url, type });
      onUpload(result.url, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [maxSizeMB, onUpload, upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, [handleFile]);

  const clearMedia = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Медиа</label>

      {preview ? (
        <div className="relative rounded-xl border border-border overflow-hidden bg-card">
          {preview.type === 'image' ? (
            <img src={preview.url} alt="Preview" className="max-h-64 w-full object-contain" />
          ) : (
            <video src={preview.url} controls className="max-h-64 w-full" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
          <button
            onClick={clearMedia}
            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Перетащите файл, вставьте из буфера или <span className="text-primary">выберите</span>
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Image className="w-3 h-3" /> JPG, PNG, WebP</span>
            <span className="flex items-center gap-1"><Film className="w-3 h-3" /> MP4, WebM</span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
