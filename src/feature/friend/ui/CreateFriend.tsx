import { ReactElement, useMemo } from "react";
import { Button } from "@/shared";
import { useCreateFriend } from "../hooks";
import { FriendStatus } from "../lib";
import style from "./CreateFriend.module.css";

type CreateFriendProps = {
  targetUserId: number;
  initialStatus?: FriendStatus;
  isRequestReceiver?: boolean;
  className?: string;
  currentUserId?: number;
};

/**
 * CreateFriend — кнопка управления дружбой
 */
const CreateFriend = ({
  targetUserId,
  initialStatus = "none",
  isRequestReceiver = false,
  className,
  currentUserId,
}: CreateFriendProps): ReactElement => {
  const {
    status,
    isFollowing,
    isLoading,
    error,
    handleAddFriend,
    handleCancelRequest,
    handleAcceptRequest,
    handleDeclineRequest,
    handleRemoveFriend,
    handleUnfollow,
  } = useCreateFriend(targetUserId, initialStatus, undefined, currentUserId);

  const buttonText = useMemo(() => {
    if (status === "friends") return "В друзьях";
    if (status === "pending") {
      if (isRequestReceiver) return "Принять";
      return "Заявка отправлена";
    }
    if (isFollowing) return "Вы подписаны";
    return "Добавить в друзья";
  }, [status, isFollowing, isRequestReceiver]);

  const renderButton = () => {
    if (isLoading) {
      return (
        <Button variant="secondary" size="sm" loading disabled className={className}>
          Загрузка
        </Button>
      );
    }

    if (error) {
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
          className={`${className} ${style.error}`}
        >
          Повторить
        </Button>
      );
    }

    if (status === "friends") {
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRemoveFriend}
          className={`${className} ${style.friends}`}
        >
          {buttonText}
        </Button>
      );
    }

    if (status === "pending" && !isRequestReceiver) {
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCancelRequest}
          className={`${className} ${style.pending}`}
        >
          {buttonText}
        </Button>
      );
    }

    if (status === "pending" && isRequestReceiver) {
      return (
        <div className={`${className} ${style.requestGroup}`}>
          <Button
            variant="success"
            size="sm"
            onClick={handleAcceptRequest}
            className={style.accept}
          >
            Принять
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeclineRequest}
            className={style.decline}
          >
            Отклонить
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={isFollowing ? handleUnfollow : handleAddFriend}
        className={`${className} ${style.add}`}
      >
        {buttonText}
      </Button>
    );
  };

  return <>{renderButton()}</>;
};

export default CreateFriend;
