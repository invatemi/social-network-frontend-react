import { useGetUserPublicProfileQuery } from "@/entities/user/api";
import { useAppSelector } from "@/app/store/hooks";
import style from "./ChatDetailsPanel.module.css";

export type ChatDetailsPanelProps = {
  userId: number;
  username: string;
  avatarUrl: string | null;
  email?: string | null;
  isOnline?: boolean;
};

/**
 * ChatDetailsPanel — правая панель профиля чата
 */
const ChatDetailsPanel = ({
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

  const displayName = profile?.username || username;
  const displayEmail = profile?.email || emailProp || "";
  const displayAvatar = profile?.avatarUrl ?? avatarUrl;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className={style.panel} aria-label="Информация о собеседнике">
      <div className={style.profile}>
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
      </div>

      <section className={style.section}>
        <h3 className={style.sectionTitle}>Фото</h3>
        <div className={style.photosGrid} aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={style.photoPlaceholder}>
              <span className={style.photoIcon} />
            </div>
          ))}
        </div>
        <p className={style.emptyHint}>Пока нет фото</p>
      </section>

      <section className={style.section}>
        <h3 className={style.sectionTitle}>Файлы</h3>
        <p className={style.emptyHint}>Пока нет файлов</p>
      </section>
    </aside>
  );
};

export default ChatDetailsPanel;
