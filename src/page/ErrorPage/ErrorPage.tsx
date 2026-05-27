import { ReactElement } from "react";
import { PageLayout } from "@/shared";
import style from "./ErrorPage.module.css";

/**
 * ErrorPage — страница ошибки 404
 */
const ErrorPage = (): ReactElement => {
  const goHome = () => (window.location.href = "/");
  const goBack = () => window.history.back();

  return (
    <PageLayout
      mainClassName={style.main}
      contentClassName={style.container}
      hideFooter={true}
      hideAside={true}
    >
      <span className={style.errorCode}>{`[404]`}</span>
      <h1 className={style.title}>{`> page_not_found`}</h1>
      <p className={style.description}>
        {`// requested_page_removed_or_unavailable`}
      </p>
      <div className={style.actions}>
        <button className={style.btnHome} onClick={goHome}>
          {`[home]`}
        </button>
        <button className={style.btnBack} onClick={goBack}>
          {`[<] back`}
        </button>
      </div>
    </PageLayout>
  );
};

export default ErrorPage;