import { useCallback, useState, useRef } from 'react';
import { parseKmlFile } from '../services/kmlParser';
import { usePolygonStore } from '../store/polygonStore';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFeatures = usePolygonStore((state) => state.appendFeatures);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const kmlFiles = Array.from(files).filter((f) =>
        f.name.toLowerCase().endsWith('.kml')
      );

      if (kmlFiles.length === 0) {
        setError('Please select KML file(s)');
        return;
      }

      setIsLoading(true);
      setError(null);

      let errorCount = 0;
      let totalFeatures = 0;

      for (const file of kmlFiles) {
        try {
          const features = await parseKmlFile(file);
          if (features.length > 0) {
            const groupName = file.name.replace(/\.kml$/i, '');
            appendFeatures(features, groupName);
            totalFeatures += features.length;
          }
        } catch (err) {
          console.error('Error parsing KML:', file.name, err);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        setError(`Failed to parse ${errorCount} file(s)`);
      } else if (totalFeatures === 0) {
        setError('No polygons found in KML file(s)');
      }

      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [appendFeatures]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
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
      if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleClick = () => fileInputRef.current?.click();

  return (
    <div
      className={`group px-3.5 py-3 border-[1.5px] border-dashed rounded-2xl cursor-pointer transition-all duration-250 flex items-center gap-3 bg-transparent shrink-0 ${
        isDragging
          ? 'border-accent bg-accent-dim !border-solid shadow-accent-glow'
          : 'border-text-tertiary/25 hover:border-accent/40 hover:bg-accent-dim'
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
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
          isDragging
            ? 'bg-accent/15 text-accent shadow-[0_0_12px_var(--color-accent-glow)]'
            : 'bg-bg-surface text-text-secondary group-hover:bg-accent/10 group-hover:text-accent'
        }`}
      >
        <svg
          className="w-[18px] h-[18px]"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M9 12V3M9 3L5.5 6.5M9 3L12.5 6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.5 12V14C2.5 14.83 3.17 15.5 4 15.5H14C14.83 15.5 15.5 14.83 15.5 14V12"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        {isLoading ? (
          <span className="text-[0.8125rem] text-text-secondary">Processing...</span>
        ) : (
          <>
            <div className="text-[0.8125rem] font-medium text-text-primary transition-colors duration-200">
              Upload KML
            </div>
            <div className="text-[0.6875rem] text-text-tertiary">
              Drop file(s) or click to browse
            </div>
          </>
        )}
        {error && <div className="text-[0.6875rem] text-danger mt-0.5">{error}</div>}
      </div>
    </div>
  );
}
