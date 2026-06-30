// ============================================================
//  Quick View Modal — client:load island
//  Listens for `quickview:open` custom events dispatched by
//  product cards, fetches full product data from
//  /api/products/[handle], and renders a buy-flow modal.
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { addItem, initCart } from '~/stores/cart';
import { $wishlist, wishlist } from '~/stores/wishlist';
import { useFocusTrap } from './useFocusTrap';
import type { Product, ProductOption } from '~/lib/shopify/types';
import type { ProductSummary } from '~/stores/types';

const fmt = (amount: string, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));

export default function QuickViewModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedOpts, setSelectedOpts] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const wishItems = useStore($wishlist);
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  // Stack image-over-content below 767px (inline styles can't use media queries).
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Ensure cart + wishlist are hydrated
  useEffect(() => { initCart(); wishlist.init(); }, []);

  // Listen for open events from any card on the page
  useEffect(() => {
    const handler = (e: Event) => {
      const { handle } = (e as CustomEvent<{ handle: string }>).detail;
      setOpen(true);
      setProduct(null);
      setAdded(false);
      setQty(1);
      setLoading(true);
      fetch(`/api/products/${handle}`)
        .then(r => r.ok ? r.json() : null)
        .then((p: Product | null) => {
          if (!p) return;
          setProduct(p);
          const defaults: Record<string, string> = {};
          p.options?.forEach(opt => {
            if (opt.optionValues?.[0]) defaults[opt.name] = opt.optionValues[0].name;
          });
          setSelectedOpts(defaults);
        })
        .finally(() => setLoading(false));
    };
    window.addEventListener('quickview:open', handler);
    return () => window.removeEventListener('quickview:open', handler);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const selectedVariant = product?.variants.find(v =>
    v.selectedOptions.every(o => selectedOpts[o.name] === o.value)
  ) ?? product?.variants[0] ?? null;

  const price = selectedVariant?.price ?? product?.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice ?? null;
  const displayImage = selectedVariant?.image ?? product?.featuredImage ?? null;
  const savePercent = price && compareAt && Number(compareAt.amount) > Number(price.amount)
    ? Math.round((1 - Number(price.amount) / Number(compareAt.amount)) * 100)
    : null;

  const handleAdd = useCallback(async () => {
    if (!selectedVariant) return;
    setAdding(true);
    await addItem(selectedVariant.id, qty, { open: true });
    setAdded(true);
    setAdding(false);
    setTimeout(() => { setAdded(false); setOpen(false); }, 1200);
  }, [selectedVariant, qty]);

  if (!open) return null;

  const colorOptions: ProductOption | undefined = product?.options.find(o =>
    o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour'
  );
  const otherOptions: ProductOption[] = product?.options.filter(o =>
    o.name.toLowerCase() !== 'color' && o.name.toLowerCase() !== 'colour'
  ) ?? [];

  const saved = product ? wishItems.some(i => i.id === product.id) : false;
  const wishSummary: ProductSummary | null = product
    ? {
        id: product.id,
        handle: product.handle,
        title: product.title,
        image: displayImage?.url ?? product.featuredImage?.url ?? null,
        price: price?.amount ?? null,
        currency: price?.currencyCode ?? null,
        compareAt: compareAt?.amount ?? null,
      }
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
        aria-modal="true"
        role="dialog"
        aria-label={product ? `Quick view: ${product.title}` : 'Quick view'}
      >
        <div
          ref={dialogRef}
          style={{
            background: '#fff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '920px',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
            position: 'relative',
            boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: '1.5px solid #e0e0e0',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* LEFT — image (top when stacked) */}
          <div style={{
            background: '#f4f4f4',
            borderRadius: isNarrow ? '14px 14px 0 0' : '14px 0 0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isNarrow ? '240px' : '420px',
          }}>
            {loading
              ? <div style={{ color: '#aaa', fontSize: '13px' }}>Loading…</div>
              : displayImage
                ? <img
                    src={displayImage.url}
                    alt={displayImage.altText ?? product?.title}
                    style={{ width: '100%', objectFit: 'contain', maxHeight: '500px', padding: '32px' }}
                  />
                : <div style={{ color: '#ccc', fontSize: '13px' }}>No image</div>
            }
          </div>

          {/* RIGHT — details (below image when stacked) */}
          <div style={{ padding: isNarrow ? '28px 22px 28px' : '44px 36px 36px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
            {loading && (
              <div style={{ color: '#aaa', fontSize: '13px' }}>Loading product…</div>
            )}

            {product && (
              <>
                {/* Vendor */}
                {product.vendor && (
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#0055cc',
                  }}>
                    {product.vendor}
                  </span>
                )}

                {/* Title */}
                <h2 style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '21px', fontWeight: 800,
                  lineHeight: 1.1, textTransform: 'uppercase',
                  color: '#050505', margin: 0,
                }}>
                  {product.title}
                </h2>

                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#f5c218', fontSize: '17px', letterSpacing: '1px' }}>★★★★★</span>
                  <span style={{ fontWeight: 600, color: '#050505' }}>4.9</span>
                  <span style={{ color: '#888' }}>(2,847 reviews)</span>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {price && (
                    <span style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '30px', fontWeight: 800, color: '#e8192c',
                    }}>
                      {fmt(price.amount, price.currencyCode)}
                    </span>
                  )}
                  {compareAt && (
                    <span style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through' }}>
                      {fmt(compareAt.amount, compareAt.currencyCode)}
                    </span>
                  )}
                  {savePercent && savePercent > 0 && (
                    <span style={{
                      background: '#e8192c', color: '#fff',
                      fontSize: '11px', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '6px',
                      letterSpacing: '0.04em',
                    }}>
                      SAVE {savePercent}%
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.65, margin: 0 }}>
                    {product.description.slice(0, 220)}{product.description.length > 220 ? '…' : ''}
                  </p>
                )}

                {/* Tags as feature bullets */}
                {product.tags && product.tags.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {product.tags.slice(0, 4).map(tag => (
                      <li key={tag} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#333' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f5c218', flexShrink: 0 }} />
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                <div style={{ borderTop: '1px dashed #e0e0e0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Color swatches */}
                  {colorOptions && colorOptions.optionValues.length > 1 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>
                        COLOR
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {colorOptions.optionValues.map(val => {
                          const active = selectedOpts[colorOptions.name] === val.name;
                          return (
                            <button
                              key={val.id}
                              type="button"
                              title={val.name}
                              aria-label={val.name}
                              aria-pressed={active}
                              onClick={() => setSelectedOpts(p => ({ ...p, [colorOptions.name]: val.name }))}
                              style={{
                                width: '28px', height: '28px',
                                borderRadius: '50%',
                                background: val.name.toLowerCase(),
                                border: active ? '2px solid #050505' : '2px solid transparent',
                                boxShadow: active
                                  ? '0 0 0 2px #fff, 0 0 0 4px #050505'
                                  : '0 0 0 1.5px #d0d0d0',
                                cursor: 'pointer', padding: 0,
                                transition: 'box-shadow 150ms',
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Other option pills */}
                  {otherOptions.filter(o => o.optionValues.length > 1).map(opt => (
                    <div key={opt.id}>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>
                        {opt.name}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {opt.optionValues.map(val => {
                          const active = selectedOpts[opt.name] === val.name;
                          return (
                            <button
                              key={val.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setSelectedOpts(p => ({ ...p, [opt.name]: val.name }))}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '13px', fontWeight: 600,
                                border: active ? '2px solid #050505' : '2px solid #e0e0e0',
                                background: active ? '#050505' : '#fff',
                                color: active ? '#fff' : '#333',
                                cursor: 'pointer',
                                transition: 'all 150ms',
                              }}
                            >
                              {val.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* QTY */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>QTY</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        style={{ width: '38px', height: '38px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#333', lineHeight: 1 }}
                      >−</button>
                      <span aria-live="polite" style={{ width: '38px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#050505' }}>{qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(q => Math.min(99, q + 1))}
                        style={{ width: '38px', height: '38px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#333', lineHeight: 1 }}
                      >+</button>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleAdd}
                      disabled={adding || !selectedVariant?.availableForSale}
                      style={{
                        flex: 1, padding: '14px 20px',
                        background: added ? '#16a34a' : '#e8192c',
                        color: '#fff', border: 'none',
                        borderRadius: '10px',
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 700, fontSize: '14px',
                        letterSpacing: '0.03em',
                        cursor: adding ? 'wait' : 'pointer',
                        transition: 'background 200ms',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px',
                        opacity: !selectedVariant?.availableForSale ? 0.5 : 1,
                      }}
                    >
                      {!added && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3h2l2.4 12.5a2 2 0 0 0 2 1.5h9.4a2 2 0 0 0 2-1.5L23 6H6"/>
                        </svg>
                      )}
                      {added
                        ? '✓ Added to Cart!'
                        : adding
                          ? 'Adding…'
                          : !selectedVariant?.availableForSale
                            ? 'Out of Stock'
                            : `Add to Cart${price ? ' — ' + fmt(price.amount, price.currencyCode) : ''}`
                      }
                    </button>

                    {/* Wishlist toggle */}
                    <button
                      type="button"
                      aria-pressed={saved}
                      aria-label={saved ? 'Saved to wishlist' : 'Save to wishlist'}
                      title={saved ? 'Saved to wishlist' : 'Save to wishlist'}
                      onClick={() => wishSummary && wishlist.toggle(wishSummary)}
                      style={{
                        width: '50px', height: '50px',
                        border: `1.5px solid ${saved ? '#ef233c' : '#e0e0e0'}`,
                        borderRadius: '10px',
                        background: '#fff',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#ef233c' : 'none'} stroke={saved ? '#ef233c' : '#333'} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </div>

                  {/* PDP link */}
                  <a
                    href={`/products/${product.handle}`}
                    style={{ fontSize: '12px', color: '#888', textAlign: 'center', textDecoration: 'underline' }}
                  >
                    View full product details →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
