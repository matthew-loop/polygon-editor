import { useCallback, useState, useRef } from 'react';
import { parseKmlFile } from '../services/kmlParser';
import { usePolygonStore } from '../store/polygonStore';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadFeatures = usePolygonStore((state) => state.loadFeatures);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.kml')) {
        setError('Please select a KML file');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const features = await parseKmlFile(file);
        if (features.length === 0) {
          setError('No polygons found in KML file');
        } else {
          loadFeatures(features);
        }
      } catch (err) {
        console.error('Error parsing KML:', err);
        setError('Failed to parse KML file');
      } finally {
        setIsLoading(false);
      }
    },
    [loadFeatures]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClick = () => fileInputRef.current?.click();

  return (
    <div
      className={`group mx-4 mb-1 px-3.5 py-3 border-[1.5px] border-dashed rounded-[10px] cursor-pointer transition-all duration-250 ease-in-out flex items-center gap-2.5 bg-transparent shrink-0 ${
        isDragging
          ? 'border-accent bg-accent-dim !border-solid'
          : 'border-[rgba(148,163,184,0.35)] hover:border-[rgba(8,145,178,0.4)] hover:bg-[rgba(8,145,178,0.04)]'
      } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".kml"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <svg
        className={`w-5 h-5 shrink-0 transition-colors duration-250 ${
          isDragging ? 'text-accent' : 'text-text-secondary group-hover:text-accent'
        }`}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M10 14V3M10 3L6 7M10 3L14 7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 13V15C3 16.1 3.9 17 5 17H15C16.1 17 17 16.1 17 15V13"
          strokeLinecap="round"
        />
      </svg>
      <div>
        {isLoading ? (
          <span className="text-[0.8125rem] text-text-secondary">Processing...</span>
        ) : (
          <>
            <span className="text-[0.8125rem] text-text-secondary transition-colors duration-250 group-hover:text-text-primary">Upload KML</span>
            <span className="text-xs text-text-tertiary"> — drop or click</span>
          </>
        )}
        {error && <div className="text-xs text-danger mt-1">{error}</div>}
      </div>
    </div>
  );
}
