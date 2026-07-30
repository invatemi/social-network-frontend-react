import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import { useGetFriendRequestsQuery } from "@/app/store/api";
import { ProfileMenu } from "@/feature";
import style from "./AsidePageNav.module.css";
import {
  NewsIcon,
  MessagesIcon,
  FriendsIcon,
  FollowersIcon,
  PhotosIcon,
  BurgerIcon,
  UserPlaceholderIcon,
} from "./icons";

type NavItem = {
  label: string;
  path: string;
  end?: boolean;
  icon: ReactNode;
  badgeKey?: "friends";
};

const navItems: NavItem[] = [
  { label: "Новости", path: "/", end: true, icon: <NewsIcon /> },
  { label: "Сообщения", path: "/messages", icon: <MessagesIcon /> },
  {
    label: "Друзья",
    path: "/friends",
    icon: <FriendsIcon />,
    badgeKey: "friends",
  },
  { label: "Подписки", path: "/followers", icon: <FollowersIcon /> },
  { label: "Фото", path: "/photos", end: true, icon: <PhotosIcon /> },
];

const AsidePageNav = () => {
  const user = useAppSelector(selectUser);
  const { data: friendRequests } = useGetFriendRequestsQuery(undefined, {
    skip: !user,
  });
  const [avatarError, setAvatarError] = useState(false);
  const [pressedPath, setPressedPath] = useState<string | null>(null);

  const friendsBadge = friendRequests?.unreadCount ?? 0;
  const username = user?.username || "Гость";
  const email = user?.email || "";
  const avatarUrl = user?.avatarUrl;
  const isOnline = user?.isOnline ?? true;

  return (
    <div className={style.asideWrap}>
      <aside className={style.asideNav} aria-label="Боковая навигация">
        <nav>
          <ul className={style.navList}>
            {navItems.map((item) => {
              const badge =
                item.badgeKey === "friends" && friendsBadge > 0
                  ? friendsBadge
                  : null;

              return (
                <li key={item.path + item.label}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onPointerDown={() => setPressedPath(item.path)}
                    onPointerUp={() => setPressedPath(null)}
                    onPointerLeave={() => setPressedPath(null)}
                    onPointerCancel={() => setPressedPath(null)}
                    className={({ isActive, isPending }) =>
                      [
                        style.navLink,
                        isActive ? style.navLinkActive : "",
                        isPending ? style.navLinkPending : "",
                        pressedPath === item.path ? style.navLinkPressed : "",
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                  >
                    <span className={style.navGlow} aria-hidden />
                    <span className={style.navIcon}>{item.icon}</span>
                    <span className={style.linkLabel}>{item.label}</span>
                    {badge !== null && (
                      <span className={style.badge}>
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={style.profile}>
          <Link to="/user" className={style.profileLink}>
            <div className={style.avatarWrap}>
              {avatarUrl && !avatarError ? (
                <img
                  key={avatarUrl}
                  src={avatarUrl}
                  alt={username}
                  className={style.avatar}
                  draggable={false}
                  crossOrigin="anonymous"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className={style.avatarPlaceholder}>
                  <UserPlaceholderIcon />
                </div>
              )}
              {isOnline && <span className={style.onlineDot} aria-hidden />}
            </div>

            <div className={style.userMeta}>
              <p className={style.userName}>{username}</p>
              {email && <p className={style.userEmail}>{email}</p>}
            </div>
          </Link>

          <ProfileMenu
            username={username}
            email={email}
            avatarUrl={avatarUrl}
            isOnline={isOnline}
            triggerClassName={style.menuButton}
            triggerIcon={<BurgerIcon />}
          />
        </div>
      </aside>
    </div>
  );
};

export default AsidePageNav;
