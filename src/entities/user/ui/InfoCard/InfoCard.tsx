import { InfoCardProps } from "../../lib";
import style from "./InfoCard.module.css";

/**
 * InfoCard — карточка системной информации
 */
const InfoCard = ({ email, location, memberSince }: InfoCardProps) => {
  return (
    <div className={`${style.card} ${style.cardInfo}`}>
      <h3 className={style.cardTitle}>{`> SYSTEM_INFO`}</h3>
      <div className={style.infoList}>
        <div className={style.infoItem}>
          <span className={style.label}>{`> EMAIL:`}</span>
          <span className={style.value}>{email || "N/A"}</span>
        </div>
        <div className={style.infoItem}>
          <span className={style.label}>{`> LOCATION:`}</span>
          <span className={style.value}>{location || "UNSET"}</span>
        </div>
        <div className={style.infoItem}>
          <span className={style.label}>{`> MEMBER_SINCE:`}</span>
          <span className={style.value}>{memberSince || "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default InfoCard