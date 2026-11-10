"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAuth } from "@/lib/auth";

/** Yönetim sayfaları için token'ı hazırlar; oturum yoksa giriş sayfasına yönlendirir. */
export function useAdminToken(): string | null {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const current = adminAuth.token();
    if (!current) {
      router.replace("/admin/giris");
      return;
    }
    setToken(current);
  }, [router]);

  return token;
}

export const ADMIN_PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Panel", subtitle: "Mağazanın genel durumu ve son hareketler" },
  "/admin/urunler": { title: "Ürünler", subtitle: "Ürün, fiyat ve stok yönetimi" },
  "/admin/urunler/yeni": { title: "Yeni Ürün", subtitle: "Vitrine yeni bir ürün ekleyin" },
  "/admin/kategoriler": { title: "Kategoriler", subtitle: "Mağaza kategori yapısı" },
  "/admin/siparisler": { title: "Siparişler", subtitle: "Siparişleri görüntüleyin ve durumlarını güncelleyin" },
  "/admin/musteriler": { title: "Müşteriler", subtitle: "Kayıtlı müşteriler ve alışveriş özetleri" },
  "/admin/odeme-ayarlari": { title: "Ödeme Yöntemleri", subtitle: "Ödeme seçeneklerini açıp kapatın" },
};
