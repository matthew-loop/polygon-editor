import { MapView } from './components/Map/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { FileUpload } from './components/FileUpload';
import { ExportPanel } from './components/ExportPanel';
import { usePolygonStore } from './store/polygonStore';
import './App.css';

function App() {
  const hasUnsavedChanges = usePolygonStore((state) => state.hasUnsavedChanges);
  const clearAll = usePolygonStore((state) => state.clearAll);

  const handleClear = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to clear all polygons?')) {
        return;
      }
    }
    clearAll();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Polygon Editor</h1>
        <div className="header-controls">
          <FileUpload />
          <ExportPanel />
          <button onClick={handleClear} className="clear-btn">
            Clear All
          </button>
        </div>
        {hasUnsavedChanges && (
          <span className="unsaved-indicator">Unsaved changes</span>
        )}
      </header>
      <main className="main">
        <Sidebar />
        <div className="map-container">
          <MapView />
        </div>
      </main>
    </div>
  );
}

export default App;
