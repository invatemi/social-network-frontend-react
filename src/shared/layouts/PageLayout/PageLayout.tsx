import { ReactNode, useEffect, useState, type TransitionEvent } from "react";
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
 * Ключ анимации входа: игнорирует числовые сегменты URL
 * (/messages/12 → /messages), чтобы смена ресурса внутри страницы
 * не мигала контентом заново.
 */
const getPageEnterKey = (pathname: string): string => {
  const normalized = pathname
    .replace(/\/\d+(?=\/|$)/g, "")
    .replace(/\/+$/, "");
  return normalized || "/";
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
  const enterKey = getPageEnterKey(location.pathname);
  const [prevEnterKey, setPrevEnterKey] = useState(enterKey);
  const [contentVisible, setContentVisible] = useState(false);
  const [enterSettled, setEnterSettled] = useState(false);

  if (enterKey !== prevEnterKey) {
    setPrevEnterKey(enterKey);
    setContentVisible(false);
    setEnterSettled(false);
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
  }, [enterKey, contentVisible]);

  useEffect(() => {
    if (!contentVisible || enterSettled) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEnterSettled(true);
      return;
    }

    const timeoutId = window.setTimeout(() => setEnterSettled(true), 700);
    return () => window.clearTimeout(timeoutId);
  }, [contentVisible, enterSettled]);

  const enterClassName = [
    style.pageEnter,
    contentVisible ? style.pageEnterVisible : "",
    enterSettled ? style.pageEnterSettled : "",
    centerContent ? style.centeredMain : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleEnterTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform" && event.propertyName !== "opacity") return;
    setEnterSettled(true);
  };
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
          <div
            key={enterKey}
            className={enterClassName}
            onTransitionEnd={handleEnterTransitionEnd}
          >
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
