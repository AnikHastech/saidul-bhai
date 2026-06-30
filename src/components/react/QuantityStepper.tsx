// Reusable −/+ quantity control. Used in the cart drawer and PDP.
import { Minus, Plus } from 'lucide-react';
import { cn } from '~/lib/utils';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  ariaLabel = 'Quantity',
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const iconSize = size === 'sm' ? 15 : 17;

  return (
    <div
      className={cn('qty', size === 'sm' && 'qty--sm', disabled && 'is-disabled')}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="qty__btn qty__btn--l"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} strokeWidth={1.8} />
      </button>
      <span className="qty__val" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="qty__btn qty__btn--r"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} strokeWidth={1.8} />
      </button>
    </div>
  );
}
