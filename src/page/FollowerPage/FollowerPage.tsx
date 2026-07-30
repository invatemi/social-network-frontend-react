import { ReactElement, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/shared";
import { FollowerList } from "@/widget";
import { useGetFollowers } from "@/widget/FollowerList/hooks/useGetFollowers";
import { PeopleRelationsView } from "@/page/shared/PeopleRelationsView";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import { useCreateChatMutation } from "@/entities/message/api/messagesApi";
import style from "./FollowerPage.module.css";

type FilterTab = "all" | "online";

/**
 * FollowerPage — страница подписок / подписчиков
 */
const FollowerPage = (): ReactElement => {
  const { userId } = useParams<{ userId: string }>();
  const parsedId = userId ? Number(userId) : undefined;
  const targetId =
    parsedId !== undefined && Number.isFinite(parsedId) ? parsedId : undefined;

  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const presence = useAppSelector((state) => state.presence.byUserId);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [messagingId, setMessagingId] = useState<number | null>(null);

  const { followers, total, isLoading, error, refetch } =
    useGetFollowers(targetId);

  const [createChat] = useCreateChatMutation();

  const query = search.trim().toLowerCase();

  const onlineCount = useMemo(
    () => followers.filter((f) => presence[String(f.id)] === true).length,
    [followers, presence]
  );

  const filteredFollowers = useMemo(() => {
    let list = followers;
    if (query) {
      list = list.filter((f) => f.username.toLowerCase().includes(query));
    }
    if (tab === "online") {
      list = list.filter((f) => presence[String(f.id)] === true);
    }
    return list;
  }, [followers, presence, query, tab]);

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

  return (
    <PageLayout
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      contentClassName={style.contentWrapper}
      mainClassName={style.main}
      hideFooter={true}
    >
      <PeopleRelationsView
        activeSection="followers"
        searchValue={search}
        onSearchChange={setSearch}
        tabs={[
          { id: "all", label: "Все подписки", count: total || followers.length },
          { id: "online", label: "Онлайн", count: onlineCount },
        ]}
        activeTabId={tab}
        onTabChange={(id) => setTab(id as FilterTab)}
      >
        <FollowerList
          followers={filteredFollowers}
          onMessageClick={handleMessage}
          emptyTitle={tab === "online" ? "Никого нет онлайн" : "Нет подписок"}
        />
      </PeopleRelationsView>
    </PageLayout>
  );
};

export default FollowerPage;
