"use client";

import { useParams } from "next/navigation";
import AdminProductForm from "@/components/AdminProductForm";
import { useAdminToken } from "@/lib/admin";

export default function EditProductPage() {
  const token = useAdminToken();
  const params = useParams<{ id: string }>();
  const productId = Number(params?.id);

  if (!token || !Number.isInteger(productId)) {
    return <div className="admin-card text-center text-muted py-5">Yükleniyor...</div>;
  }

  return <AdminProductForm token={token} productId={productId} />;
}
