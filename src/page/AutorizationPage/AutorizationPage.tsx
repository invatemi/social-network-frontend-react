import { ReactElement, useEffect } from "react";
import { PageLayout } from "@/shared";
import { Autorization } from "@/widget";
import style from "./AutorizationPage.module.css";

/**
 * AutorizationPage — страница входа
 */
const AutorizationPage = (): ReactElement => {
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  return (
    <PageLayout
      pageClassName={style.page}
      mainClassName={style.main}
      contentClassName={style.container}
      centerContent={true}
      hideFooter={true}
      hideAside={true}
    >
      <Autorization />
    </PageLayout>
  );
};

export default AutorizationPage;
