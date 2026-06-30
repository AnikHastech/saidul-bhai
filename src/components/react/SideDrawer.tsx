// ============================================================
//  SideDrawer — presentational slide-over shell shared by the
//  account + wishlist + mobile-menu drawers. Owns overlay, focus
//  trap, Esc and body-scroll lock. Side-agnostic (right default).
// ============================================================
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useFocusTrap } from './useFocusTrap';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function SideDrawer({
  open,
  onClose,
  title,
  side = 'right',
  children,
  footer,
}: Props) {
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div className={cn('drawer', open && 'is-open')} aria-hidden={!open} inert={!open}>
      <div className="drawer__overlay" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('drawer__panel', side === 'left' ? 'drawer__panel--left' : 'drawer__panel--right')}
      >
        <header className="drawer__head">
          <h2 className="drawer__title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="drawer__close"
            aria-label={`Close ${title}`}
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </header>

        <div className="drawer__body">{children}</div>

        {footer && <footer className="drawer__foot">{footer}</footer>}
      </div>
    </div>
  );
}
