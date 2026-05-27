import { useRef } from "react";
import { Button, Input } from "@/shared";
import { useCreatePost } from "../hooks/useCreatePost";
import style from "./CreatePost.module.css";

/**
 * ASCII-иконка изображения для кнопки прикрепления
 */
const ImageIcon = () => (
  <span className={style.iconAscii}>{`[IMG]`}</span>
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

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(e.target.files);
    e.target.value = "";
  };

  if (!isOpen) {
    return (
      <div className={style.createPostCard}>
        <div className={style.triggerWrapper}>
          <Button 
            variant="secondary" 
            size="lg" 
            fullWidth 
            onClick={openForm} 
            className={style.triggerButton}
          >
            <span className={style.buttonText}>{`> create_new_post()`}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={style.createPostCard}>
      <div className={style.header}>
        <h3 className={style.title}>{`[new_post]`}</h3>
        <Button variant="ghost" size="sm" onClick={closeForm} aria-label="Закрыть форму" className={style.closeButton}>
          {`[X]`}
        </Button>
      </div>

      <div className={style.contentArea}>
        <Input
          as="textarea"
          id="create-post-content"
          value={content ?? undefined}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"> введите содержание поста..."}
          error={error ? `! ${error}` : undefined}
          disabled={isLoading}
          rows={4}
          maxLength={5000}
          fullWidth
          helperText={`[${content?.length ?? 0}/5000]`}
        />

        {imagePreviews.length > 0 && (
          <div className={style.imagesGrid}>
            {imagePreviews.map((preview, index) => (
              <div key={index} className={style.imageWrapper}>
                <img src={preview} alt={`Preview ${index}`} className={style.previewImage} />
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => removeImage(index)} 
                  className={style.removeImageButton}
                  aria-label="Удалить фото"
                >
                  {`[X]`}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={style.toolbar}>
        <div className={style.toolbarLeft}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAttachmentClick}
            leftIcon={<ImageIcon />}
            className={style.attachmentButton}
          >
            {`[attach]`}
          </Button>
          
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
          disabled={isLoading || (!content?.trim() && imagePreviews.length === 0)}
          onClick={handleSubmit}
          className={style.submitButton}
        >
          {`[publish]`}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;