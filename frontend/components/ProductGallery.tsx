"use client";

import { useState } from "react";
import { assetUrl } from "@/lib/api";
import type { ProductImage } from "@/lib/types";

export default function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [];

  if (list.length === 0) {
    return (
      <div className="product-gallery__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/placeholder.svg" alt={name} />
      </div>
    );
  }

  return (
    <div>
      <div className="product-gallery__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetUrl(list[active].url)} alt={name} width={900} height={900} />
      </div>

      {list.length > 1 ? (
        <div className="product-gallery__thumbs" role="tablist" aria-label="Ürün görselleri">
          {list.map((image, index) => (
            <button
              key={image.id ?? index}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`${name} görsel ${index + 1}`}
              className={`product-gallery__thumb${index === active ? " is-active" : ""}`}
              onClick={() => setActive(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetUrl(image.url)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
