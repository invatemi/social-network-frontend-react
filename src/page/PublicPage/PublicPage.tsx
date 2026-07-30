import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { ProfileView } from "../shared/ProfileView";

/**
 * PublicPage — публичный профиль (макет Figma)
 */
const PublicPage = (): ReactElement => {
  const { userId } = useParams<{ userId: string }>();

  return <ProfileView userId={userId ? Number(userId) : undefined} />;
};

export default PublicPage;
