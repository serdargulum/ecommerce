import Link from "next/link";
import { assetUrl } from "@/lib/api";
import { discountPercent, formatPrice } from "@/lib/format";
import type { ProductListItem } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductListItem }) {
  const discount = discountPercent(product.price, product.finalPrice);

  return (
    <Link href={`/urun/${product.slug}`} className="product-card">
      <div className="product-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          width={480}
          height={600}
        />
        {discount ? (
          <span className="product-card__badge">%{discount} indirim</span>
        ) : null}
        {product.stock <= 0 ? (
          <span className="product-card__soldout">
            <span>Tükendi</span>
          </span>
        ) : null}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.categoryName}</span>
        <span className="product-card__name">{product.name}</span>
        <span className="product-card__price">
          <span className="price-current">{formatPrice(product.finalPrice)}</span>
          {discount ? <span className="price-old">{formatPrice(product.price)}</span> : null}
        </span>
      </div>
    </Link>
  );
}
