export const API_URL = "https://inai-col1.fishrungames.com";

export interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
}

export interface AdsPage {
  items: Ad[];
  total: number;
  page: number;
  limit: number;
}

export interface NewAd {
  title: string;
  description: string;
  price: number;
  image: File | null;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = typeof body?.detail === "string" ? body.detail : JSON.stringify(body);
    } catch {
      // тело ответа не JSON — показываем только статус
    }
    throw new Error(`Ошибка сервера ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAds(page: number, limit: number, signal?: AbortSignal): Promise<AdsPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${API_URL}/ads?${params}`, { signal });
  return parseResponse<AdsPage>(res);
}

export async function createAd(ad: NewAd): Promise<Ad> {
  const form = new FormData();
  form.append("title", ad.title);
  form.append("description", ad.description);
  form.append("price", String(ad.price));
  if (ad.image) form.append("image", ad.image);
  // Content-Type с boundary браузер выставит сам
  const res = await fetch(`${API_URL}/ads`, { method: "POST", body: form });
  return parseResponse<Ad>(res);
}

export function imageSrc(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  return /^https?:\/\//.test(imageUrl) ? imageUrl : `${API_URL}${imageUrl}`;
}
