import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faTags } from '@fortawesome/free-solid-svg-icons';
import { usePolygonStore } from '../../store/polygonStore';

export function LabelToggleControl() {
  const showLabels = usePolygonStore((s) => s.showLabels);
  const toggleLabels = usePolygonStore((s) => s.toggleLabels);

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: 'none' }}>
      <div className="leaflet-control" style={{ pointerEvents: 'auto' }}>
        <button
          onClick={toggleLabels}
          title={showLabels ? 'Hide polygon labels' : 'Show polygon labels'}
          className={`label-toggle-btn${showLabels ? ' label-toggle-active' : ''}`}
        >
          <FontAwesomeIcon icon={showLabels ? faTags : faTag} className="label-toggle-icon" />
          <span className="label-toggle-text">
            {showLabels ? 'Hide labels' : 'Show labels'}
          </span>
        </button>
      </div>
    </div>
  );
}
