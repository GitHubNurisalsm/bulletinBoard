import { useEffect, useState } from "react";
import type { Ad } from "./api";
import { AdImage } from "./AdCard";
import AdForm from "./AdForm";
import AdList from "./AdList";
import { formatPrice } from "./format";
import { CheckIcon, LogoIcon, PlusIcon } from "./icons";
import Modal from "./Modal";

export default function App() {
  // Меняем ключ после успешной отправки — список перезагружается
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Ad | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function onCreated(ad: Ad) {
    setFormOpen(false);
    setReloadKey((k) => k + 1);
    setToast(`«${ad.title}» опубликовано`);
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <a href="./" className="brand">
            <span className="brand-mark">
              <LogoIcon />
            </span>
            Доска объявлений
          </a>
          <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <PlusIcon />
            <span className="hide-sm">Разместить объявление</span>
            <span className="show-sm">Разместить</span>
          </button>
        </div>
      </header>

      <main className="container main">
        <AdList reloadKey={reloadKey} onOpen={setSelected} onCreate={() => setFormOpen(true)} />
      </main>

      <footer className="container footer muted">Доска объявлений · React + TypeScript</footer>

      {/* Форма остаётся смонтированной: черновик не теряется при закрытии окна */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Новое объявление">
        <AdForm onCreated={onCreated} onCancel={() => setFormOpen(false)} />
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ""} size="lg">
        {selected && (
          <div className="details">
            <AdImage key={selected.id} ad={selected} className="details-image" />
            <div className="details-info">
              <p className="details-price">{formatPrice(selected.price)}</p>
              <h3>Описание</h3>
              <p className="details-description">{selected.description}</p>
              <p className="muted details-id">Объявление № {selected.id}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* live-region всегда в DOM, чтобы скринридер объявлял новое сообщение */}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast">
            <CheckIcon />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
