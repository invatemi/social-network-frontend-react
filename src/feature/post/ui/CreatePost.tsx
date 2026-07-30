import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@/shared";
import { useCreatePost } from "../hooks/useCreatePost";
import style from "./CreatePost.module.css";

const ANIM_MS = 450;

const ImageIcon = () => (
  <svg
    className={style.attachIcon}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect x="2" y="3.5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6.5" cy="7.5" r="1.5" fill="currentColor" />
    <path
      d="M3.5 13.5L7.2 10.2L9.5 12.2L12.2 9L14.5 13.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * CreatePost — форма создания поста
 */
const CreatePost = () => {
  const {
    isOpen,
    content,
    imagePreviews,
    isLoading,
    error,
    openForm,
    closeForm,
    setContent,
    handleImageSelect,
    removeImage,
    handleSubmit,
  } = useCreatePost();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const showFormRef = useRef(false);

  useEffect(() => {
    showFormRef.current = showForm;
  }, [showForm]);

  useEffect(() => {
    if (isOpen) {
      setShowForm(true);
      const frame = window.requestAnimationFrame(() => {
        setIsExpanded(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (!showFormRef.current) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(false);
    const timer = window.setTimeout(() => {
      setShowForm(false);
    }, ANIM_MS);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(e.target.files);
    e.target.value = "";
  };

  const handleClose = () => {
    if (isLoading) return;
    closeForm();
  };

  const showTrigger = !showForm;

  return (
    <div className={style.root}>
      <div
        className={[style.slot, showTrigger ? style.slotOpen : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={style.slotInner}>
          <div className={style.createPostCard}>
            <button
              type="button"
              className={style.triggerButton}
              onClick={openForm}
              tabIndex={showTrigger ? 0 : -1}
            >
              <span className={style.triggerPlus} aria-hidden>
                +
              </span>
              <span className={style.buttonText}>Создать новый пост</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={[style.slot, isExpanded ? style.slotOpen : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={style.slotInner}>
          {showForm && (
            <div
              className={[
                style.createPostCard,
                style.formCard,
                isExpanded ? style.formCardVisible : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={style.header}>
                <h3 className={style.title}>Новый пост</h3>
                <button
                  type="button"
                  className={style.closeButton}
                  onClick={handleClose}
                  aria-label="Закрыть форму"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>

              <div className={style.contentArea}>
                <Input
                  as="textarea"
                  id="create-post-content"
                  value={content ?? undefined}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Что у вас нового?"
                  error={error || undefined}
                  disabled={isLoading}
                  rows={4}
                  maxLength={5000}
                  fullWidth
                  helperText={`${content?.length ?? 0}/5000`}
                />

                {imagePreviews.length > 0 && (
                  <div className={style.imagesGrid}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className={style.imageWrapper}>
                        <img
                          src={preview}
                          alt={`Превью ${index + 1}`}
                          className={style.previewImage}
                        />
                        <button
                          type="button"
                          className={style.removeImageButton}
                          onClick={() => removeImage(index)}
                          aria-label="Удалить фото"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={style.toolbar}>
                <div className={style.toolbarLeft}>
                  <button
                    type="button"
                    className={style.attachmentButton}
                    onClick={handleAttachmentClick}
                  >
                    <ImageIcon />
                    Фото
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className={style.fileInput}
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  disabled={
                    isLoading ||
                    (!content?.trim() && imagePreviews.length === 0)
                  }
                  onClick={handleSubmit}
                  className={style.submitButton}
                >
                  Опубликовать
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
