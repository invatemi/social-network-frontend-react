import { Input } from "@/shared";
import { DescriptionCardProps } from "../../lib";
import style from "./DescriptionCard.module.css";

/**
 * DescriptionCard — поле био
 */
const DescriptionCard = ({ value, onChange }: DescriptionCardProps) => {
  return (
    <div className={`${style.card} ${style.cardDescription}`}>
      <h3 className={style.cardTitle}>{`> BIO`}</h3>
      <Input
        as="textarea"
        id="profile-bio"
        value={value ?? undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"> расскажите о себе..."}
        maxLength={200}
        rows={4}
        fullWidth
        helperText={`[${value?.length ?? 0}/200]`}
      />
    </div>
  );
};

export default DescriptionCard