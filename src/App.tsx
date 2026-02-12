import { MapView } from './components/Map/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MapContextMenu } from './components/Map/MapContextMenu';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
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
