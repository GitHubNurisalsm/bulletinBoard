import { useState } from "react";
import { imageSrc, type Ad } from "./api";
import { formatPrice } from "./format";
import { ImageIcon } from "./icons";

export function AdImage({ ad, className }: { ad: Ad; className: string }) {
  const [failed, setFailed] = useState(false);
  const src = imageSrc(ad.image_url);

  if (!src || failed) {
    return (
      <div className={`${className} image-placeholder`}>
        <ImageIcon width={32} height={32} />
        <span>Нет фото</span>
      </div>
    );
  }
  return <img className={className} src={src} alt={ad.title} loading="lazy" onError={() => setFailed(true)} />;
}

export default function AdCard({ ad, onOpen }: { ad: Ad; onOpen: (ad: Ad) => void }) {
  return (
    <article className="ad-card">
      <div className="ad-card-media">
        <AdImage ad={ad} className="ad-card-image" />
      </div>
      <div className="ad-card-body">
        <p className="ad-card-price">{formatPrice(ad.price)}</p>
        <h3 className="ad-card-title">
          {/* растянутая кнопка: кликабельна вся карточка, но в доступности это одна кнопка */}
          <button type="button" className="stretched" onClick={() => onOpen(ad)}>
            {ad.title}
          </button>
        </h3>
        <p className="ad-card-description">{ad.description}</p>
      </div>
    </article>
  );
}

export function AdCardSkeleton() {
  return (
    <div className="ad-card" aria-hidden="true">
      <div className="ad-card-media skeleton" />
      <div className="ad-card-body">
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton skeleton-line" style={{ width: "85%" }} />
        <div className="skeleton skeleton-line" style={{ width: "65%" }} />
      </div>
    </div>
  );
}
