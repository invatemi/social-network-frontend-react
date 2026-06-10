import type { AvatarUploadUrlData } from "@/entities/user/api/userApi";

type FetchAvatarUploadUrl = (args: {
  contentType: string;
  fileName: string;
}) => Promise<AvatarUploadUrlData>;

export const uploadAvatarToStorage = async (
  file: File,
  fetchUploadUrl: FetchAvatarUploadUrl
): Promise<string> => {
  let uploadData: AvatarUploadUrlData;

  try {
    uploadData = await fetchUploadUrl({
      contentType: file.type,
      fileName: file.name,
    });
  } catch {
    throw new Error("Не удалось получить URL для загрузки аватара");
  }

  const response = await fetch(uploadData.uploadUrl, {
    method: uploadData.method,
    headers: uploadData.headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить файл аватара в хранилище");
  }

  return uploadData.publicUrl;
};
