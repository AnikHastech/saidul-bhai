// ============================================================
//  CompareTray — floating bar that appears when products are in
//  the compare list. Shows thumbnails + a CTA to /compare. Mounted
//  once globally; renders nothing when the list is empty.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { X, ArrowRight } from 'lucide-react';
import { $compare, compare } from '~/stores/compare';

export default function CompareTray() {
  const items = useStore($compare);

  useEffect(() => {
    compare.init();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="compare-tray" role="region" aria-label="Compare list">
      <div className="compare-tray__items">
        {items.map((p) => (
          <div key={p.id} className="compare-tray__item">
            {p.image ? <img src={p.image} alt={p.title} /> : <span className="compare-tray__ph" />}
            <button
              type="button"
              onClick={() => compare.remove(p.id)}
              className="compare-tray__remove"
              aria-label={`Remove ${p.title} from compare`}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
      <div className="compare-tray__actions">
        <button type="button" onClick={() => compare.clear()} className="compare-tray__clear">
          Clear
        </button>
        <a href="/compare" className="compare-tray__cta">
          Compare ({items.length})
          <ArrowRight size={16} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
