// ============================================================
//  DensityToggle — switches the listing grid between "comfortable"
//  and "compact" by setting [data-density] on <html>, persisted to
//  localStorage. A head script applies the saved value before paint
//  (no flash); this island just flips + persists it.
// ============================================================
import { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';

type Density = 'comfortable' | 'compact';
const KEY = 'asmaz:density';

// Inline grid glyphs (2×2 comfortable, 3×3 compact) — no icon dep.
const GridIcon = ({ n }: { n: 2 | 3 }) => {
  const cells = [];
  const gap = 2;
  const size = (20 - gap * (n - 1)) / n;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      cells.push(<rect key={`${r}-${c}`} x={2 + c * (size + gap)} y={2 + r * (size + gap)} width={size} height={size} rx="1" />);
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {cells}
    </svg>
  );
};

export default function DensityToggle() {
  const [density, setDensity] = useState<Density>('comfortable');

  useEffect(() => {
    const current = (document.documentElement.dataset.density as Density) || 'comfortable';
    setDensity(current);
  }, []);

  const apply = (next: Density) => {
    setDensity(next);
    document.documentElement.dataset.density = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="density" role="group" aria-label="Grid density">
      <button
        type="button"
        onClick={() => apply('comfortable')}
        aria-pressed={density === 'comfortable'}
        className={cn('density__btn', density === 'comfortable' && 'is-active')}
        aria-label="Comfortable grid"
        title="Comfortable"
      >
        <GridIcon n={2} />
      </button>
      <button
        type="button"
        onClick={() => apply('compact')}
        aria-pressed={density === 'compact'}
        className={cn('density__btn', density === 'compact' && 'is-active')}
        aria-label="Compact grid"
        title="Compact"
      >
        <GridIcon n={3} />
      </button>
    </div>
  );
}
