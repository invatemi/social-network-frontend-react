import { ReactElement } from "react";
import { ProfileView } from "../shared/ProfileView";

/**
 * UserPage — личный профиль (макет Figma)
 */
const UserPage = (): ReactElement => {
  return <ProfileView showCreatePost />;
};

export default UserPage;
