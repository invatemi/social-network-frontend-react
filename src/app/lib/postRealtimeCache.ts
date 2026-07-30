import { baseApi } from '@/app/store/api/baseApi';
import type { AppDispatch } from '@/app/store/types';

export type PostCacheState = {
  [baseApi.reducerPath]: ReturnType<typeof baseApi.reducer>;
};

type CachePost = {
  id: number;
  likesCount: number;
  commentsCount: number;
  content: string;
  imageUrl?: string;
  images?: string[];
  isLiked?: boolean;
};

type PostPatch = Partial<
  Pick<CachePost, 'likesCount' | 'commentsCount' | 'content' | 'imageUrl' | 'images'>
> & {
  isLiked?: boolean;
};

export type PostApiCacheClient = {
  util: {
    selectCachedArgsForQuery: (
      state: PostCacheState,
      endpointName: 'getFeedPosts' | 'getPosts'
    ) => readonly unknown[];
    updateQueryData: (
      endpointName: 'getFeedPosts' | 'getPosts',
      args: unknown,
      updateRecipe: (draft: { posts: CachePost[] }) => void
    ) => unknown;
  };
};

let postApiClient: PostApiCacheClient | null = null;

export const registerPostApiForCache = (api: PostApiCacheClient): void => {
  postApiClient = api;
};

const getPostApiClient = (): PostApiCacheClient => {
  if (!postApiClient) {
    throw new Error('postApi is not registered for cache updates');
  }

  return postApiClient;
};

const patchPosts = (posts: CachePost[], postId: number, patch: PostPatch): void => {
  const post = posts.find((item) => item.id === postId);
  if (!post) return;

  if (patch.likesCount !== undefined) post.likesCount = patch.likesCount;
  if (patch.commentsCount !== undefined) post.commentsCount = patch.commentsCount;
  if (patch.content !== undefined) post.content = patch.content;
  if (patch.imageUrl !== undefined) post.imageUrl = patch.imageUrl;
  if (patch.images !== undefined) post.images = patch.images;
  if (patch.isLiked !== undefined) post.isLiked = patch.isLiked;
};

export const patchPostInCaches = (
  dispatch: AppDispatch,
  state: PostCacheState,
  postId: number,
  patch: PostPatch
): void => {
  const api = getPostApiClient();
  const feedArgs = api.util.selectCachedArgsForQuery(state, 'getFeedPosts');

  for (const args of feedArgs) {
    dispatch(
      api.util.updateQueryData('getFeedPosts', args, (draft) => {
        patchPosts(draft.posts, postId, patch);
      }) as Parameters<AppDispatch>[0]
    );
  }

  const postsArgs = api.util.selectCachedArgsForQuery(state, 'getPosts');

  for (const args of postsArgs) {
    dispatch(
      api.util.updateQueryData('getPosts', args, (draft) => {
        patchPosts(draft.posts, postId, patch);
      }) as Parameters<AppDispatch>[0]
    );
  }
};

/** Оптимистичный toggle лайка; возвращает предыдущие значения для отката. */
export const optimisticToggleLikeInCaches = (
  dispatch: AppDispatch,
  state: PostCacheState,
  postId: number
): { likesCount: number; isLiked: boolean } | null => {
  const api = getPostApiClient();
  let snapshot: { likesCount: number; isLiked: boolean } | null = null;

  const apply = (posts: CachePost[]) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    if (!snapshot) {
      snapshot = { likesCount: post.likesCount, isLiked: Boolean(post.isLiked) };
    }
    const nextLiked = !post.isLiked;
    post.isLiked = nextLiked;
    post.likesCount = Math.max(0, post.likesCount + (nextLiked ? 1 : -1));
  };

  for (const args of api.util.selectCachedArgsForQuery(state, 'getFeedPosts')) {
    dispatch(
      api.util.updateQueryData('getFeedPosts', args, (draft) => {
        apply(draft.posts);
      }) as Parameters<AppDispatch>[0]
    );
  }

  for (const args of api.util.selectCachedArgsForQuery(state, 'getPosts')) {
    dispatch(
      api.util.updateQueryData('getPosts', args, (draft) => {
        apply(draft.posts);
      }) as Parameters<AppDispatch>[0]
    );
  }

  return snapshot;
};

/** Сдвигает commentsCount в кэше ленты/постов (для мгновенной анимации счётчика). */
export const bumpCommentsCountInCaches = (
  dispatch: AppDispatch,
  state: PostCacheState,
  postId: number,
  delta: number
): void => {
  const api = getPostApiClient();

  const bump = (posts: CachePost[]) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    post.commentsCount = Math.max(0, post.commentsCount + delta);
  };

  for (const args of api.util.selectCachedArgsForQuery(state, 'getFeedPosts')) {
    dispatch(
      api.util.updateQueryData('getFeedPosts', args, (draft) => {
        bump(draft.posts);
      }) as Parameters<AppDispatch>[0]
    );
  }

  for (const args of api.util.selectCachedArgsForQuery(state, 'getPosts')) {
    dispatch(
      api.util.updateQueryData('getPosts', args, (draft) => {
        bump(draft.posts);
      }) as Parameters<AppDispatch>[0]
    );
  }
};

export const removePostFromCaches = (
  dispatch: AppDispatch,
  state: PostCacheState,
  postId: number
): void => {
  const api = getPostApiClient();
  const feedArgs = api.util.selectCachedArgsForQuery(state, 'getFeedPosts');

  for (const args of feedArgs) {
    dispatch(
      api.util.updateQueryData('getFeedPosts', args, (draft) => {
        draft.posts = draft.posts.filter((post) => post.id !== postId);
      }) as Parameters<AppDispatch>[0]
    );
  }

  const postsArgs = api.util.selectCachedArgsForQuery(state, 'getPosts');

  for (const args of postsArgs) {
    dispatch(
      api.util.updateQueryData('getPosts', args, (draft) => {
        draft.posts = draft.posts.filter((post) => post.id !== postId);
      }) as Parameters<AppDispatch>[0]
    );
  }
};
