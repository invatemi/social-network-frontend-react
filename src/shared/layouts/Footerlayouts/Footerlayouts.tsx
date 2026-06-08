import { ReactElement } from "react";
import { env } from "@/shared/config/env";
import style from "./Footerlayouts.module.css";

/**
 * Компонент футера приложения
 * 
 * Отображает нижнюю часть страницы с:
 * - Брендом и описанием проекта
 * - Навигационными ссылками
 * - Социальными сетями (Telegram, GitHub, VK)
 * - Юридической информацией и копирайтом
 * 
 * @returns JSX-элемент футера
 */
const Footerlayouts = (): ReactElement => {
  // Динамическое получение текущего года для копирайта
  const currentYear = new Date().getFullYear();

  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <div className={style.brand}>
          <span className={style.logo}>MyApp</span>
          <p className={style.description}>
            Современные решения для вашего бизнеса. Просто, быстро и надёжно.
          </p>
        </div>

        {/* Навигация с aria-label для доступности */}
        <nav className={style.nav} aria-label="Навигация по сайту">
          <ul className={style.links}>
            <li><a href="/" className={style.link}>Главная</a></li>
            <li><a href="/about" className={style.link}>О нас</a></li>
            <li><a href="/services" className={style.link}>Услуги</a></li>
            <li><a href="/contact" className={style.link}>Контакты</a></li>
          </ul>
        </nav>

        {/* Социальные иконки с внешними ссылками */}
        <div className={style.socials}>
          <a href={env.socialLinks.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className={style.socialLink}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.53 8.15L14.8 17.2c-.18.82-.65 1.02-1.33.63l-3.66-2.7-1.76 1.7c-.2.2-.36.36-.74.36l.26-3.72 6.76-6.1c.3-.26-.06-.41-.45-.15l-8.34 5.25-3.6-1.12c-.78-.24-.8-.78.16-1.15L16.2 6.4c.64-.23 1.2.16.33 1.75z"/></svg>
          </a>
          <a href={env.socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={style.socialLink}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href={env.socialLinks.vk} target="_blank" rel="noopener noreferrer" aria-label="VK" className={style.socialLink}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 16.241s.288-.03.436-.193c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.372 1.257 2.195 1.814.62.42 1.088.328 1.088.328l2.186-.03s1.143-.07.6-.964c-.044-.073-.315-.658-1.618-1.85-1.365-1.25-1.183-1.05.462-3.216.997-1.31 1.395-2.107 1.27-2.452-.118-.328-.856-.242-.856-.242l-2.44.015s-.18-.024-.314.055c-.13.077-.214.264-.214.264s-.383 1.02-.89 1.88c-1.07 1.817-1.498 1.912-1.672 1.8-.406-.256-.304-1.03-.304-1.584 0-1.734.262-2.453-.51-2.64-.257-.062-.447-.103-1.105-.11-.843-.008-1.557.003-1.96.2-.27.133-.477.43-.35.447.156.02.51.095.696.35.24.326.231 1.05.231 1.05s.138 1.36-.17 1.528c-.212.116-.502-.12-.798-.765-.403-.877-.868-2.32-.868-2.32s-.073-.178-.202-.272c-.157-.114-.377-.15-.377-.15l-2.316.015s-.348.01-.475.16c-.113.134-.009.412-.009.412s1.195 2.787 2.54 4.183c1.23 1.278 2.627 1.194 2.627 1.194h.631z"/></svg>
          </a>
        </div>
      </div>

      {/* Нижняя панель с копирайтом и юридическими ссылками */}
      <div className={style.bottom}>
        <p className={style.copyright}>© {currentYear} MyApp. Все права защищены.</p>
        <div className={style.legal}>
          <a href="/privacy" className={style.legalLink}>Политика конфиденциальности</a>
          <a href="/terms" className={style.legalLink}>Условия использования</a>
        </div>
      </div>
    </footer>
  );
};

export default Footerlayouts;