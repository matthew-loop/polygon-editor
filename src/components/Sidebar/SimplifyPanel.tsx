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
    <>
      <div className="h-px bg-divider mx-5 my-1 shrink-0" />
      <div className="px-5 pt-3 pb-4 flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[0.6875rem] font-semibold tracking-widest uppercase text-text-secondary">Simplify</span>
        </div>
        <div className="flex items-center gap-2 text-[0.8125rem] text-text-secondary tabular-nums">
          <span>{originalCount} pts</span>
          <span className="text-text-tertiary text-xs">&rarr;</span>
          <span className={canApply ? 'text-accent font-semibold' : ''}>
            {simplifiedCount} pts
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <label className="text-[0.6875rem] font-medium text-text-tertiary shrink-0 uppercase tracking-wide">Tolerance</label>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="simplify-slider flex-1"
          />
        </div>
        <button
          className="px-4 py-[7px] bg-accent-dim text-accent border border-[rgba(8,145,178,0.2)] rounded-sm cursor-pointer text-[0.8125rem] font-medium font-body transition-all duration-200 hover:not-disabled:bg-[rgba(8,145,178,0.18)] hover:not-disabled:border-[rgba(8,145,178,0.35)] active:not-disabled:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed"
          onClick={handleApply}
          disabled={!canApply}
        >
          Apply
        </button>
      </div>
    </>
  );
}
