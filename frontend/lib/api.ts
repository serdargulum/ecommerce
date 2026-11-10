const SERVER_API_BASE = process.env.API_URL ?? "http://localhost:8080";
const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Sunucu tarafında Docker iç ağı, tarayıcıda yayınlanan API adresi kullanılır. */
export function apiBase(): string {
  return typeof window === "undefined" ? SERVER_API_BASE : PUBLIC_API_BASE;
}

/** API'den gelen göreli görsel yolunu tam adrese çevirir. */
export function assetUrl(url: string | null | undefined): string {
  if (!url) {
    return "/placeholder.svg";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${PUBLIC_API_BASE}${url}`;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  cache?: RequestCache;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, cache = "no-store" } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache,
    });
  } catch {
    throw new ApiError("Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.", 0);
  }

  if (!response.ok) {
    let message = "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
    let errors: Record<string, string[]> | undefined;

    try {
      const payload = (await response.json()) as { message?: string; errors?: Record<string, string[]> };
      message = payload.message ?? message;
      errors = payload.errors;
    } catch {
      // Gövde JSON değilse varsayılan mesaj kullanılır.
    }

    throw new ApiError(message, response.status, errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiBase()}/api/admin/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    let message = "Görsel yüklenemedi.";
    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // yoksay
    }
    throw new ApiError(message, response.status);
  }

  const payload = (await response.json()) as { url: string };
  return payload.url;
}
