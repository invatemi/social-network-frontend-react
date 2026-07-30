import type { PostImageUploadUrlData } from "@/entities/post/api/postApi";

type FetchPostImageUploadUrl = (args: {
  contentType: string;
  fileName: string;
}) => Promise<PostImageUploadUrlData>;

export const uploadPostImageToStorage = async (
  file: File,
  fetchUploadUrl: FetchPostImageUploadUrl
): Promise<string> => {
  let uploadData: PostImageUploadUrlData;

  try {
    uploadData = await fetchUploadUrl({
      contentType: file.type || "image/jpeg",
      fileName: file.name,
    });
  } catch {
    throw new Error("Не удалось получить URL для загрузки изображения");
  }

  const response = await fetch(uploadData.uploadUrl, {
    method: uploadData.method,
    headers: uploadData.headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить изображение в хранилище");
  }

  return uploadData.publicUrl;
};
