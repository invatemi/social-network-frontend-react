import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  selectUser,
  selectAccounts,
} from "@/app/store/slices/authSlice";
import { useGetFriendRequestsQuery } from "@/app/store/api";
import { useSwitchAccountMutation } from "@/app/store/api/authApi";
import {
  applyAccountSession,
  hydrateAccounts,
} from "@/app/store/lib/applyAccountSession";
import { fetchUserProfileWithRetry } from "@/entities/user/api";
import { ProfileMenu } from "@/feature";
import { useToast } from "@/shared";
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

type SwitchPhase = "idle" | "out" | "in";

const SWITCH_OUT_MS = 180;
const SWITCH_IN_MS = 320;

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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

type AccountCardProps = {
  username: string;
  email: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  trailing?: ReactNode;
  testId?: string;
  variant?: "active" | "secondary";
  highlighted?: boolean;
  enterIndex?: number;
};

const AccountCard = ({
  username,
  email,
  avatarUrl,
  isOnline = false,
  interactive = false,
  onClick,
  disabled = false,
  trailing,
  testId,
  variant = "active",
  highlighted = false,
  enterIndex = 0,
}: AccountCardProps) => {
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  const content = (
    <>
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
        {email ? <p className={style.userEmail}>{email}</p> : null}
      </div>
    </>
  );

  return (
    <div
      className={[
        style.profile,
        variant === "active" ? style.profileActive : style.profileSecondary,
        highlighted ? style.profileHighlighted : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid={testId}
      style={{ "--enter-index": enterIndex } as CSSProperties}
    >
      {interactive ? (
        <button
          type="button"
          className={style.accountSwitchBtn}
          onClick={onClick}
          disabled={disabled}
          aria-label={`Переключиться на ${username}`}
        >
          {content}
        </button>
      ) : (
        <Link to="/user" className={style.profileLink}>
          {content}
        </Link>
      )}
      {trailing}
    </div>
  );
};

const AsidePageNav = () => {
  const user = useAppSelector(selectUser);
  const accounts = useAppSelector(selectAccounts);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: friendRequests } = useGetFriendRequestsQuery(undefined, {
    skip: !user,
  });
  const [switchAccount, { isLoading: isSwitching }] = useSwitchAccountMutation();
  const [pressedPath, setPressedPath] = useState<string | null>(null);
  const [switchPhase, setSwitchPhase] = useState<SwitchPhase>("idle");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const friendsBadge = friendRequests?.unreadCount ?? 0;
  const username = user?.username || "Гость";
  const email = user?.email || "";
  const avatarUrl = user?.avatarUrl;
  const isOnline = user?.isOnline ?? true;
  const isBusy = isSwitching || switchPhase !== "idle";

  const otherAccounts = accounts.filter(
    (account) => account.id !== user?.id && !account.isActive,
  );

  const handleSwitchAccount = async (userId: number) => {
    if (isBusy) return;

    const reduceMotion = prefersReducedMotion();

    setPendingUserId(userId);
    setSwitchPhase("out");

    const switchPromise = (async () => {
      const result = await switchAccount({ userId }).unwrap();
      applyAccountSession(dispatch, result);
      await fetchUserProfileWithRetry(dispatch);
      await hydrateAccounts(dispatch, result.accounts);
      return result;
    })();

    try {
      if (!reduceMotion) {
        await wait(SWITCH_OUT_MS);
      }
      await switchPromise;
      navigate("/", { replace: true });

      setSwitchPhase("in");
      if (!reduceMotion) {
        await wait(SWITCH_IN_MS);
      }
    } catch {
      showToast("Не удалось переключить аккаунт");
    } finally {
      setSwitchPhase("idle");
      setPendingUserId(null);
    }
  };

  const accountsClassName = [
    style.accounts,
    switchPhase === "out" ? style.accountsOut : "",
    switchPhase === "in" ? style.accountsIn : "",
  ]
    .filter(Boolean)
    .join(" ");

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

        <div className={style.accountsShell}>
          <div
            className={accountsClassName}
            data-testid="aside-accounts"
            data-switch-phase={switchPhase}
            aria-busy={isBusy || undefined}
          >
            <AccountCard
              username={username}
              email={email}
              avatarUrl={avatarUrl}
              isOnline={isOnline}
              variant="active"
              enterIndex={0}
              testId="active-account-card"
              trailing={
                <ProfileMenu
                  username={username}
                  email={email}
                  avatarUrl={avatarUrl}
                  isOnline={isOnline}
                  triggerClassName={style.menuButton}
                  triggerIcon={<BurgerIcon />}
                />
              }
            />

            {otherAccounts.map((account, index) => (
              <AccountCard
                key={account.id}
                username={account.username}
                email={account.email}
                avatarUrl={account.avatarUrl}
                interactive
                disabled={isBusy}
                variant="secondary"
                highlighted={pendingUserId === account.id}
                enterIndex={index + 1}
                testId={`account-card-${account.id}`}
                onClick={() => void handleSwitchAccount(account.id)}
              />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AsidePageNav;
