import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { 
  selectIsAuthenticated, 
  selectUser, 
  logout,
} from "@/app/store/slices/authSlice";
import { useLogoutMutation } from "@/app/store/api/authApi";
import { SearchInput } from "@/feature";
import { Button, SocketStatus } from "@/shared/ui";
import { NotificationButton } from "@/feature";
import style from "./Headerlayouts.module.css";

/**
 * Headerlayouts — шапка
 */
const Headerlayouts = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [logoutRequest] = useLogoutMutation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const avatarUrl = user?.avatarUrl;
  const username = user?.username || "";
  const initial = (username || "U").charAt(0).toUpperCase();

  useEffect(() => { setAvatarError(false); }, [avatarUrl]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setIsMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);
  
  const handleLogout = async () => {
    try {
      await logoutRequest().unwrap();
    } catch {
      // Clear local session even if server logout fails.
    }
    dispatch(logout());
    setIsMenuOpen(false);
    navigate("/autorization", { replace: true });
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={style.header}>
      <div className={style.container}>
        {/* Логотип в стиле терминала */}
        <Link to="/" className={style.logo} aria-label="На главную">
          <span className={style.logoText}>MyApp</span>
        </Link>

        <div className={style.statusGroup}>
          <NotificationButton />
          <SocketStatus />
        </div>

        {/* Навигация */}
        <nav className={`${style.nav} ${isMenuOpen ? style.navOpen : ""}`} aria-label="Основная навигация">
          <SearchInput />
        </nav>

        {isAuthenticated ? (
          <div className={style.authActions}>
            <Link to="/user" className={style.profileLink} aria-label="Перейти в профиль">
              <div className={style.avatarWrapper}>
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
                  <div className={`${style.avatarPlaceholder} ${style.show}`}>
                    {`[${initial}]`}
                  </div>
                )}
              </div>
              <span className={style.userName}>{`@${username}`}</span>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className={style.btnLogoutCustom}
            >
              {`[logout]`}
            </Button>
          </div>
        ) : (
          <div className={style.authButtons}>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleNavigate("/autorization")}
              className={style.authButton}
            >
              {`> login`}
            </Button>
            
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => handleNavigate("/registration")}
              className={style.authButton}
            >
              {`> register`}
            </Button>
          </div>
        )}
      </div>

      {/* ASCII разделитель под хедером */}
      <div className={style.headerDivider}>
        {Array(120).fill("═").join("")}
      </div>

      {isMenuOpen && <div className={style.overlay} onClick={() => setIsMenuOpen(false)} />}
    </header>
  );
};

export default Headerlayouts;