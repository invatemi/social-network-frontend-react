import React from 'react';
import { NavLink } from 'react-router-dom';
import style from './AsidePageNav.module.css';

interface NavItem {
  label: string;
  path: string;
}

const AsidePageNav: React.FC = () => {
  const navItems: NavItem[] = [
    { label: 'Лента новостей', path: '/' },
    { label: 'Сообщения', path: '/messages' },
    { label: 'Друзья', path: '/friends/:userId?' },
    { label: 'Подписчики', path: '/followers/:userId?' },
  ];

  return (
    <aside className={style.asideNav}>
      <div className={style.navHeader}>
        <span className={style.navTitle}>NAV</span>
      </div>
      
      <nav className={style.navList}>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => 
              `${style.navLink} ${isActive ? style.navLinkActive : ''}`
            }
          >
            <span className={style.linkPrefix}>{`[${item.label.charAt(0)}]`}</span>
            <span className={style.linkLabel}>{item.label}</span>
            <span className={style.linkArrow}>{`→`}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className={style.navFooter}>
        <span className={style.navDivider}>
          {Array(24).fill("─").join("")}
        </span>
      </div>
    </aside>
  );
};

export default AsidePageNav;