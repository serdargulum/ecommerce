"use client";

import AdminProductForm from "@/components/AdminProductForm";
import { useAdminToken } from "@/lib/admin";

export default function NewProductPage() {
  const token = useAdminToken();

  if (!token) {
    return (
      <div className="admin-card text-center text-muted py-5">Yükleniyor...</div>
    );
  }

  return <AdminProductForm token={token} />;
}
