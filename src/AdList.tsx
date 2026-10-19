import { useEffect, useState } from "react";
import { fetchAds, type Ad, type AdsPage } from "./api";
import AdCard, { AdCardSkeleton } from "./AdCard";
import { AlertIcon, ChevronLeftIcon, ChevronRightIcon, ImageIcon, PlusIcon } from "./icons";

const LIMIT = 12;

interface AdListProps {
  reloadKey: number;
  onOpen: (ad: Ad) => void;
  onCreate: () => void;
}

// Номера страниц вокруг текущей, с многоточиями: 1 … 4 5 6 … 10
function pageNumbers(current: number, total: number): (number | "…")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
}

export default function AdList({ reloadKey, onOpen, onCreate }: AdListProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // После создания объявления возвращаемся на первую страницу
  useEffect(() => setPage(1), [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchAds(page, LIMIT, controller.signal)
      .then(setData)
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Не удалось загрузить объявления");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, reloadKey, retry]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  function goTo(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section aria-labelledby="ads-title">
      <div className="section-head">
        <div>
          <h1 id="ads-title">Свежие объявления</h1>
          <p className="muted">
            {data ? `${data.total} ${plural(data.total, ["объявление", "объявления", "объявлений"])}` : "Загружаем…"}
          </p>
        </div>
      </div>

      {error && (
        <div className="state-card state-error" role="alert">
          <AlertIcon width={28} height={28} />
          <div>
            <p className="state-title">Не удалось загрузить объявления</p>
            <p className="muted">{error}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setRetry((r) => r + 1)}>
            Повторить
          </button>
        </div>
      )}

      {!error && data && data.items.length === 0 && !loading && (
        <div className="state-card state-empty">
          <div className="state-icon">
            <ImageIcon width={32} height={32} />
          </div>
          <p className="state-title">Объявлений пока нет</p>
          <p className="muted">Станьте первым — разместите объявление за минуту.</p>
          <button type="button" className="btn btn-primary" onClick={onCreate}>
            <PlusIcon /> Разместить объявление
          </button>
        </div>
      )}

      <div className={`grid${loading && data ? " grid-loading" : ""}`} aria-busy={loading}>
        {loading && !data
          ? Array.from({ length: 8 }, (_, i) => <AdCardSkeleton key={i} />)
          : data?.items.map((ad) => <AdCard key={ad.id} ad={ad} onOpen={onOpen} />)}
      </div>

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Страницы">
          <button
            type="button"
            className="page-btn"
            disabled={page <= 1 || loading}
            onClick={() => goTo(page - 1)}
            aria-label="Предыдущая страница"
          >
            <ChevronLeftIcon />
          </button>
          {pageNumbers(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="page-gap">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`page-btn${p === page ? " active" : ""}`}
                aria-current={p === page ? "page" : undefined}
                disabled={loading}
                onClick={() => goTo(p)}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            className="page-btn"
            disabled={page >= totalPages || loading}
            onClick={() => goTo(page + 1)}
            aria-label="Следующая страница"
          >
            <ChevronRightIcon />
          </button>
        </nav>
      )}
    </section>
  );
}

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
