import { MapView } from './components/Map/MapView';
import { Sidebar } from './components/Sidebar/Sidebar';
import './App.css';

function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>
      <Sidebar />
    </div>
  );
}

export default App;
