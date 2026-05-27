import { Button } from "@/shared/ui/Button";
import { ChangePasswordCardProps } from "../../lib";
import style from "@/page/UserDetailPage/UserDetailPage.module.css";

/**
 * ChangePasswordCard — триггер смены пароля
 */
const ChangePasswordCard = ({ onClick, disabled = false }: ChangePasswordCardProps) => {
  return (
    <div className={`${style.card} ${style.cardPasswordBtn}`}>
      <h3 className={style.cardTitle}>{`> SECURITY`}</h3>
      <p className={style.hint} style={{ marginBottom: "1rem" }}>
        {`// изменить_пароль?`}
      </p>
      
      <Button
        variant="secondary"
        size="md"
        fullWidth
        onClick={onClick}
        disabled={disabled}
      >
        {`[CHANGE_PASSWORD]`}
      </Button>
    </div>
  );
};

export default ChangePasswordCard