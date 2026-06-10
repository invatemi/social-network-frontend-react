import { useState, useEffect } from "react";
import { UserProfile } from "@/entities/user/lib";

type UseUserDetailFormReturn = {
  username: string;
  email: string;
  bio: string;
  location: string;
  setUsername: (val: string) => void;
  setEmail: (val: string) => void;
  setBio: (val: string) => void;
  setLocation: (val: string) => void;
  isProfileChanged: boolean;
  syncWithUser: (user: UserProfile | null) => void;
};

/**
 * Хук useUserDetailForm
 * 
 * Управляет формой редактирования профиля:
 * - Синхронизация полей с данными пользователя из Redux
 * - Отслеживание изменений для валидации
 * - Управление состоянием полей ввода
 * 
 * @param initialUser - Текущие данные пользователя для инициализации формы
 * @returns Объект с полями формы, сеттерами и флагом изменений
 */
export const useUserDetailForm = (initialUser: UserProfile | null): UseUserDetailFormReturn => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const syncWithUser = (user: UserProfile | null) => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
    }
  };

  useEffect(() => {
    syncWithUser(initialUser);
  }, [
    initialUser?.id,
    initialUser?.username,
    initialUser?.email,
    initialUser?.bio,
    initialUser?.location,
  ]);

  const isProfileChanged = 
    username !== initialUser?.username || 
    email !== initialUser?.email ||
    bio !== initialUser?.bio ||
    location !== initialUser?.location;

  return {
    username,
    email,
    bio,
    location,
    setUsername,
    setEmail,
    setBio,
    setLocation,
    isProfileChanged,
    syncWithUser,
  };
};