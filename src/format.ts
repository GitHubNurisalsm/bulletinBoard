const priceFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

export function formatPrice(price: number): string {
  return `${priceFormat.format(price)} сом`;
}

export function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} КБ` : `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
