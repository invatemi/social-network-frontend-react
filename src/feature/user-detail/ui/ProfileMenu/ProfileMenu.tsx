import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { logout } from "@/app/store/slices/authSlice";
import { useLogoutMutation } from "@/app/store/api/authApi";
import { useProfileSettings } from "../../ProfileSettingsProvider";
import style from "./ProfileMenu.module.css";

export type ProfileMenuProps = {
  username: string;
  email?: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  triggerClassName?: string;
  triggerIcon: ReactNode;
};

const GearIcon = () => (
  <svg className={style.rowIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M19.4 13.1c.04-.36.06-.73.06-1.1 0-.37-.02-.74-.06-1.1l2.04-1.6a.5.5 0 0 0 .12-.63l-1.93-3.34a.5.5 0 0 0-.6-.22l-2.4.97a8.1 8.1 0 0 0-1.9-1.1l-.36-2.55A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.5.42l-.36 2.55c-.68.27-1.32.64-1.9 1.1l-2.4-.97a.5.5 0 0 0-.6.22L2.81 8.66a.5.5 0 0 0 .12.63l2.04 1.6c-.04.36-.06.73-.06 1.1 0 .37.02.74.06 1.1l-2.04 1.6a.5.5 0 0 0-.12.63l1.93 3.34c.13.23.4.32.63.22l2.4-.97c.58.46 1.22.83 1.9 1.1l.36 2.55c.04.24.25.42.5.42h3c.24 0 .45-.18.5-.42l.36-2.55c.68-.27 1.32-.64 1.9-1.1l2.4.97c.24.1.5 0 .63-.22l1.93-3.34a.5.5 0 0 0-.12-.63l-2.04-1.6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg className={style.rowIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M15 16l4-4-4-4M19 12H10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserPlaceholderIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5 19.5c1.5-3.2 4-4.5 7-4.5s5.5 1.3 7 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

type MenuPosition = {
  left: number;
  bottom: number;
};

/**
 * ProfileMenu — компактная карточка, выезжающая вправо из aside
 */
const ProfileMenu = ({
  username,
  email,
  avatarUrl,
  isOnline = false,
  triggerClassName,
  triggerIcon,
}: ProfileMenuProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ left: 0, bottom: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { openSettings } = useProfileSettings();

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const aside = trigger.closest("aside");
    if (aside) {
      const rect = aside.getBoundingClientRect();
      setPosition({
        left: rect.right + 14,
        bottom: Math.max(12, window.innerHeight - rect.bottom),
      });
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setPosition({
      left: rect.right + 14,
      bottom: Math.max(12, window.innerHeight - rect.bottom),
    });
  }, []);

  const openMenu = useCallback(() => {
    updatePosition();
    setIsMounted(true);
  }, [updatePosition]);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  useLayoutEffect(() => {
    if (!isMounted) return;
    updatePosition();
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [isMounted, updatePosition]);

  useEffect(() => {
    if (!isMounted) return;
    const onResize = () => updatePosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [isMounted, updatePosition]);

  useEffect(() => {
    if (!isMounted) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMounted, closeMenu]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== menuRef.current) return;
    if (e.propertyName !== "transform") return;
    if (!isVisible) setIsMounted(false);
  };

  const handleLogout = async () => {
    try {
      await logoutRequest().unwrap();
    } catch {
      // Clear local session even if server logout fails.
    }
    dispatch(logout());
    closeMenu();
    navigate("/autorization", { replace: true });
  };

  const handleOpenSettings = () => {
    closeMenu();
    openSettings();
  };

  const handleTriggerClick = () => {
    if (isMounted && isVisible) closeMenu();
    else openMenu();
  };

  const menu = isMounted
    ? createPortal(
        <>
          <div
            className={[style.backdrop, isVisible ? style.backdropVisible : ""]
              .filter(Boolean)
              .join(" ")}
            aria-hidden
            onClick={closeMenu}
          />
          <div
            ref={menuRef}
            className={[style.menu, isVisible ? style.menuVisible : ""]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: position.left,
              bottom: position.bottom,
            }}
            role="menu"
            aria-label="Меню профиля"
            data-testid="profile-menu"
            data-open={isVisible ? "true" : "false"}
            onTransitionEnd={handleTransitionEnd}
          >
            <div className={style.profileCard}>
              <div className={style.avatarWrap}>
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className={style.avatar}
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

              <button
                type="button"
                className={style.logoutBtn}
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                aria-label="Выйти"
                role="menuitem"
              >
                <LogoutIcon />
              </button>
            </div>

            <button
              type="button"
              className={style.row}
              onClick={handleOpenSettings}
              role="menuitem"
            >
              <span>Настройки</span>
              <GearIcon />
            </button>

            <button
              type="button"
              className={style.addAccount}
              role="menuitem"
            >
              <span>Добавить аккаунт</span>
              <PlusIcon />
            </button>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label="Меню профиля"
        aria-haspopup="menu"
        aria-expanded={isVisible}
        data-testid="profile-menu-trigger"
        onClick={handleTriggerClick}
      >
        {triggerIcon}
      </button>
      {menu}
    </>
  );
};

export default ProfileMenu;
