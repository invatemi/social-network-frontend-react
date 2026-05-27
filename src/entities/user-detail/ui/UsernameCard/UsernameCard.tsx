import { Input } from "@/shared";
import { UsernameCardProps } from "../../lib";
import style from "./UsernameCard.module.css";

/**
 * UsernameCard — поле имени
 */
const UsernameCard = ({ value, onChange }: UsernameCardProps) => {
  return (
    <div className={`${style.card} ${style.cardUsername}`}>
      <h3 className={style.cardTitle}>{`> USERNAME`}</h3>
      <Input
        type="text"
        id="profile-username"
        value={value ?? undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"> введите имя"}
        maxLength={20}
        minLength={3}
        fullWidth
        helperText={"[3-20 символов]"}
        autoComplete="username"
      />
    </div>
  );
};

export default UsernameCard