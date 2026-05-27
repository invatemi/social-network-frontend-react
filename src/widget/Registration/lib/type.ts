import { z } from "zod";

export const registrationSchema = z.object({
    email: z.string()
            .min(1, "Почта обязательна")
            .email("Некорректный формат почты")
            .trim()
            .toLowerCase(),

    username: z.string()
                .min(3, "Минимум 3 символа")
                .max(20, "Максимум 20 символов")
                .regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _")
                .trim(),

    password : z.string()
                .min(8, "Минимум 8 символов")
                .regex(/[A-Z]/, "Хотя бы одна заглавная буква")
                .regex(/[a-z]/, "Хотя бы одна строчная буква")
                .regex(/[0-9]/, "Хотя бы одна цифра"),

    confirmPassword: z.string().min(1, "Подтвердите пароль"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
})

export type RegistrationFormData = z.infer<typeof registrationSchema>;