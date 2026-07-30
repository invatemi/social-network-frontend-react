import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { NotificationItem } from "../NotificationItem";
import { useGetNotifications } from "../../hooks/useGetNotifications";
import { useAcceptFriendRequestMutation } from "@/entities/friend/api";
import { Spinner } from "@/shared/ui";
import style from "./NotificationModal.module.css";

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * NotificationModal — модальное окно заявок
 */
const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const { requests, isLoading, unreadCount } = useGetNotifications();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();

  const handleAccept = async (requestId: number, senderId: number) => {
    try {
      await acceptFriendRequest({ requestId, targetUserId: senderId }).unwrap();
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleDecline = () => {
    console.error("Decline friend request endpoint is not implemented in user-service");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={style.dialog} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={style.overlay} />
        </Transition.Child>

        <div className={style.container}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={style.panel}>
              <Dialog.Title className={style.title}>
                <span>Заявки в друзья</span>
                {unreadCount > 0 && (
                  <span className={style.badge}>{unreadCount}</span>
                )}
              </Dialog.Title>

              <div className={style.content}>
                {isLoading && (
                  <div className={style.loader}>
                    <Spinner size="md" />
                  </div>
                )}

                {!isLoading && requests.length === 0 && (
                  <div className={style.empty}>Нет входящих заявок</div>
                )}

                {!isLoading && requests.length > 0 && (
                  <div className={style.list}>
                    {requests.map((request) => (
                      <NotificationItem
                        key={request.id}
                        request={request}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button className={style.closeBtn} onClick={onClose}>
                Закрыть
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NotificationModal;
