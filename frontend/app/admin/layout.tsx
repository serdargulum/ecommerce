"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { adminAuth } from "@/lib/auth";
import { ADMIN_PAGE_TITLES } from "@/lib/admin";
import type { Admin } from "@/lib/types";

const navGroups = [
  {
    label: "Genel",
    items: [{ href: "/admin", label: "Panel", icon: "bi-speedometer2" }],
  },
  {
    label: "Mağaza",
    items: [
      { href: "/admin/urunler", label: "Ürünler", icon: "bi-box-seam" },
      { href: "/admin/kategoriler", label: "Kategoriler", icon: "bi-tags" },
    ],
  },
  {
    label: "Siparişler",
    items: [
      { href: "/admin/siparisler", label: "Siparişler", icon: "bi-receipt" },
      { href: "/admin/musteriler", label: "Müşteriler", icon: "bi-people" },
    ],
  },
  {
    label: "Ayarlar",
    items: [
      { href: "/admin/odeme-ayarlari", label: "Ödeme Yöntemleri", icon: "bi-credit-card" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/giris";

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLogin) {
      return;
    }

    const token = adminAuth.token();
    if (!token) {
      router.replace("/admin/giris");
      return;
    }

    let cancelled = false;
    apiFetch<Admin>("/api/admin/auth/me", { token })
      .then((result) => {
        if (!cancelled) {
          setAdmin(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          adminAuth.clear();
          router.replace("/admin/giris");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLogin, router, pathname]);

  if (isLogin) {
    return <div className="admin-shell">{children}</div>;
  }

  const meta = ADMIN_PAGE_TITLES[pathname] ?? {
    title: "Yönetim",
    subtitle: "Tatlı Bi'şey mağaza yönetimi",
  };

  const logout = () => {
    adminAuth.clear();
    router.replace("/admin/giris");
  };

  return (
    <div className="admin-shell d-flex">
      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-brand">
          <span className="admin-brand__mark" aria-hidden="true">
            t
          </span>
          <div>
            Tatlı Bi&apos;şey
            <small>Yönetim Panel</small>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Yönetim menüsü">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="admin-nav__group">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={pathname === item.href ? "is-active" : ""}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="mb-2">{admin ? admin.fullName : "Yönetici"}</div>
          <Link href="/" target="_blank" className="d-block" style={{ color: "#c3c9d3" }}>
            <i className="bi bi-box-arrow-up-right me-1" aria-hidden="true" /> Mağazayı Gör
          </Link>
          <button
            type="button"
            className="btn btn-link btn-sm p-0 mt-2"
            style={{ color: "#c3c9d3" }}
            onClick={logout}
          >
            <i className="bi bi-box-arrow-right me-1" aria-hidden="true" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Menüyü kapat"
          className="d-lg-none border-0"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1035 }}
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn admin-btn d-lg-none"
              aria-label="Menüyü aç"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="bi bi-list" aria-hidden="true" />
            </button>
            <div>
              <h1 className="admin-topbar__title">{meta.title}</h1>
              <div className="admin-topbar__sub">{meta.subtitle}</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link href="/" target="_blank" className="admin-btn btn d-none d-md-inline-block">
              <i className="bi bi-shop me-1" aria-hidden="true" /> Mağaza
            </Link>
            <div className="d-none d-sm-block small text-end">
              <div className="fw-medium">{admin?.fullName ?? "Yönetici"}</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                {admin?.email ?? ""}
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
