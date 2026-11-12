"use client";

import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "newest", label: "Önerilen sıralama" },
  { value: "price-asc", label: "Fiyat: Artan" },
  { value: "price-desc", label: "Fiyat: Azalan" },
  { value: "name", label: "İsme göre (A-Z)" },
];

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      className="form-select form-select-sm"
      style={{ width: "auto", minWidth: 170 }}
      aria-label="Ürünleri sırala"
      value={value}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", event.target.value);
        params.delete("page");
        router.push(`/urunler?${params.toString()}`);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
