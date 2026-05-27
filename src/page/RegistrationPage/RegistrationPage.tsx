import { ReactElement } from "react";
import { PageLayout } from "@/shared";
import { Registration } from "@/widget";
import style from "./RegistrationPage.module.css";

/**
 * RegistrationPage — страница регистрации
 */
const RegistrationPage = (): ReactElement => {
  return (
    <PageLayout
      mainClassName={style.main}
      contentClassName={style.container}
      hideAside={true}
      centerContent
    >
      <Registration />
    </PageLayout>
  );
};

export default RegistrationPage;