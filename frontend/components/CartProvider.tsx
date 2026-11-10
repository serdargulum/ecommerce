"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "tb_cart_v1";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
}

interface AddableProduct {
  id: number;
  slug: string;
  name: string;
  imageUrl: string | null;
  finalPrice: number;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (product: AddableProduct, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sanitize(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") {
      return [];
    }
    const item = raw as Partial<CartItem>;
    if (
      typeof item.productId !== "number" ||
      typeof item.slug !== "string" ||
      typeof item.name !== "string" ||
      typeof item.unitPrice !== "number" ||
      typeof item.quantity !== "number" ||
      typeof item.stock !== "number"
    ) {
      return [];
    }
    return [
      {
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
        unitPrice: item.unitPrice,
        quantity: Math.min(Math.max(1, item.quantity), Math.max(1, item.stock)),
        stock: item.stock,
      },
    ];
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(sanitize(JSON.parse(stored)));
      }
    } catch {
      // Bozuk kayıt yoksayılır.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const showToast = useCallback((name: string) => {
    setToast(`${name} sepete eklendi`);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const addItem = useCallback(
    (product: AddableProduct, quantity = 1) => {
      if (product.stock <= 0) {
        return;
      }

      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (existing) {
          const nextQuantity = Math.min(existing.quantity + quantity, product.stock);
          return current.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: nextQuantity, unitPrice: product.finalPrice, stock: product.stock }
              : item,
          );
        }
        return [
          ...current,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.imageUrl,
            unitPrice: product.finalPrice,
            quantity: Math.min(Math.max(1, quantity), product.stock),
            stock: product.stock,
          },
        ];
      });

      showToast(product.name);
    },
    [showToast],
  );

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(Math.max(1, quantity), Math.max(1, item.stock)) }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return { items, count, subtotal, hydrated, addItem, setQuantity, removeItem, clear };
  }, [items, hydrated, addItem, setQuantity, removeItem, clear]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="tb-toast" role="status">
          <i className="bi bi-bag-check" aria-hidden="true" />
          <span>{toast}</span>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart, CartProvider içinde kullanılmalıdır.");
  }
  return context;
}
