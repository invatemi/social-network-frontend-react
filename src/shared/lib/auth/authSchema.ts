import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .min(1, "Почта обязательна")
    .email("Некорректный формат почты")
    .trim()
    .toLowerCase(),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
});

export type AuthFormData = z.infer<typeof authSchema>;
