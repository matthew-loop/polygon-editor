import { useMemo, useState } from 'react';
import { usePolygonStore } from '../../store/polygonStore';
import { simplifyPolygonGeometry, countPoints } from '../../utils/simplify';

// Slider 0–100 maps to ~0.00001–0.003 degrees (≈1m–300m)
const EPSILON_MIN = 1e-5;
const EPSILON_MAX = 3e-3;

function sliderToEpsilon(value: number): number {
  const t = value / 100;
  return EPSILON_MIN * Math.pow(EPSILON_MAX / EPSILON_MIN, t);
}

export function SimplifyPanel() {
  const features = usePolygonStore((state) => state.features);
  const selectedFeatureId = usePolygonStore((state) => state.selectedFeatureId);
  const updateFeature = usePolygonStore((state) => state.updateFeature);

  const [sliderValue, setSliderValue] = useState(30);

  const selectedFeature = features.find((f) => f.id === selectedFeatureId);

  const originalCount = useMemo(
    () => (selectedFeature ? countPoints(selectedFeature.geometry) : 0),
    [selectedFeature]
  );

  const epsilon = sliderToEpsilon(sliderValue);

  const { simplified, simplifiedCount } = useMemo(() => {
    if (!selectedFeature) return { simplified: null, simplifiedCount: 0 };
    const result = simplifyPolygonGeometry(selectedFeature.geometry, epsilon);
    return { simplified: result, simplifiedCount: countPoints(result) };
  }, [selectedFeature, epsilon]);

  if (!selectedFeature) return null;

  const handleApply = () => {
    if (!simplified || simplifiedCount >= originalCount) return;
    updateFeature(selectedFeature.id, { geometry: simplified });
  };

  const canApply = simplifiedCount < originalCount;

  return (
    <div className="simplify-panel">
      <div className="simplify-header">Simplify</div>
      <div className="simplify-stats">
        <span>{originalCount} pts</span>
        <span className="simplify-arrow">&rarr;</span>
        <span className={canApply ? 'simplify-reduced' : ''}>{simplifiedCount} pts</span>
      </div>
      <div className="simplify-slider-row">
        <label>Tolerance</label>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
        />
      </div>
      <button
        className="simplify-apply-btn"
        onClick={handleApply}
        disabled={!canApply}
      >
        Apply
      </button>
    </div>
  );
}
