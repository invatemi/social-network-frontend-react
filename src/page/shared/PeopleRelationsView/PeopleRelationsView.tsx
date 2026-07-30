import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import style from "./PeopleRelationsView.module.css";

export type RelationsSection = "friends" | "requests" | "followers";

export type RelationsTab = {
  id: string;
  label: string;
  count: number;
};

export type PeopleRelationsViewProps = {
  activeSection: RelationsSection;
  searchValue: string;
  onSearchChange: (value: string) => void;
  tabs?: RelationsTab[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  showTabs?: boolean;
  children: ReactNode;
};

const SIDE_LINKS: { section: RelationsSection; label: string; to: string }[] = [
  { section: "friends", label: "Все друзья", to: "/friends" },
  { section: "requests", label: "Заявки в друзья", to: "/friends?section=requests" },
  { section: "followers", label: "Подписки", to: "/followers" },
];

/**
 * PeopleRelationsView — общий shell для FriendPage / FollowerPage
 */
const PeopleRelationsView = ({
  activeSection,
  searchValue,
  onSearchChange,
  tabs = [],
  activeTabId,
  onTabChange,
  showTabs = true,
  children,
}: PeopleRelationsViewProps) => {
  return (
    <div className={style.root}>
      <section className={style.listPanel} aria-label="Список">
        <label className={style.searchField}>
          <span className={style.searchIcon} aria-hidden />
          <input
            type="search"
            className={style.searchInput}
            placeholder="Введите запрос"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
        </label>

        {showTabs && tabs.length > 0 && (
          <div className={style.tabs} role="tablist">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={[style.tab, isActive ? style.tabActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onTabChange?.(tab.id)}
                >
                  {tab.label} {tab.count}
                </button>
              );
            })}
          </div>
        )}

        <div key={`${activeSection}-${activeTabId ?? "none"}`} className={style.listFade}>
          {children}
        </div>
      </section>

      <aside className={style.sidePanel} aria-label="Разделы">
        <nav className={style.sideNav}>
          {SIDE_LINKS.map((link) => (
            <NavLink
              key={link.section}
              to={link.to}
              end={link.section === "friends"}
              className={() =>
                [
                  style.sideLink,
                  activeSection === link.section ? style.sideLinkActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default PeopleRelationsView;
