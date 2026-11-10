"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice, stockLabel } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";

export default function AddToCart({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const soldOut = product.stock <= 0;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center gap-2 small">
        <span
          className={`d-inline-block rounded-circle ${soldOut ? "bg-danger" : "bg-success"}`}
          style={{ width: 7, height: 7 }}
          aria-hidden="true"
        />
        <span className={soldOut ? "text-danger" : "text-muted-tb"}>
          {soldOut ? "Bu ürün şu anda tükendi" : stockLabel(product.stock)}
        </span>
        {product.finalPrice < product.price ? (
          <span className="ms-auto price-old">{formatPrice(product.price)}</span>
        ) : null}
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2">
        <div className="qty" aria-label="Adet seçimi">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={soldOut || quantity <= 1}
            aria-label="Adet azalt"
          >
            <i className="bi bi-dash" aria-hidden="true" />
          </button>
          <span aria-live="polite">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
            disabled={soldOut || quantity >= product.stock}
            aria-label="Adet artır"
          >
            <i className="bi bi-plus" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="btn btn-tb-dark btn-lg flex-grow-1"
          disabled={soldOut}
          onClick={() =>
            addItem(
              {
                id: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: product.images[0]?.url ?? null,
                finalPrice: product.finalPrice,
                stock: product.stock,
              },
              quantity,
            )
          }
        >
          <i className="bi bi-bag-plus me-2" aria-hidden="true" />
          {soldOut ? "Tükendi" : "Sepete Ekle"}
        </button>
      </div>

      {soldOut ? (
        <p className="small text-muted-tb mb-0">
          Ürün tekrar stoka girdiğinde mağazamızdan sipariş verebilirsiniz.
        </p>
      ) : null}
    </div>
  );
}
