import { useEffect } from 'react';
import { MapView } from './components/Map/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MapContextMenu } from './components/Map/MapContextMenu';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePolygonStore } from './store/polygonStore';
import { performUndo, performRedo } from './utils/undoRedo';
import './App.css';

function App() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when focus is in a text input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // Skip during drawing/splitting — Geoman handles its own Ctrl+Z
      const { isDrawing, splittingFeatureId } = usePolygonStore.getState();
      if (isDrawing || splittingFeatureId) return;

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        performRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative h-screen w-screen overflow-hidden bg-bg-deep">
        <div className="absolute inset-0 z-0">
          <MapView />
        </div>
        <Sidebar />
        <MapContextMenu />
      </div>
    </ErrorBoundary>
  );
}

export default App;
