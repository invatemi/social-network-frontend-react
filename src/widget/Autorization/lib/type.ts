import { z } from "zod"

export const authSchema = z.object({
    username: z.string().min(1, "Юзернейм обязателен").trim(),
    password : z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

export type AuthFormData = z.infer<typeof authSchema>