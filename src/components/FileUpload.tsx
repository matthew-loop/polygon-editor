import { useCallback, useState, useRef } from 'react';
import { parseKmlFile } from '../services/kmlParser';
import { usePolygonStore } from '../store/polygonStore';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadFeatures = usePolygonStore((state) => state.loadFeatures);

  const handleFile = useCallback(async (file: File) => {
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
  }, [loadFeatures]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`file-upload ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
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
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <span>Drop KML file here or click to upload</span>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
