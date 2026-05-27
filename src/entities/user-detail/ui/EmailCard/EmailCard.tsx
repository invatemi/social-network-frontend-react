import { Input } from "@/shared";
import { EmailCardProps } from "../../lib";
import style from "./EmailCard.module.css";

/**
 * EmailCard — поле email
 */
const EmailCard = ({ value, onChange }: EmailCardProps) => {
  return (
    <div className={`${style.card} ${style.cardEmail}`}>
      <h3 className={style.cardTitle}>{`> EMAIL`}</h3>
      <Input
        type="email"
        id="profile-email"
        value={value ?? undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"> you@example.com"}
        fullWidth
        helperText={"// используется для восстановления"}
        autoComplete="email"
      />
    </div>
  );
};

export default EmailCard