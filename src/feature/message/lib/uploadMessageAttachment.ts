import type {
  MessageUploadUrlData,
  SendMessageAttachmentInput,
} from "@/entities/message/api/messagesApi";

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

type FetchMessageUploadUrl = (args: {
  chatId: number;
  contentType: string;
  fileName: string;
  sizeBytes: number;
}) => Promise<MessageUploadUrlData>;

export const validateMessageFiles = (files: File[]): File[] => {
  if (files.length > MAX_ATTACHMENTS) {
    throw new Error(`Можно прикрепить не более ${MAX_ATTACHMENTS} файлов`);
  }

  for (const file of files) {
    if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error(`Файл «${file.name}» превышает лимит 20 МБ`);
    }
  }

  return files;
};

export const uploadMessageAttachment = async (
  chatId: number,
  file: File,
  fetchUploadUrl: FetchMessageUploadUrl
): Promise<SendMessageAttachmentInput> => {
  let uploadData: MessageUploadUrlData;

  try {
    uploadData = await fetchUploadUrl({
      chatId,
      contentType: file.type || "application/octet-stream",
      fileName: file.name,
      sizeBytes: file.size,
    });
  } catch {
    throw new Error("Не удалось получить URL для загрузки файла");
  }

  const response = await fetch(uploadData.uploadUrl, {
    method: uploadData.method,
    headers: uploadData.headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить файл в хранилище");
  }

  return {
    url: uploadData.publicUrl,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    objectKey: uploadData.key,
  };
};

export const uploadMessageAttachments = async (
  chatId: number,
  files: File[],
  fetchUploadUrl: FetchMessageUploadUrl
): Promise<SendMessageAttachmentInput[]> => {
  const valid = validateMessageFiles(files);
  const uploaded: SendMessageAttachmentInput[] = [];
  for (const file of valid) {
    uploaded.push(await uploadMessageAttachment(chatId, file, fetchUploadUrl));
  }
  return uploaded;
};
