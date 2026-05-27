import { useState } from "react";
import { Input } from "@/shared";
import { PasswordConfirmCardProps } from "../../lib";
import style from "./PasswordConfirmCard.module.css";

/**
 * ASCII-иконки для toggle пароля
 */
const EyeIcon = () => <span className={style.iconAscii}>{`[SHOW]`}</span>;
const EyeOffIcon = () => <span className={style.iconAscii}>{`[HIDE]`}</span>;

/**
 * PasswordConfirmCard — поле подтверждения
 */
const PasswordConfirmCard = ({ value, onChange }: PasswordConfirmCardProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`${style.card} ${style.cardConfirm}`}>
      <h3 className={style.cardTitle}>{`> CONFIRM`}</h3>
      <Input
        type={showPassword ? "text" : "password"}
        id="profile-password-confirm"
        value={value ?? undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"> введите пароль"}
        fullWidth
        helperText={"// требуется для безопасности"}
        rightIcon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
        onRightIconClick={() => setShowPassword(!showPassword)}
        autoComplete="current-password"
      />
    </div>
  );
};

export default PasswordConfirmCard