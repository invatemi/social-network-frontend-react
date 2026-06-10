import { baseApi } from "@/app/store/api/baseApi";

export type CommentAuthor = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

export type Comment = {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  author: CommentAuthor;
};

export type CommentListResponse = {
  comments: Comment[];
};

export type CreateCommentInput = {
  postId: number;
  content: string;
};

export type DeleteComment = {
  commentId: number;
  postId: number;
};

export type DeleteCommentResponse = { message: string };

type CommentDto = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
};

type CommentsListApiDto = {
  success?: boolean;
  comments: CommentDto[];
  total?: number;
  post?: { id: number };
};

type CommentApiDto = {
  success?: boolean;
  comment: CommentDto;
};

type DeleteCommentApiDto = {
  success?: boolean;
  message: string;
};

const mapCommentDto = (comment: CommentDto): Comment => ({
  id: comment.id,
  postId: comment.postId,
  content: comment.content,
  createdAt: comment.createdAt,
  author: {
    id: comment.userId,
    username: `user_${comment.userId}`,
    avatarUrl: null,
  },
});

/**
 * Comment API endpoints for post comments management.
 */
export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches comments for a specific post.
     * @param postId - Target post ID
     * @returns List of comments with pagination metadata
     */
    getComments: builder.query<CommentListResponse, { postId: number }>({
      query: ({ postId }) => `/api/comments/post/${postId}`,
      transformResponse: (response: CommentsListApiDto): CommentListResponse => ({
        comments: (response.comments ?? []).map(mapCommentDto),
      }),
      providesTags: (result, _error, { postId }) => {
        const listTag = { type: "Comments" as const, id: `LIST_${postId}` };
        if (!result) return [listTag];

        const entityTags = result.comments.map(({ id }) => ({
          type: "Comments" as const,
          id,
        }));
        return [...entityTags, listTag];
      },
    }),

    /**
     * Creates a new comment for a post.
     * @param input - Comment creation payload
     * @returns The created comment object
     */
    createComment: builder.mutation<Comment, CreateCommentInput>({
      query: ({ postId, content }) => ({
        url: "/api/comments",
        method: "POST",
        body: { postId, content },
      }),
      transformResponse: (response: CommentApiDto): Comment =>
        mapCommentDto(response.comment),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Comments" as const, id: `LIST_${postId}` },
        { type: "Posts" as const },
      ],
    }),

    deleteComment: builder.mutation<DeleteCommentResponse, DeleteComment>({
      query: ({ commentId }) => ({
        url: `/api/comments/${commentId}`,
        method: "DELETE",
      }),
      transformResponse: (response: DeleteCommentApiDto): DeleteCommentResponse => ({
        message: response.message,
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Comments" as const, id: `LIST_${postId}` },
        { type: "Posts" as const },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
