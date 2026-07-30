import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Footerlayouts } from "../Footerlayouts";
import { AsidePageNav, Spinner, Button } from "@/shared/ui";
import style from "./PageLayout.module.css";

export type PageLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  fullWidth?: boolean;
  withContainer?: boolean;
  mainClassName?: string;
  contentClassName?: string;
  pageClassName?: string;
  hideFooter?: boolean;
  hideAside?: boolean;
  centerContent?: boolean;
};

/**
 * PageLayout - основной лейаут страницы
 */
const PageLayout = ({
  children,
  title,
  subtitle,
  isLoading = false,
  error = null,
  onRetry,
  mainClassName = "",
  contentClassName = "",
  pageClassName = "",
  hideFooter = false,
  hideAside = false,
  centerContent = false,
}: PageLayoutProps) => {
  const location = useLocation();
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  const [contentVisible, setContentVisible] = useState(false);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setContentVisible(false);
  }

  useEffect(() => {
    if (contentVisible) return;

    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setContentVisible(true);
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [location.pathname, contentVisible]);

  const enterClassName = [
    style.pageEnter,
    contentVisible ? style.pageEnterVisible : "",
    centerContent ? style.centeredMain : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <div className={`${style.page} ${pageClassName}`}>
        <div className={style.layout}>
          {!hideAside && <AsidePageNav />}
          <main className={`${style.main} ${mainClassName}`}>
            <div className={style.centered}>
              <div className={style.statusPanel}>
                <Spinner size="lg" />
                <p className={style.loadingText}>Загрузка...</p>
              </div>
            </div>
          </main>
        </div>
        {!hideFooter && <Footerlayouts />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${style.page} ${pageClassName}`}>
        <div className={style.layout}>
          {!hideAside && <AsidePageNav />}
          <main className={`${style.main} ${mainClassName}`}>
            <div className={style.centered}>
              <div className={style.statusPanel}>
                <p className={style.errorTitle}>Ошибка</p>
                <p className={style.errorMessage}>{error}</p>
                {onRetry && (
                  <Button variant="primary" size="md" onClick={onRetry}>
                    Повторить
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
        {!hideFooter && <Footerlayouts />}
      </div>
    );
  }

  return (
    <div className={`${style.page} ${pageClassName}`}>
      <div className={style.layout}>
        {!hideAside && <AsidePageNav />}

        <main className={`${style.main} ${mainClassName}`}>
          <div key={location.pathname} className={enterClassName}>
            {(title || subtitle) && !centerContent && (
              <header className={style.pageHeader}>
                {title && <h1 className={style.pageTitle}>{title}</h1>}
                {subtitle && <p className={style.pageSubtitle}>{subtitle}</p>}
              </header>
            )}

            <div className={`${style.contentWrapper} ${contentClassName}`}>
              {children}
            </div>
          </div>
        </main>
      </div>

      {!hideFooter && <Footerlayouts />}
    </div>
  );
};

export default PageLayout;
