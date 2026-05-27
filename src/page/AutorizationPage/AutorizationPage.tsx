import { ReactElement } from "react";
import { PageLayout } from "@/shared";
import { Autorization } from "@/widget";
import style from "./AutorizationPage.module.css";

/**
 * AutorizationPage — страница входа
 */
const AutorizationPage = (): ReactElement => {
  return (
    <PageLayout
      mainClassName={style.main}
      contentClassName={style.container}
      centerContent={true}
      hideHeader={false}
      hideFooter={true}
      hideAside={true}
    >
      <Autorization />
    </PageLayout>
  );
};

export default AutorizationPage;