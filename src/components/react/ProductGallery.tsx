// ============================================================
//  ProductGallery — PDP image gallery with thumbnail rail.
//  Reserves aspect ratio to avoid layout shift.
// ============================================================
import { useState } from 'react';
import { cn } from '~/lib/utils';
import type { Image } from '~/lib/shopify/types';

interface Props {
  images: Image[];
  title: string;
}

export default function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const gallery = images.length ? images : [];
  const current = gallery[active];

  return (
    <div className="gallery">
      <div className="gallery__main">
        {current ? (
          <img
            src={current.url}
            alt={current.altText ?? title}
            width={current.width ?? undefined}
            height={current.height ?? undefined}
            fetchPriority="high"
          />
        ) : (
          <div className="gallery__noimg">No image</div>
        )}
        {gallery.length > 0 && (
          <span className="gallery__counter">
            {String(active + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
          </span>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        Image {active + 1} of {gallery.length}
      </p>

      {gallery.length > 1 && (
        <div className="gallery__thumbs" aria-label={`${title} images`}>
          {gallery.map((img, i) => (
            <button
              key={img.id ?? img.url}
              type="button"
              aria-pressed={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn('gallery__thumb', i === active && 'is-active')}
            >
              <img src={img.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
