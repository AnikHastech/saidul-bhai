// Menu trigger island — opens the MobileMenu / departments drawer.
// Two looks: the yellow "Shop by Department" bar and a compact
// hamburger for small screens.
import { useStore } from '@nanostores/react';
import { Menu } from 'lucide-react';
import { openMenu, $drawer } from '~/stores/drawers';

interface Props {
  variant?: 'allcats' | 'hamburger';
  label?: string;
}

export default function MenuButton({ variant = 'allcats', label = 'Shop by Department' }: Props) {
  const expanded = useStore($drawer) === 'menu';

  if (variant === 'hamburger') {
    return (
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={expanded}
        className="hamburger"
      >
        <Menu size={24} strokeWidth={2} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openMenu}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className="allcats"
    >
      <Menu size={16} strokeWidth={2.4} />
      {label}
    </button>
  );
}
