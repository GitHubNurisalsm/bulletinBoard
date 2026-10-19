import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { createAd, type Ad } from "./api";
import { formatSize } from "./format";
import { CloseIcon, UploadIcon } from "./icons";

const MAX_IMAGE_MB = 5;
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 1000;

type Field = "title" | "description" | "price" | "image";
type Errors = Partial<Record<Field, string>>;

interface AdFormProps {
  onCreated: (ad: Ad) => void;
  onCancel: () => void;
}

function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Можно загрузить только изображение";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Размер файла не больше ${MAX_IMAGE_MB} МБ`;
  return null;
}

export default function AdForm({ onCreated, onCancel }: AdFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) return setPreview(null);
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function clearError(field: Field) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function pickFile(file: File | null) {
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    const error = validateImage(file);
    setErrors((prev) => ({ ...prev, image: error ?? undefined }));
    if (!error) setImage(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0] ?? null);
  }

  function validate(): Errors {
    const next: Errors = {};
    const priceNum = Number(price.replace(",", "."));
    if (!title.trim()) next.title = "Укажите название";
    if (!description.trim()) next.description = "Добавьте описание";
    if (!price.trim()) next.price = "Укажите цену";
    else if (!Number.isFinite(priceNum) || priceNum < 0) next.price = "Цена должна быть неотрицательным числом";
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      const ad = await createAd({
        title: title.trim(),
        description: description.trim(),
        price: Number(price.replace(",", ".")),
        image,
      });
      setTitle("");
      setDescription("");
      setPrice("");
      setImage(null);
      setErrors({});
      onCreated(ad);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Не удалось отправить объявление");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form" noValidate>
      <div className={`field${errors.title ? " invalid" : ""}`}>
        <div className="field-label">
          <label htmlFor="ad-title">Название</label>
          <span className="counter">
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        <input
          id="ad-title"
          value={title}
          maxLength={TITLE_MAX}
          placeholder="Например, игровой ноутбук"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "ad-title-error" : undefined}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
        />
        {errors.title && <p id="ad-title-error" className="field-error">{errors.title}</p>}
      </div>

      <div className={`field${errors.description ? " invalid" : ""}`}>
        <div className="field-label">
          <label htmlFor="ad-description">Описание</label>
          <span className="counter">
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
        <textarea
          id="ad-description"
          value={description}
          rows={4}
          maxLength={DESCRIPTION_MAX}
          placeholder="Состояние, комплектация, причина продажи"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "ad-description-error" : undefined}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
        />
        {errors.description && <p id="ad-description-error" className="field-error">{errors.description}</p>}
      </div>

      <div className={`field${errors.price ? " invalid" : ""}`}>
        <div className="field-label">
          <label htmlFor="ad-price">Цена</label>
        </div>
        <div className="input-suffix">
          <input
            id="ad-price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            placeholder="0"
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? "ad-price-error" : undefined}
            onChange={(e) => {
              setPrice(e.target.value);
              clearError("price");
            }}
          />
          <span>сом</span>
        </div>
        {errors.price && <p id="ad-price-error" className="field-error">{errors.price}</p>}
      </div>

      <div className={`field${errors.image ? " invalid" : ""}`}>
        <div className="field-label">
          <span id="ad-image-label">Фото</span>
          <span className="counter">необязательно</span>
        </div>
        {image && preview ? (
          <div className="file-preview">
            <img src={preview} alt="Предпросмотр" />
            <div className="file-meta">
              <span className="file-name">{image.name}</span>
              <span className="muted">{formatSize(image.size)}</span>
            </div>
            <button type="button" className="icon-btn" onClick={() => setImage(null)} aria-label="Удалить фото">
              <CloseIcon />
            </button>
          </div>
        ) : (
          <label
            className={`dropzone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="visually-hidden"
              aria-labelledby="ad-image-label"
              aria-describedby={errors.image ? "ad-image-error" : undefined}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            <UploadIcon width={24} height={24} />
            <span>
              <strong>Выберите файл</strong> или перетащите сюда
            </span>
            <span className="muted">JPG, PNG, WEBP — до {MAX_IMAGE_MB} МБ</span>
          </label>
        )}
        {errors.image && <p id="ad-image-error" className="field-error">{errors.image}</p>}
      </div>

      {submitError && (
        <div className="alert" role="alert">
          {submitError}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden="true" />}
          {submitting ? "Публикуем…" : "Опубликовать"}
        </button>
      </div>
    </form>
  );
}
