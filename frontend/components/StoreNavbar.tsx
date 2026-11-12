"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { AUTH_EVENT, customerAuth } from "@/lib/auth";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/urunler", label: "Ürünler" },
  { href: "/siparis-takip", label: "Sipariş Takip" },
];

export default function StoreNavbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const sync = () => setSignedIn(Boolean(customerAuth.token()));
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="announcement">
        <div className="container">
          <span>
            <i className="bi bi-truck" aria-hidden="true" /> Tüm siparişlerde ücretsiz kargo
          </span>
          <span className="d-none d-sm-inline-flex">
            <i className="bi bi-flower1" aria-hidden="true" /> Her gün taze üretim
          </span>
          <span className="d-none d-md-inline-flex">
            <i className="bi bi-shield-check" aria-hidden="true" /> Güvenli ödeme
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <div className="site-header__inner">
            <Link href="/" className="brand" aria-label="Ecommerce ana sayfa">
              <span className="brand__mark" aria-hidden="true">
                t
              </span>
              <span>
                Ecommerce<span className="brand__dot">.</span>
              </span>
            </Link>

            <nav className="nav-links" aria-label="Ana menü">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.href === "/"
                      ? pathname === "/"
                        ? "is-active"
                        : ""
                      : pathname.startsWith(link.href)
                        ? "is-active"
                        : ""
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <Link href="/urunler" className="icon-btn" aria-label="Ürün ara">
                <i className="bi bi-search" aria-hidden="true" />
              </Link>
              <Link href="/hesap" className="header-account">
                <i className="bi bi-person" aria-hidden="true" />
                <span>{signedIn ? "Hesabım" : "Giriş Yap"}</span>
              </Link>
              <Link href="/sepet" className="icon-btn" aria-label={`Sepet, ${count} ürün`}>
                <i className="bi bi-bag" aria-hidden="true" />
                {count > 0 ? <span className="cart-count">{count}</span> : null}
              </Link>
              <button
                type="button"
                className="icon-btn mobile-menu-btn"
                aria-label="Menüyü aç"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <i className={menuOpen ? "bi bi-x-lg" : "bi bi-list"} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {menuOpen ? (
          <div className="mobile-menu">
            <div className="container">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link href="/hesap">{signedIn ? "Hesabım" : "Giriş Yap / Üye Ol"}</Link>
              <Link href="/sepet">Sepetim {count > 0 ? `(${count})` : ""}</Link>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
