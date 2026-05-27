import { ReactNode } from "react";
import { Headerlayouts } from "../Headerlayouts";
import { Footerlayouts } from "../Footerlayouts";
import { 
  AsidePageNav, 
  Spinner, 
  Button } from "@/shared/ui";
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
  hideHeader?: boolean;
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
  hideHeader = false,
  hideFooter = false,
  hideAside = false,
  centerContent = false,
}: PageLayoutProps) => {
  
  if (isLoading) {
    return (
      <div className={style.page}>
        {!hideHeader && <Headerlayouts />}
        <div className={style.layout}>
          {!hideAside && <AsidePageNav />}
          <main className={`${style.main} ${mainClassName}`}>
            <div className={style.centered}>
              <div className={style.terminalBox}>
                <div className={style.terminalHeader}>
                  <span className={style.terminalDot} style={{ background: "#ef4444" }} />
                  <span className={style.terminalDot} style={{ background: "#eab308" }} />
                  <span className={style.terminalDot} style={{ background: "#22c55e" }} />
                  <span className={style.terminalTitle}>system</span>
                </div>
                <div className={style.terminalContent}>
                  <Spinner size="lg" />
                  <p className={style.loadingText}>{`> loading...`}</p>
                  <p className={style.loadingSubtext}>{`[====____________] 35%`}</p>
                </div>
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
      <div className={style.page}>
        {!hideHeader && <Headerlayouts />}
        <div className={style.layout}>
          {!hideAside && <AsidePageNav />}
          <main className={`${style.main} ${mainClassName}`}>
            <div className={style.centered}>
              <div className={style.terminalBox}>
                <div className={style.terminalHeader}>
                  <span className={style.terminalDot} style={{ background: "#ef4444" }} />
                  <span className={style.terminalDot} style={{ background: "#eab308" }} />
                  <span className={style.terminalDot} style={{ background: "#22c55e" }} />
                  <span className={style.terminalTitle}>error</span>
                </div>
                <div className={style.terminalContent}>
                  <div className={style.errorBox}>
                    <pre className={style.errorAscii}>
                      {`
  ╔═══════════════════════╗
  ║   ⚠ SYSTEM ERROR    ║
  ═══════════════════════╝
                      `}
                    </pre>
                    <p className={style.errorMessage}>{`> ${error}`}</p>
                    {onRetry && (
                      <Button variant="primary" size="md" onClick={onRetry} className={style.retryButton}>
                        {`> retry_connection()`}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        {!hideFooter && <Footerlayouts />}
      </div>
    );
  }

  return (
    <div className={style.page}>
      {!hideHeader && <Headerlayouts />}
      
      <div className={style.layout}>
        {!hideAside && <AsidePageNav />}
        
        <main className={style.main}>
          <div className={centerContent ? style.centeredMain : ""}>
            
            {(title || subtitle) && !centerContent && (
              <header className={style.pageHeader}>
                {title && (
                  <div className={style.titleBlock}>
                    <pre className={style.titleAscii}>
                      {`┌${"─".repeat(Math.min(title.length, 60))}┐`}
                    </pre>
                    <h1 className={style.pageTitle}>{`> ${title}`}</h1>
                    <pre className={style.titleAscii}>
                      {`└${"─".repeat(Math.min(title.length, 60))}┘`}
                    </pre>
                  </div>
                )}
                {subtitle && <p className={style.pageSubtitle}>{`// ${subtitle}`}</p>}
                <div className={style.headerSeparator}>
                  {Array(80).fill("─").join("")}
                </div>
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