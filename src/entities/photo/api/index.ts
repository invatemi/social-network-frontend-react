export { photoApi } from "./photoApi";
export type { PhotoDto, PhotoComment, PhotoCommentAuthor } from "./photoApi";
export {
  useGetMyPhotosQuery,
  useGetUserPhotosQuery,
  useDeletePhotoMutation,
  useTogglePhotoLikeMutation,
  useGetPhotoCommentsQuery,
  useCreatePhotoCommentMutation,
  useDeletePhotoCommentMutation,
} from "./photoApi";
