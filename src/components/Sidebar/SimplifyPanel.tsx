import { useEffect, useMemo, useState } from 'react';
import { usePolygonStore } from '../../store/polygonStore';
import { simplifyPolygonGeometry, countPoints } from '../../utils/simplify';

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
  const setSimplifyPreview = usePolygonStore((state) => state.setSimplifyPreview);

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

  // Push simplified geometry to store for map preview overlay
  useEffect(() => {
    if (selectedFeature && simplified && simplifiedCount < originalCount) {
      setSimplifyPreview(selectedFeature.id, simplified);
    } else if (selectedFeature) {
      setSimplifyPreview(selectedFeature.id, null);
    }
    return () => {
      // Clear preview on unmount
      if (selectedFeature) {
        // Use getState to avoid stale closure
        usePolygonStore.getState().setSimplifyPreview(selectedFeature.id, null);
      }
    };
  }, [selectedFeature, simplified, simplifiedCount, originalCount, setSimplifyPreview]);

  if (!selectedFeature) return null;

  const handleApply = () => {
    if (!simplified || simplifiedCount >= originalCount) return;
    setSimplifyPreview(selectedFeature.id, null);
    updateFeature(selectedFeature.id, { geometry: simplified });
  };

  const canApply = simplifiedCount < originalCount;

  return (
    <>
      <div className="h-px bg-divider mx-5 shrink-0" />
      <div className="px-5 pt-3 pb-4 flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-text-tertiary font-display">
            Simplify
          </span>
          <div className="flex items-center gap-1.5 text-[0.75rem] text-text-secondary tabular-nums">
            <span>{originalCount}</span>
            <svg className="w-3 h-3 text-text-tertiary" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2.5 6H9.5M7 3.5L9.5 6L7 8.5" />
            </svg>
            <span className={canApply ? 'text-accent font-semibold' : ''}>
              {simplifiedCount}
            </span>
            <span className="text-text-tertiary text-[0.6875rem]">pts</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="simplify-slider w-full"
        />
        <button
          className="glossy-btn-secondary px-4 py-[7px] bg-accent-dim text-accent border border-accent/20 rounded-xl cursor-pointer text-[0.8125rem] font-medium font-body transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={handleApply}
          disabled={!canApply}
        >
          Apply simplification
        </button>
      </div>
    </>
  );
}
