import { usePolygonStore } from '../../store/polygonStore';
import { PolygonListItem } from './PolygonListItem';
import { SimplifyPanel } from './SimplifyPanel';

export function Sidebar() {
  const features = usePolygonStore((state) => state.features);
  const selectedFeatureId = usePolygonStore((state) => state.selectedFeatureId);
  const selectFeature = usePolygonStore((state) => state.selectFeature);
  const deleteFeature = usePolygonStore((state) => state.deleteFeature);
  const updateFeature = usePolygonStore((state) => state.updateFeature);

  const handleNameChange = (id: string, newName: string) => {
    updateFeature(id, {
      name: newName,
      properties: {
        ...features.find((f) => f.id === id)!.properties,
        name: newName,
      },
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Polygons</h2>
        <span className="count">{features.length}</span>
      </div>
      <div className="polygon-list">
        {features.length === 0 ? (
          <div className="empty-state">
            Upload a KML file to see polygons here
          </div>
        ) : (
          features.map((feature) => (
            <PolygonListItem
              key={feature.id}
              feature={feature}
              isSelected={feature.id === selectedFeatureId}
              onSelect={() => selectFeature(feature.id)}
              onDelete={() => deleteFeature(feature.id)}
              onNameChange={(newName) => handleNameChange(feature.id, newName)}
            />
          ))
        )}
      </div>
      <SimplifyPanel />
    </div>
  );
}
