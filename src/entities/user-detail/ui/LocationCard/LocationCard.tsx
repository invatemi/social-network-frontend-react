import { Input } from "@/shared";
import { LocationCardProps } from "../../lib";
import style from "./LocationCard.module.css";

/**
 * LocationCard — поле локации
 */
const LocationCard = ({ value, onChange }: LocationCardProps) => {
  return (
    <div className={`${style.card} ${style.cardLocation}`}>
      <h3 className={style.cardTitle}>{`> LOCATION`}</h3>
      <Input
        type="text"
        id="profile-location"
        value={value ?? undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"> город, страна"}
        maxLength={100}
        fullWidth
        helperText={"// введите местоположение"}
        autoComplete="address-level2"
      />
    </div>
  );
};

export default LocationCard