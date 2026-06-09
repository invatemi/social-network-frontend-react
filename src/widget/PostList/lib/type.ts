import { FeedPost } from "@/entities/post/api/postApi";

export type PostListProps = {
  userId?: number;
  isOwnProfile?: boolean;
  title?: string;
  
  posts?: FeedPost[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLike?: (postId: number) => void;
};