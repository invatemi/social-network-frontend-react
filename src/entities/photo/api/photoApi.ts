import { baseApi } from "@/app/store/api/baseApi";

export type PhotoDto = {
  id: number;
  userId: number;
  url: string;
  isCurrent: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
};

export type PhotoCommentAuthor = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

export type PhotoComment = {
  id: number;
  photoId: number;
  userId: number;
  content: string;
  createdAt: string;
  author: PhotoCommentAuthor;
};

type PhotosListDto = {
  success?: boolean;
  photos: PhotoDto[];
};

type PhotoLikeDto = {
  success?: boolean;
  liked: boolean;
  likesCount: number;
};

type PhotoCommentsDto = {
  success?: boolean;
  comments: PhotoComment[];
  total?: number;
};

type PhotoCommentDto = {
  success?: boolean;
  comment: PhotoComment;
};

type DeletePhotoDto = {
  success?: boolean;
  deletedId: number;
};

type DeleteCommentDto = {
  success?: boolean;
  message: string;
};

/**
 * Photo API — история аватаров (галерея), лайки и комментарии.
 */
export const photoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPhotos: builder.query<PhotoDto[], void>({
      query: () => "/api/users/me/photos",
      transformResponse: (response: PhotosListDto): PhotoDto[] =>
        response.photos ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Photos" as const, id })),
              { type: "Photos", id: "ME" },
              { type: "Photos", id: "LIST" },
            ]
          : [
              { type: "Photos", id: "ME" },
              { type: "Photos", id: "LIST" },
            ],
    }),

    getUserPhotos: builder.query<PhotoDto[], number>({
      query: (userId) => `/api/users/${userId}/photos`,
      transformResponse: (response: PhotosListDto): PhotoDto[] =>
        response.photos ?? [],
      providesTags: (result, _error, userId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Photos" as const, id })),
              { type: "Photos", id: `USER_${userId}` },
              { type: "Photos", id: "LIST" },
            ]
          : [
              { type: "Photos", id: `USER_${userId}` },
              { type: "Photos", id: "LIST" },
            ],
    }),

    deletePhoto: builder.mutation<{ deletedId: number }, number>({
      query: (photoId) => ({
        url: `/api/photos/${photoId}`,
        method: "DELETE",
      }),
      transformResponse: (response: DeletePhotoDto) => ({
        deletedId: response.deletedId,
      }),
      invalidatesTags: (_result, _error, photoId) => [
        { type: "Photos", id: photoId },
        { type: "Photos", id: "LIST" },
        { type: "Photos", id: "ME" },
        "UserMe",
        "User",
      ],
    }),

    togglePhotoLike: builder.mutation<
      { liked: boolean; likesCount: number },
      { photoId: number }
    >({
      query: ({ photoId }) => ({
        url: `/api/photos/${photoId}/like`,
        method: "POST",
      }),
      transformResponse: (response: PhotoLikeDto) => ({
        liked: response.liked,
        likesCount: response.likesCount,
      }),
      async onQueryStarted({ photoId }, { dispatch, queryFulfilled, getState }) {
        const applyOptimistic = (draft: PhotoDto[]) => {
          const photo = draft.find((item) => item.id === photoId);
          if (!photo) return;
          photo.isLiked = !photo.isLiked;
          photo.likesCount = Math.max(
            0,
            photo.likesCount + (photo.isLiked ? 1 : -1)
          );
        };

        const applyResult = (
          draft: PhotoDto[],
          data: { liked: boolean; likesCount: number }
        ) => {
          const photo = draft.find((item) => item.id === photoId);
          if (!photo) return;
          photo.isLiked = data.liked;
          photo.likesCount = data.likesCount;
        };

        const patches = [
          dispatch(
            photoApi.util.updateQueryData("getMyPhotos", undefined, applyOptimistic)
          ),
        ];

        const state = getState() as {
          baseApi?: {
            queries?: Record<
              string,
              { endpointName?: string; originalArgs?: unknown }
            >;
          };
        };

        for (const entry of Object.values(state.baseApi?.queries ?? {})) {
          if (
            entry?.endpointName === "getUserPhotos" &&
            typeof entry.originalArgs === "number"
          ) {
            patches.push(
              dispatch(
                photoApi.util.updateQueryData(
                  "getUserPhotos",
                  entry.originalArgs,
                  applyOptimistic
                )
              )
            );
          }
        }

        try {
          const { data } = await queryFulfilled;
          dispatch(
            photoApi.util.updateQueryData("getMyPhotos", undefined, (draft) =>
              applyResult(draft, data)
            )
          );
          for (const entry of Object.values(state.baseApi?.queries ?? {})) {
            if (
              entry?.endpointName === "getUserPhotos" &&
              typeof entry.originalArgs === "number"
            ) {
              dispatch(
                photoApi.util.updateQueryData(
                  "getUserPhotos",
                  entry.originalArgs,
                  (draft) => applyResult(draft, data)
                )
              );
            }
          }
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (_result, _error, { photoId }) => [
        { type: "Photos", id: photoId },
        { type: "Photos", id: "LIST" },
      ],
    }),

    getPhotoComments: builder.query<PhotoComment[], number>({
      query: (photoId) => `/api/photos/${photoId}/comments`,
      transformResponse: (response: PhotoCommentsDto): PhotoComment[] =>
        response.comments ?? [],
      providesTags: (_result, _error, photoId) => [
        { type: "PhotoComments", id: `LIST_${photoId}` },
      ],
    }),

    createPhotoComment: builder.mutation<
      PhotoComment,
      { photoId: number; content: string }
    >({
      query: ({ photoId, content }) => ({
        url: `/api/photos/${photoId}/comments`,
        method: "POST",
        body: { content },
      }),
      transformResponse: (response: PhotoCommentDto): PhotoComment =>
        response.comment,
      invalidatesTags: (_result, _error, { photoId }) => [
        { type: "PhotoComments", id: `LIST_${photoId}` },
        { type: "Photos", id: photoId },
        { type: "Photos", id: "LIST" },
      ],
    }),

    deletePhotoComment: builder.mutation<
      { message: string },
      { photoId: number; commentId: number }
    >({
      query: ({ photoId, commentId }) => ({
        url: `/api/photos/${photoId}/comments/${commentId}`,
        method: "DELETE",
      }),
      transformResponse: (response: DeleteCommentDto) => ({
        message: response.message,
      }),
      invalidatesTags: (_result, _error, { photoId }) => [
        { type: "PhotoComments", id: `LIST_${photoId}` },
        { type: "Photos", id: photoId },
        { type: "Photos", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyPhotosQuery,
  useGetUserPhotosQuery,
  useDeletePhotoMutation,
  useTogglePhotoLikeMutation,
  useGetPhotoCommentsQuery,
  useCreatePhotoCommentMutation,
  useDeletePhotoCommentMutation,
} = photoApi;
