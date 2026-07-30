import { ReactElement } from "react";
import { Button, PageLayout } from "@/shared";
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
      <span className={style.errorCode}>404</span>
      <h1 className={style.title}>Страница не найдена</h1>
      <p className={style.description}>
        Запрашиваемая страница удалена или недоступна.
      </p>
      <div className={style.actions}>
        <Button variant="primary" size="md" onClick={goHome}>
          На главную
        </Button>
        <Button variant="secondary" size="md" onClick={goBack}>
          Назад
        </Button>
      </div>
    </PageLayout>
  );
};

export default ErrorPage;
