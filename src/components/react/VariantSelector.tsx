// ============================================================
//  VariantSelector — the PDP buy box. Option selection, quantity,
//  Add to cart (news/primary) and Buy now (signal/express). One
//  island so option + qty state stays consistent.
// ============================================================
import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { ProductOption, ProductVariant } from '~/lib/shopify/types';
import { formatMoney, isOnSale, discountPercent } from '~/lib/utils';
import { addItem, buyNow } from '~/stores/cart';
import QuantityStepper from './QuantityStepper';
import Spinner from './Spinner';

interface Props {
  options: ProductOption[];
  variants: ProductVariant[];
  currencyCode: string;
}

const isDefaultOnly = (options: ProductOption[]) =>
  options.length === 1 &&
  options[0].name === 'Title' &&
  options[0].optionValues.every((v) => v.name === 'Default Title');

function findVariant(variants: ProductVariant[], selected: Record<string, string>) {
  return variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value));
}

export default function VariantSelector({ options, variants, currencyCode }: Props) {
  const singleVariant = isDefaultOnly(options) || options.length === 0;

  const initial = useMemo(() => {
    const base = variants.find((v) => v.availableForSale) ?? variants[0];
    const map: Record<string, string> = {};
    base?.selectedOptions.forEach((o) => (map[o.name] = o.value));
    return map;
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(initial);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  // No fallback to variants[0]: an unmatched combo must read as
  // unavailable, never silently add a different variant/price.
  const variant = findVariant(variants, selected);
  const available = variant?.availableForSale ?? false;
  const onSale = isOnSale(variant?.price, variant?.compareAtPrice);
  const off = discountPercent(variant?.price, variant?.compareAtPrice);

  const valueAvailable = (optionName: string, value: string) =>
    variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.some((o) => o.name === optionName && o.value === value),
    );

  const pick = (name: string, value: string) => setSelected((prev) => ({ ...prev, [name]: value }));

  const handleAdd = async () => {
    if (!variant || !available) return;
    setAdding(true);
    await addItem(variant.id, quantity);
    setAdding(false);
  };

  const handleBuy = async () => {
    if (!variant || !available) return;
    setBuying(true);
    await buyNow(variant.id, quantity);
    setBuying(false);
  };

  return (
    <>
      {/* Price */}
      <div className="buybox__price-row">
        <span className={cn('buybox__price', onSale && 'is-sale')}>
          {variant ? formatMoney(variant.price.amount, currencyCode) : '—'}
        </span>
        {onSale && variant?.compareAtPrice && (
          <>
            <span className="buybox__price-old">
              {formatMoney(variant.compareAtPrice.amount, currencyCode)}
            </span>
            {off != null && <span className="buybox__save">−{off}%</span>}
          </>
        )}
      </div>

      <div className="buybox__group">
        {/* Options */}
        {!singleVariant &&
          options.map((option) => (
            <fieldset key={option.id} className="opt">
              <legend className="opt__head">
                <span className="eyebrow opt__name">{option.name}</span>
                <span className="opt__chosen">{selected[option.name]}</span>
              </legend>
              <div className="opt__values">
                {option.optionValues.map((ov) => {
                  const active = selected[option.name] === ov.name;
                  const possible = valueAvailable(option.name, ov.name);
                  return (
                    <button
                      key={ov.id}
                      type="button"
                      onClick={() => pick(option.name, ov.name)}
                      aria-pressed={active}
                      aria-label={!possible && !active ? `${ov.name} (unavailable)` : ov.name}
                      className={cn('opt__btn', active && 'is-active', !possible && !active && 'is-out')}
                    >
                      {active && <Check size={15} strokeWidth={2} />}
                      {ov.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

        {/* Quantity */}
        <div className="buybox__qty">
          <span className="eyebrow buybox__qty-label">Quantity</span>
          <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={20} />
        </div>

        {/* Actions */}
        <div className="buybox__actions">
          <button type="button" onClick={handleAdd} disabled={!available || adding || buying} className="btn-add">
            {adding ? <Spinner size={20} /> : available ? 'Add to cart' : 'Sold out'}
          </button>
          <button type="button" onClick={handleBuy} disabled={!available || adding || buying} className="btn-buy">
            {buying ? <Spinner size={20} /> : 'Buy it now'}
          </button>
        </div>

        <p className="buybox__stock">
          <span className={cn('buybox__dot', available && 'is-in')} />
          {available ? 'In stock — ships within 48 hours' : 'Currently out of stock'}
        </p>
      </div>
    </>
  );
}
