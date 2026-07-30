import { ReactElement, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/shared";
import { FriendList } from "@/widget";
import { useGetFriends } from "@/widget/FriendList/hooks/useGetFriends";
import { PeopleRelationsView } from "@/page/shared/PeopleRelationsView";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import {
  useAcceptFriendRequestMutation,
  useGetIncomingFriendRequestsQuery,
} from "@/entities/friend/api";
import { useCreateChatMutation } from "@/entities/message/api/messagesApi";
import { Button } from "@/shared/ui";
import style from "./FriendPage.module.css";

type FilterTab = "all" | "online";

/**
 * FriendPage — страница друзей
 */
const FriendPage = (): ReactElement => {
  const { userId } = useParams<{ userId: string }>();
  const parsedId = userId ? Number(userId) : undefined;
  const targetId =
    parsedId !== undefined && Number.isFinite(parsedId) ? parsedId : undefined;

  const [searchParams] = useSearchParams();
  const isRequests = searchParams.get("section") === "requests" && !targetId;

  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const presence = useAppSelector((state) => state.presence.byUserId);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [messagingId, setMessagingId] = useState<number | null>(null);

  const { friends, total, isLoading, error, refetch } = useGetFriends(targetId);
  const requestsQuery = useGetIncomingFriendRequestsQuery(undefined, {
    skip: !isRequests,
  });
  const [acceptFriendRequest, acceptState] = useAcceptFriendRequestMutation();
  const [createChat] = useCreateChatMutation();

  const query = search.trim().toLowerCase();

  const onlineCount = useMemo(
    () => friends.filter((f) => presence[String(f.id)] === true).length,
    [friends, presence]
  );

  const filteredFriends = useMemo(() => {
    let list = friends;
    if (query) {
      list = list.filter((f) => f.username.toLowerCase().includes(query));
    }
    if (tab === "online") {
      list = list.filter((f) => presence[String(f.id)] === true);
    }
    return list;
  }, [friends, presence, query, tab]);

  const filteredRequests = useMemo(() => {
    const requests = requestsQuery.data?.requests ?? [];
    if (!query) return requests;
    return requests.filter((r) =>
      r.fromUser.username.toLowerCase().includes(query)
    );
  }, [requestsQuery.data?.requests, query]);

  const handleMessage = useCallback(
    async (peerId: number) => {
      if (!currentUser?.id || messagingId !== null) return;
      setMessagingId(peerId);
      try {
        const chat = await createChat({
          participantIds: [currentUser.id, peerId],
          isGroup: false,
        }).unwrap();
        navigate(`/messages/${chat.chatId}`);
      } catch {
        navigate("/messages");
      } finally {
        setMessagingId(null);
      }
    },
    [createChat, currentUser?.id, messagingId, navigate]
  );

  const handleAccept = async (requestId: number, targetUserId: number) => {
    try {
      await acceptFriendRequest({ requestId, targetUserId }).unwrap();
    } catch {
      /* toast optional */
    }
  };

  const pageLoading = isRequests
    ? requestsQuery.isLoading
    : isLoading;
  const pageError = isRequests
    ? requestsQuery.error
      ? "Не удалось загрузить заявки"
      : null
    : error;
  const onRetry = isRequests ? () => requestsQuery.refetch() : refetch;

  return (
    <PageLayout
      isLoading={pageLoading}
      error={pageError}
      onRetry={onRetry}
      contentClassName={style.contentWrapper}
      mainClassName={style.main}
      hideFooter={true}
    >
      <PeopleRelationsView
        activeSection={isRequests ? "requests" : "friends"}
        searchValue={search}
        onSearchChange={setSearch}
        showTabs={!isRequests}
        tabs={[
          { id: "all", label: "Все друзья", count: total || friends.length },
          { id: "online", label: "Друзья онлайн", count: onlineCount },
        ]}
        activeTabId={tab}
        onTabChange={(id) => setTab(id as FilterTab)}
      >
        {isRequests ? (
          filteredRequests.length === 0 ? (
            <div className={style.emptyRequests}>
              <p>Нет входящих заявок</p>
            </div>
          ) : (
            <ul className={style.requestList}>
              {filteredRequests.map((request) => {
                const user = request.fromUser;
                const initial = user.username.charAt(0).toUpperCase();
                return (
                  <li key={request.id} className={style.requestItem}>
                    <Link to={`/user/${user.id}`} className={style.requestLink}>
                      <div className={style.requestAvatar}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                      <span className={style.requestName}>{user.username}</span>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={acceptState.isLoading}
                      onClick={() => handleAccept(request.id, user.id)}
                    >
                      Принять
                    </Button>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          <FriendList
            friends={filteredFriends}
            onMessageClick={handleMessage}
            emptyTitle={
              tab === "online" ? "Нет друзей онлайн" : "Нет друзей"
            }
          />
        )}
      </PeopleRelationsView>
    </PageLayout>
  );
};

export default FriendPage;
