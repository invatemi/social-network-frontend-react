import { Link } from "react-router-dom";
import { useGetUserPublicProfileQuery } from "@/entities/user/api";
import { useGetChatAttachmentsQuery } from "@/entities/message/api/messagesApi";
import { useAppSelector } from "@/app/store/hooks";
import style from "./ChatDetailsPanel.module.css";

export type ChatDetailsPanelProps = {
  chatId: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  email?: string | null;
  isOnline?: boolean;
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

/**
 * ChatDetailsPanel — правая панель профиля чата
 */
const ChatDetailsPanel = ({
  chatId,
  userId,
  username,
  avatarUrl,
  email: emailProp,
  isOnline: isOnlineProp = false,
}: ChatDetailsPanelProps) => {
  const presenceOnline = useAppSelector(
    (state) => state.presence.byUserId[String(userId)] === true
  );
  const isOnline = presenceOnline || isOnlineProp;

  const { data: profile } = useGetUserPublicProfileQuery(
    { userId },
    { skip: !userId }
  );

  const { data: photos = [] } = useGetChatAttachmentsQuery(
    { chatId, kind: "image", limit: 20 },
    { skip: !chatId }
  );
  const { data: files = [] } = useGetChatAttachmentsQuery(
    { chatId, kind: "file", limit: 50 },
    { skip: !chatId }
  );

  const displayName = profile?.username || username;
  const displayEmail = profile?.email || emailProp || "";
  const displayAvatar = profile?.avatarUrl ?? avatarUrl;
  const initial = displayName.charAt(0).toUpperCase();
  const profilePath = userId > 0 ? `/user/${userId}` : null;

  const profileContent = (
    <>
      <div className={style.avatarWrap}>
        {displayAvatar ? (
          <img src={displayAvatar} alt={displayName} className={style.avatar} />
        ) : (
          <div className={style.avatarPlaceholder}>{initial}</div>
        )}
        <span
          className={[style.onlineDot, isOnline ? style.online : style.offline]
            .filter(Boolean)
            .join(" ")}
          aria-label={isOnline ? "Онлайн" : "Офлайн"}
        />
      </div>
      <h2 className={style.name}>{displayName}</h2>
      {displayEmail ? <p className={style.email}>{displayEmail}</p> : null}
    </>
  );

  return (
    <aside className={style.panel} aria-label="Информация о собеседнике">
      {profilePath ? (
        <Link
          to={profilePath}
          className={style.profileLink}
          aria-label={`Профиль ${displayName}`}
        >
          {profileContent}
        </Link>
      ) : (
        <div className={style.profile}>{profileContent}</div>
      )}

      <section className={style.section}>
        <h3 className={style.sectionTitle}>Фото</h3>
        {photos.length > 0 ? (
          <div className={style.photosGrid}>
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noreferrer"
                className={style.photoLink}
                aria-label={photo.fileName}
              >
                <img
                  src={photo.url}
                  alt={photo.fileName}
                  className={style.photoImage}
                />
              </a>
            ))}
          </div>
        ) : (
          <p className={style.emptyHint}>Пока нет фото</p>
        )}
      </section>

      <section className={style.section}>
        <h3 className={style.sectionTitle}>Файлы</h3>
        {files.length > 0 ? (
          <ul className={style.filesList}>
            {files.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className={style.fileItem}
                >
                  <span className={style.fileItemName}>{file.fileName}</span>
                  <span className={style.fileItemSize}>
                    {formatSize(file.sizeBytes)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={style.emptyHint}>Пока нет файлов</p>
        )}
      </section>
    </aside>
  );
};

export default ChatDetailsPanel;
